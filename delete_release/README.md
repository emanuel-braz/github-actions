### Inputs (FILTERS)

#### tag
**Optional** Filter by tag.

#### use_latest_pre_release
**Optional** If true, the latest pre-release will be used to filter the release. Default `false`. Up to 30 releases.

#### use_latest_published_release
**Optional** If true, the latest release will be used to filter the release. Default `false`. Up to 30 releases.

#### use_latest_draft
**Optional** If true, the latest draft will be used to filter the release. Default `false`. Up to 30 releases.

#### verbose
**Optional** Whether to print verbose output. Default `false`.

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
          tag: v0.0.1 # this is the tag to find the release to be deleted
          verbose: true
          token: ${{ secrets.GITHUB_TOKEN }}
```