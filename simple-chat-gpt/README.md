## Generate message using OpenAI Chat GPT

First create a secret in your repository called `OPENAI_KEY` with your OpenAI API key.
https://platform.openai.com/account/api-keys

Then create a workflow file (e.g. `.github/workflows/simple_chat_gpt.yml`) with the following content:

```yaml
jobs:
  ask_gpt:
    runs-on: ubuntu-latest

    outputs:
      message: ${{ steps.chat.outputs.message }}

    steps:
      - name: Ask question
        id: chat
        uses: emanuel-braz/github-actions/simple-chat-gpt@0.0.11
        with:
          prompt: Who was Alberto Santos-Dumont?
          openai_key: ${{ secrets.OPENAI_KEY }}

      - name: Print message
        run: |
          echo "About Alberto Santos-Dumont:"
          echo "${{ steps.chat.outputs.message }}"
```

### Inputs

#### openai_key
**Required** The key to use to access the OpenAI API.

#### prompt
**Required** The prompt to use to generate the message.

#### max_tokens
**Optional** The maximum number of tokens to generate. Defaults to `500`.

#### model
**Optional** The model to use. Defaults to `gpt-3.5-turbo`.

---
### Outputs

#### message
The generated message.