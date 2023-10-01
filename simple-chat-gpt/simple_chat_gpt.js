require('child_process')
    .execSync(
        'npm install @actions/core',
        { cwd: __dirname }
    );

const core = require('@actions/core');
const Logger = require('../utils/logger.js');
const SimpleChatGptService = require('../services/simple_chat_gpt_service.js');

class SimpleChatGpt {

    constructor() {
        this.logger = new Logger(false, core);
    }

    async call() {

        try {
            const openaiKey = core.getInput('openai_key') || process.env.OPENAI_KEY;
            const prompt = core.getInput('prompt') || 'Say only this: "Hello World from SimpleChatGpt!"';
            const maxTokens = core.getInput('max_tokens') || 500
            const model = core.getInput('model') || 'gpt-3.5-turbo';

            const simpleChatGptService = new SimpleChatGptService(openaiKey);
            const message = await simpleChatGptService.call({prompt, maxTokens, model});
            core.setOutput('message', message);
            return message;
        } catch (error) {
            this.logger.log(error);
            core.setFailed(error.message);
        }

    }
}

module.exports = SimpleChatGpt;