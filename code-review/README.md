# Code Reviewer

Code Reviewer is a GitHub Action that leverages OpenAI's GPT API to provide intelligent feedback and suggestions on
your pull requests. This powerful tool helps improve code quality and saves developers time by automating the code
review process.

## Features

- Reviews pull requests using OpenAI's chat GPT API.
- Provides intelligent comments and suggestions for improving your code.
- Filters out files that match specified exclude patterns.
- Easy to set up and integrate into your GitHub workflow.

## Setup

1. To use this GitHub Action, you need an OpenAI API key. If you don't have one, sign up for an API key
   at [OpenAI](https://beta.openai.com/signup).

2. Add the OpenAI API key as a GitHub Secret in your repository with the name `openai_key`. You can find more
   information about GitHub Secrets [here](https://docs.github.com/en/actions/reference/encrypted-secrets).

3. Create a `.github/workflows/main.yml` file in your repository and add the following content:

```yaml
name: Code Reviewer
run-name: Action started by ${{ github.actor }}

on:
  pull_request:
    types:
      - opened
      - synchronize

permissions: write-all

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: AI Code Reviewer
        uses: emanuel-braz/github-actions/code-review@0.1.2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          openai_key: ${{ secrets.OPENAI_KEY }}
          max_tokens: 900
          exclude: "**/*.json, **/*.md, **/*.g.dart" # Optional: exclude patterns separated by commas
          append_prompt: |
            - Give a minimum of 0 suggestions and a maximum of 5 suggestions.
            - Translate the comment in all "reviewComment" properties to portuguese (pt-br).
```

## For better control, do that:
* Create a repository variable
  * name it `PROMPT_CODE_REVIEW`
  * Add this as the value
```md
Your task is to review pull requests for possible bugs. Follow the instructions below:

- Provide the response in following JSON format:  [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]`;
- You will provide suggestions only if there are critical issues or bugs in the code, otherwise return an empty array.
- The maximum of suggestions in the response array are 2
- Do use the given pull request title and description only for the overall context and only comment the code;
- If there are no critical issues or bugs, return an empty array
  ```
> 🚨 This line is the most important rule you must keep it, if you are changing the original prompt  
> `- Provide the response in following JSON format:  [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]`;`

Example:
```yaml
name: Code Reviewer
run-name: Action started by ${{ github.actor }}

on:
  pull_request:
    types:
      - opened
      - synchronize

permissions: write-all

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: AI Code Reviewer
        uses: emanuel-braz/github-actions/code-review@0.1.2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          openai_key: ${{ secrets.OPENAI_KEY }}
          max_tokens: 900
          exclude: "**/*.json, **/*.md, **/*.g.dart" # Optional: exclude patterns separated by commas
          override_prompt: ${{ vars.PROMPT_CODE_REVIEW }} # Using variable is more flexible and faster changes
```

- Customize the `exclude` input if you want to ignore certain file patterns from being reviewed.

- Commit the changes to your repository, and Code Reviewer Actions will start working on your future pull requests.

## How It Works

The Code Reviewer GitHub Action retrieves the pull request diff, filters out excluded files, and sends code chunks to
the OpenAI API. It then generates review comments based on the AI's response and adds them to the pull request.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve the GitHub Actions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.