export const fixtures = {
  insert: {
    simple: {
      startingChunks: ``.split("\n"),
      recordingSteps: JSON.parse(
        `[[0,[]],[3617,[{"range":[{"line":0,"character":0},{"line":0,"character":0}],"rangeOffset":0,"rangeLength":0,"text":"h"}]],[3777,[{"range":[{"line":0,"character":1},{"line":0,"character":1}],"rangeOffset":1,"rangeLength":0,"text":"e"}]],[3854,[{"range":[{"line":0,"character":2},{"line":0,"character":2}],"rangeOffset":2,"rangeLength":0,"text":"l"}]],[4001,[{"range":[{"line":0,"character":3},{"line":0,"character":3}],"rangeOffset":3,"rangeLength":0,"text":"l"}]],[4182,[{"range":[{"line":0,"character":4},{"line":0,"character":4}],"rangeOffset":4,"rangeLength":0,"text":"o"}]],[4302,[{"range":[{"line":0,"character":5},{"line":0,"character":5}],"rangeOffset":5,"rangeLength":0,"text":" "}]],[4423,[{"range":[{"line":0,"character":6},{"line":0,"character":6}],"rangeOffset":6,"rangeLength":0,"text":"w"}]],[4543,[{"range":[{"line":0,"character":7},{"line":0,"character":7}],"rangeOffset":7,"rangeLength":0,"text":"o"}]],[4633,[{"range":[{"line":0,"character":8},{"line":0,"character":8}],"rangeOffset":8,"rangeLength":0,"text":"r"}]],[4718,[{"range":[{"line":0,"character":9},{"line":0,"character":9}],"rangeOffset":9,"rangeLength":0,"text":"l"}]],[4853,[{"range":[{"line":0,"character":10},{"line":0,"character":10}],"rangeOffset":10,"rangeLength":0,"text":"d"}]]]`
      ),
      endingChunks: `hello world`.split("\n"),
    },
  },
  delete: {
    simple: {
      startingChunks: [
        `import App from "./App.svelte";`,
        ``,
        `bye`,
        `  target: document.body,`,
        `  props: {`,
        `    name: "world",`,
        `  },`,
        `});`,
        ``,
        `export default app;`,
        ``,
      ],
      recordingSteps: JSON.parse(
        `[[0,[]],[2036,[]],[2039,[{"range":[{"line":9,"character":18},{"line":9,"character":19}],"rangeOffset":120,"rangeLength":1,"text":""}]],[2280,[{"range":[{"line":9,"character":17},{"line":9,"character":18}],"rangeOffset":119,"rangeLength":1,"text":""}]],[2382,[{"range":[{"line":9,"character":16},{"line":9,"character":17}],"rangeOffset":118,"rangeLength":1,"text":""}]],[2482,[{"range":[{"line":9,"character":15},{"line":9,"character":16}],"rangeOffset":117,"rangeLength":1,"text":""}]],[2582,[{"range":[{"line":9,"character":14},{"line":9,"character":15}],"rangeOffset":116,"rangeLength":1,"text":""}]],[2685,[{"range":[{"line":9,"character":13},{"line":9,"character":14}],"rangeOffset":115,"rangeLength":1,"text":""}]],[2784,[{"range":[{"line":9,"character":12},{"line":9,"character":13}],"rangeOffset":114,"rangeLength":1,"text":""}]],[2886,[{"range":[{"line":9,"character":11},{"line":9,"character":12}],"rangeOffset":113,"rangeLength":1,"text":""}]],[2985,[{"range":[{"line":9,"character":10},{"line":9,"character":11}],"rangeOffset":112,"rangeLength":1,"text":""}]]]`
      ),
      endingChunks: [
        `import App from "./App.svelte";`,
        ``,
        `bye`,
        `  target: document.body,`,
        `  props: {`,
        `    name: "world",`,
        `  },`,
        `});`,
        ``,
        `export def`,
        ``,
      ],
    },
    word: {
      startingChunks: [
        `import App from "./App.svelte";`,
        ``,
        `bye`,
        `  target: document.body,`,
        `  props: {`,
        `    name: "world",`,
        `  },`,
        `});`,
        ``,
        `export def`,
        ``,
      ],
      recordingSteps: JSON.parse(
        `[[0,[]],[1936,[]],[1936,[{"range":[{"line":9,"character":7},{"line":9,"character":10}],"rangeOffset":109,"rangeLength":3,"text":""}]]]`
      ),
      endingChunks: [
        `import App from "./App.svelte";`,
        ``,
        `bye`,
        `  target: document.body,`,
        `  props: {`,
        `    name: "world",`,
        `  },`,
        `});`,
        ``,
        `export `,
        ``,
      ],
    },
    multiline: {
      startingChunks: [
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        ``,
      ],
      recordingSteps: JSON.parse(
        `[[0,[]],[4151,[]],[4154,[{"range":[{"line":0,"character":8},{"line":1,"character":7}],"rangeOffset":8,"rangeLength":31,"text":""}]]]`
      ),
      endingChunks: [`import A.log("hey");`, ``],
    },
    multilineBlock: {
      startingChunks: [
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        `import App from "./App.svelte";`,
        `import App from "./App.svelte";`,
        `import App from "./App.svelte";`,
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        `console.log("hey");`,
        `console.log("hey");`,
        `console.log("hey");`,
        ``,
      ],
      recordingSteps: JSON.parse(
        `[[0,[]],[2920,[]],[2932,[]],[2932,[{"range":[{"line":4,"character":0},{"line":9,"character":0}],"rangeOffset":116,"rangeLength":124,"text":""}]]]`
      ),
      endingChunks: [
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        `import App from "./App.svelte";`,
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        ``,
      ],
    },
  },
  replace: {
    simple: {
      startingChunks: [
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        `import App from "./App.svelte";`,
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        ``,
      ],
      recordingSteps: JSON.parse(
        `[[0,[]],[2287,[{"range":[{"line":4,"character":0},{"line":4,"character":19}],"rangeOffset":116,"rangeLength":19,"text":"log"}]]]`
      ),
      endingChunks: [
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        `import App from "./App.svelte";`,
        `import App from "./App.svelte";`,
        `log`,
        ``,
      ],
    },
    multiline: {
      startingChunks: [
        `import App from "./App.svelte";`,
        `console.log("hey");`,
        ``,
      ],
      recordingSteps: [
        [0, []],
        [
          1768,
          [
            {
              range: [
                { line: 0, character: 3 },
                { line: 1, character: 15 },
              ],
              rangeOffset: 3,
              rangeLength: 44,
              text: 'App from "./App.svelte";\nconsole',
            },
          ],
        ],
      ],
      endingChunks: [`impApp from "./App.svelte";`, `consoley");`, ``],
    },
  },
};
