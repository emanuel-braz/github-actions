require('child_process')
    .execSync(
        'npm install openai',
        { cwd: __dirname }
    );

const openai = require('openai');

class GptService {

  constructor(apiKey) {
    console.log('Initializing OpenAI client...');
    
    this.apiKey = apiKey;
    this.openaiClient = new openai.OpenAI({ apiKey: this.apiKey });
  }

  async chatCompletions(chatCompletionParams) {

    try {
      console.log('Generating chat completions...');
      
      const response = await this.openaiClient.chat.completions.create(chatCompletionParams);
      return response;
    } catch (error) {
      console.error('[chatCompletions]', error);
      throw error;
    }
  }

  async generateReleaseNotes(pullRequestTitles, prompt, maxTokens, model) {
    try {

      console.log('Generating release notes...');

      const response = await this.openaiClient.chat.completions.create({
        messages: [
          {
            content: prompt || 'Generate enhanced release notes for new app features. The notes must be commercial, generic and succinct.',
            role: 'system',
          },
          {
            content: pullRequestTitles,
            role: 'user',
          },
        ],
        max_tokens: parseInt(maxTokens) || 500,
        n: 1,
        model: model || 'gpt-3.5-turbo',
      });

      const generatedNotes = response.choices[0].message.content;
      return generatedNotes;
    } catch (error) {
      console.error('Error generating release notes:', error);
      throw error;
    }
  }
}

module.exports = GptService;