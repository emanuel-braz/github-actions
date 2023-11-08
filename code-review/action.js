require('child_process')
    .execSync(
        'npm install @actions/core @actions/github parse-diff minimatch fs',
        { cwd: __dirname }
    );

let parse = require('parse-diff');
const minimatch = require('minimatch');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const SimpleChatGptService = require('../services/simple_chat_gpt_service.js');
const ChatCompletionParams = require('../services/gpt/chat_completion_params.js');
const Logger = require('../utils/logger.js');

const logger = new Logger(true, core);
const GITHUB_TOKEN = core.getInput("token");
const OPENAI_API_KEY = core.getInput("openai_key");
const OPENAI_API_MODEL = core.getInput("openai_key_model");
const overridePrompt = core.getInput("override_prompt");
const appendPrompt = core.getInput("append_prompt");
const maxTokens = core.getInput("max_tokens");
const excludePatterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

const octokit = github.getOctokit(GITHUB_TOKEN);

async function getPRDetails() {
    const { repository, number } = JSON.parse(
        fs.readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
    );
    const prResponse = await octokit.pulls.get({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
    });
    return {
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
        title: prResponse.data.title ?? "",
        description: prResponse.data.body ?? "",
    };
}

async function getDiff(owner, repo, pull_number) {
    const response = await octokit.pulls.get({
        owner,
        repo,
        pull_number,
        mediaType: { format: "diff" },
    });
    // @ts-expect-error - response.data is a string
    return response.data;
}

async function analyzeCode(parsedDiff, prDetails) {
    const comments = []; //Array<{ body: string; path: string; line: number }>

    for (const file of parsedDiff) {
        if (file.to === "/dev/null") continue; // Ignore deleted files
        for (const chunk of file.chunks) {
            
            const messages = createMessages(file, chunk, prDetails);
            const aiResponse = await getAIResponse(messages);
            if (aiResponse) {
                const newComments = createComment(file, chunk, aiResponse);
                if (newComments) {
                    comments.push(...newComments);
                }
            }
        }
    }
    return comments;
}

function createMessages(file, chunk, prDetails) {
    const instructionJsonFormat = `- Always provide the response in following JSON format:  [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]`;

    var contentSystemMessage = `You are a senior software engineer and your task is to review pull requests for possible bugs or bad development practices. Follow the instructions below:
- You will provide suggestions only if there are issues or bugs in the code, otherwise return an empty array.
- Do not give positive comments or compliments.
- Don't suggest removing empty line or adding newline at end of file.
- Don't suggest to remove trailing or leading whitespace.
- Don't suggest to remove the spaces.
- Don't suggest adding comment to code.
- Do use the given pull request title and description only for the overall context and only comment the code.`;

    if (overridePrompt) {
        contentSystemMessage = overridePrompt;
    }

    contentSystemMessage = `${contentSystemMessage}\n${instructionJsonFormat}`;

    if (appendPrompt) {
        contentSystemMessage = `${contentSystemMessage}\n\n${appendPrompt}`;
    }

    var systemPrompt = 
        {
            content: contentSystemMessage,
            role: "system",
        };

    let userPrompt = 
        {
            content: `Review the following code diff in the file "${file.to}" and take the pull request title and description into account when writing the response.
  
Pull request title: ${prDetails.title}
Pull request description:

---
${prDetails.description}
---

Git diff to review:

\`\`\`diff
${chunk.content}
${chunk.changes
            // @ts-expect-error - ln and ln2 exists where needed
            .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
            .join("\n")}
\`\`\`
        `,
            role: "user",
        };

    return [systemPrompt, userPrompt];
}

async function getAIResponse(messages) {

    logger.log(`Max tokens: ${maxTokens}`);

    try {
        const chatCompletionParams = new ChatCompletionParams({
            messages: messages,
            model: OPENAI_API_MODEL,
            temperature: 0,
            max_tokens: parseInt(maxTokens),
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const simpleChatGptService = new SimpleChatGptService(OPENAI_API_KEY);
        const response = await simpleChatGptService.fromParams({ chatCompletionParams });

        const result = response?.trim() || "[]";
        logger.log(`AI response: ${result}`);
        return JSON.parse(result);
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

// Array<{ body: string; path: string; line: number }>
function createComment(file, chunk, aiResponses) {
    return aiResponses.flatMap((aiResponse) => {
        if (!file.to) {
            return [];
        }
        return {
            body: aiResponse.reviewComment,
            path: file.to,
            line: Number(aiResponse.lineNumber),
        };
    });
}

async function createReviewComment(owner, repo, pull_number, comments) {
    await octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        comments,
        event: "COMMENT",
    });
}

async function main() {

    const prDetails = await getPRDetails();
    let diff; // string | null
    const eventData = JSON.parse(
        fs.readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
    );

    if (eventData.action === "opened") {
        diff = await getDiff(
            prDetails.owner,
            prDetails.repo,
            prDetails.pull_number
        );
    } else if (eventData.action === "synchronize") {
        const newBaseSha = eventData.before;
        const newHeadSha = eventData.after;

        const response = await octokit.repos.compareCommits({
            headers: {
                accept: "application/vnd.github.v3.diff",
            },
            owner: prDetails.owner,
            repo: prDetails.repo,
            base: newBaseSha,
            head: newHeadSha,
        });

        diff = String(response.data);
    } else {
        console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
        return;
    }

    if (!diff) {
        console.log("No diff found");
        return;
    }

    const parsedDiff = parse(diff);

    const filteredDiff = parsedDiff.filter((file) => {
        return !excludePatterns.some((pattern) =>
            minimatch.minimatch(file.to ?? "", pattern)
        );
    });

    const comments = await analyzeCode(filteredDiff, prDetails);
    if (comments.length > 0) {
        await createReviewComment(
            prDetails.owner,
            prDetails.repo,
            prDetails.pull_number,
            comments
        );
    }
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
