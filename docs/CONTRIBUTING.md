## Contributing

All contributions are welcomed. We are a small team that devote some of our off time to fixing bugs or adding new features. We appreciate any feedback, or ideas.

If you want to work on something, please fork the repo, and create a branch. As soon as you make the first commit, create a PR and prefix with [WIP] this will let other people know that there's some progress going on, and avoid multiple people working on the same feature. This will also let maintainers see if a PR is heading in the right direction, and avoid wasting everyone's time.

A checkbox list is also preferred as that will let us know the progress of the PR in terms of completion.

## Advice for new contributors

Start small. Limit PRs to one bug fix, or one feature. If the PRs are concise they are easier to get tested and merged. If you have any questions on the structure of the code don't be afraid to ask questions.

## A word on package manager usage

We had a [poll](https://github.com/ide-stories/vscode-stories/issues/106) as to which package manager was more popular, and decided to use yarn. The decision wasn't taken lightly as we understand not everyone might use yarn.

There are several issues with using multiple package managers, some highlighted in the poll, but mainly we care about lock files getting out of sync which can also create issues with tracking changes on those lock files.

You can choose to use npm or pnpm for the purpose of local development, but if you change package.json dependencies and you are submitting a PR we expect an update to yarn.lock.

## Development Setup

### Requirements

- node
- yarn
- git
- postgress for api https://github.com/ide-stories/vscode-stories-api

### Steps

```
git clone https://github.com/ide-stories/vscode-stories.git
cd vscode-stories
yarn install
```

### Scripts

These are the scripts for dev:

- webpack-dev: watches and compiles any TS file changes
- svelte-dev: watches and compiles any svelte file changes
- dev: runs both of the previous scripts
- webpack: compiles TS one time
- svelte-build: compiles svelte one time

> NB: Anytime you launch webpack-dev, or webpack process.env.NODE_ENV is set to dev. This means you need to have the api running on localhost:8080

Misc:

- watch: watches for TS errors and warnings

Once the code is compiled or on watch, you can hit `F5` which will bring up another instance of vscode with the extension running. If you make a change to the source code, you need to reload the extension. Either by clicking on the refresh button on the debug toolbar or bring up the command palette and do Window Reload.
