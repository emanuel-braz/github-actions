require('child_process')
    .execSync(
        'npm install openai',
        { cwd: __dirname }
    );

const openai = require('openai');

class GptService {

  constructor(apiKey) {
    this.apiKey = apiKey;
    console.log('Initializing OpenAI client...');
    this.openaiClient = new openai.OpenAI({ apiKey: this.apiKey });
  }

  async generateReleaseNotes(pullRequestTitles) {
    try {

      console.log('Generating release notes...');

      const response = await this.openaiClient.chat.completions.create({
        messages: [
          {
            content: 'Generate enhanced release notes in Portuguese language, for new app features. The notes must be commercial, generic and succinct.',
            role: 'system',
          },
          {
            content: pullRequestTitles,
            role: 'user',
          },
        ],
        max_tokens: 400,
        n: 1,
        model: 'gpt-3.5-turbo',
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