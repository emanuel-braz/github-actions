### Inputs (FILTERS)

#### name
**Required** The name of the release. Default `"Release"`.
#### body
**Optional** The body of the release.

#### draft
**Optional** Whether to create a draft (unpublished) release. Default `false`.

#### pre_release
**Optional** Whether to identify the release as a prerelease. Default `true`.

#### tag
**Optional** The name of the tag to use or create.

#### verbose
**Optional** Whether to print verbose output. Default `false`.

#### force_update_published_release
**Optional** Whether to force update the release if it is already published and tag already exists. Tag is used to find the release. Default `false`.

#### target
**Optional** The commit SHA or branch to tag. Default is the principal branch.

#### generate_release_notes
**Optional** Whether to generate release notes for the release. Default `false`.

#### use_latest_pre_release
**Optional** Whether to use the latest pre-release to update with new tag and new data. (In this case the input tag is not used to find existing release) Default `false`.

#### token
**Required** The token to use to create the release. Use `"${{ secrets.GITHUB_TOKEN }}"`.

---

#### Example usage

```yaml
release:
    runs-on: ubuntu-latest
    name: A job to release a new version
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Release Action
        uses: emanuel-braz/action-release@v0.0.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          name: ${{ github.event.inputs.name }}
          body: ${{ github.event.inputs.body }}
          tag: ${{ github.event.inputs.tag }}
          draft: ${{ github.event.inputs.draft }}
          pre_release: ${{ github.event.inputs.pre_release }}
          verbose: ${{ github.event.inputs.verbose }}
          force_update_published_release: ${{ github.event.inputs.force_update_published_release }}
          target: ${{ github.event.inputs.target }}
          generate_release_notes: ${{ github.event.inputs.generate_release_notes }}
          use_latest_pre_release: ${{ github.event.inputs.use_latest_pre_release }}
```