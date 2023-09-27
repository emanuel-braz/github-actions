require('child_process')
    .execSync(
        'npm install axios',
        { cwd: __dirname }
    );

const axios = require('axios');

class GitHubService {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
  }

    filterPrTitles(input) {
        const lines = input.split('\n');

        const filteredLines = lines.filter((line) => !/^## What's Changed|^\*\*Full Changelog\*\*:/.test(line));
        const output = filteredLines.map((line) => {
            const index = line.lastIndexOf(' by @');
            if (index !== -1) {
              return line.substring(0, index);
            }
            return line;
          }).filter(Boolean).join('\n');
        return output.trim();
    }

  async generateReleaseNotes(tagName, previousTagName) {
    try {
      const response = await axios.post(`https://api.github.com/repos/${this.owner}/${this.repo}/releases/generate-notes`, 
        {
            "tag_name": tagName,
            "previous_tag_name": previousTagName
        },
        {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
        }
      );

      if (response.status === 200) {
        var data = response.data.body;
        return this.filterPrTitles(data);
      } else {
        throw new Error(`Error generating release notes`);
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Request error: ${error.response.status} - ${error.response.data.message}`);
      } else if (error.request) {
        throw new Error(`Request error: No response from server`);
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
}

module.exports = GitHubService;