## Generate Enhanced Notes using OpenAI GPT-3.5

First create a secret in your repository called `OPENAI_KEY` with your OpenAI API key.
https://platform.openai.com/account/api-keys

Then create a workflow file (e.g. `.github/workflows/release_notes.yml`) with the following content:

```yaml
name: Generate Enhanced Release Notes
run-name: Action started by ${{ github.actor }}

on: 
  workflow_dispatch:
    inputs:
      tagName:
        description: 'Tag of the release.'
        required: true
        type: string

jobs:
  print_enhanced_release_notes:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Release Notes
        id: release_notes
        uses: emanuel-braz/github-actions/generate-enhanced-notes@0.0.8
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          tag_name: ${{ github.event.inputs.tagName }}
          openai_key: ${{ secrets.OPENAI_KEY }}
          use_previous_tag_latest_release: true
          verbose: true

      - name: Print Release Notes (Use it as you want)
        run: echo "${{ steps.release_notes.outputs.enhanced_notes }}"
```

### Inputs (FILTERS)

#### tag_name
**Required** The name of the tag.

#### token
**Required** The token to use to create the release. Use `"${{ secrets.GITHUB_TOKEN }}"`.

#### openai_key
**Required** The key to use to generate the release notes. Use `"${{ secrets.OPENAI_KEY }}"`.

#### previous_tag_name
**Optional** The name of the previous tag. if "usePreviousTagLatestRelease" is true, this is ignored.

#### use_previous_tag_latest_release
**Optional** Whether to use the latest release of the previous tag to generate the release notes. Default `false`.

#### verbose
**Optional** Whether to print verbose output. Default `false`.

## TODO
- [ ] Add support for multiple languages
- [ ] Add support for multiple models