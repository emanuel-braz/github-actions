require('child_process')
    .execSync(
        'npm install @actions/core @actions/github',
        { cwd: __dirname }
    );

const core = require('@actions/core');
const github = require('@actions/github');
const { Logger } = require('../utils/logger.js');

const GitHubService = require('../services/github_service.js');
const GptService = require('../services/gpt_service.js');

class GenerateEnhancedNotes {

    async call({ tagName, previousTagName, token, openaiKey, usePreviousTagLatestRelease, owner, repo, verbose }) {

        tagName = tagName || core.getInput('tag_name');
        previousTagName = previousTagName || core.getInput('previous_tag_name');
        token = token || core.getInput('token');
        openaiKey = openaiKey || core.getInput('openai_key');
        usePreviousTagLatestRelease = usePreviousTagLatestRelease || core.getInput('use_previous_tag_latest_release') == 'true';
        verbose = verbose || core.getInput('verbose') == 'true';
        owner = owner || github.context.repo.owner
        repo = repo || github.context.repo.repo

        const api = github.getOctokit(core.getInput('token'));
        const logger = new Logger(verbose, core);

        if (usePreviousTagLatestRelease) {
            var latestRelease = await api.repos.getLatestRelease({
                ...github.context.repo
            });
            previousTagName = latestRelease.data.tag_name;
        }

        const githubService = new GitHubService(token, owner, repo);
        var releasenotes = await githubService.generateReleaseNotes(tagName, previousTagName);
        logger.log(`RELEASE NOTES:\n\n${releasenotes}`);

        const gptService = new GptService(openaiKey);
        var enhancedNotes = await gptService.generateReleaseNotes(releasenotes);
        logger.log(`ENHANCED RELEASE NOTES:\n\n${enhancedNotes}`);

        core.setOutput('enhanced_notes', enhancedNotes);
        return enhancedNotes;
    }
}

module.exports = GenerateEnhancedNotes;