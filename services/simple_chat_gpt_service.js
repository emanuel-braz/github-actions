const GptService = require('../services/gpt/gpt_service.js');
const ChatCompletionParams = require('../services/gpt/chat_completion_params.js');

class SimpleChatGptService {

  constructor(apiKey) {
    this.service = new GptService(apiKey);
  }

  async call({prompt, maxTokens, model}) {
    try {
      const params = new ChatCompletionParams({
        messages: [
          {
            content: prompt,
            role: 'user',
          },
        ],
        max_tokens: parseInt(maxTokens) || 500,
        n: 1,
        model: model || 'gpt-3.5-turbo',
      });

      const response = await this.service.chatCompletions(params);
      const message = response.choices[0].message.content;
      return message;
    } catch (error) {
      console.error('[SimpleChatGptService]', error);
      throw error;
    }
  }
}

module.exports = SimpleChatGptService;