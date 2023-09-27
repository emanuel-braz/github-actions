(() => {
    var input = `* feat: add enhanced release notes feature
## New Contributors
* @emanuel-braz made their first contribution in https://github.com/emanuel-braz/github-actions/pull/1`;

    const lines = input.split('\n');
    const filteredLines = lines.filter((line) => !/^## What's Changed|^## New Contributors|^\* @|^\*\*Full Changelog\*\*:/.test(line));

    const output = filteredLines.map((line) => {
        const index = line.lastIndexOf(' by @');
        if (index !== -1) {
          return line.substring(0, index);
        }
        return line;
      }).filter(Boolean).join('\n');
    var result = output.trim();

    

    console.log(result);

//     const inputString = `* feat: add enhanced release notes feature
// ## New Contributors
// * @emanuel-braz made their first contribution in https://github.com/emanuel-braz/github-actions/pull/1`;

// // Split the input string into lines
// const lines = inputString.split('\n');

// // Filter out lines starting with "## New Contributors" or "* @"
// const filteredLines = lines.filter((line) => !/^## New Contributors|^\* @/.test(line));

// // Join the filtered lines back into a single string
// const resultString = filteredLines.join('\n');

// console.log(resultString);
})();