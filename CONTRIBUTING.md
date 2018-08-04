<img width="94" height="71" src="logo.svg" title="Autoprefixer logo by Anton Lovchikov">


# Contributing to Autoprefixer
Please feel free to contribute to Autoprefixer by submitting Pull Requests to add new features, ehancements, bug fixes, etc. If you're not sure whether a PR should be created for something, [open an issue](https://github.com/postcssAautoprefixer/issues) to ask about it first. Check the specific section depending on the type of contribution you want to make.

 * [Getting started](#getting-started)
 * [Adding a new prefix](#adding-a-prefix)
 * [Changing an existing prefix](#changing-an-existing-prefix)
 * [Fixing bugs](#fixing-bugs)
 * [Filing issues](#filing-issues)
 * [Tips and guidelines](#guidelines-and-tips)

Once your PR is accepted it will incorporated into the next main release of Autoprefixer.

**Important**: Autoprefixer works by pulling data from [caniuse](https://caniuse.com/). Therefore it's important that support for a particular CSS feature is available there before we can enable support for it here. You can check the listing of features that need to be added [here](https://caniuse.com/issue-list).

## Getting started
Before you begin contributing make sure you have a [GitHub account](https://github.com/signup/free).
* [Fork the repository](https://github.com/postcssAautoprefixer)
* Clone a copy of it to your computer: `git clone https://github.com/USERNAME/autoprefixer`
* run `yarn install` or `npm install` this will install all dependencies needed to run tests
* File an issue, see [filing issues](#filing-issues)
* Once issue is discussed and accepted, you can begin making the necessary changes

## Adding a prefix
We'll explain how would you go about adding a CSS feature to Autoprefixer. For example, we'll add support for a CSS feature called `background-clip: text`

Note: Remember that the feature that you want to add must also be supported on [caniuse](https://caniuse).

* Create a topic branch from the `master` branch. Like this: `git checkout -b add/background-clip-text`
tip: use 'add', 'fix' or 'enhancement' to indicate on your type of contribution

* To add support for a CSS feature you must call the convert function inside of `data/prefixes.js` and specify three parameters: data, options and a callback. Like this:
  ```
  f(require('caniuse-lite/data/features/background-clip-text'), browsers =>
    prefix(['background-clip'], {
      feature: 'background-clip-text',
      browsers
    })
  )
  ```
* Add a hack to the `libs/hacks` folder using the name of the CSS feature as the filename.

* Create a a class which will extends `Value`. In that hack class change the prefix for IE to -webkit-. See appearance hack. [See complete example](https://github.com/postcss/Autoprefixer/blob/73c7b6ab090a9a9a03869b3099096af00be7eb7d/lib/hacks/background-clip.js)

* Load this hack in `lib/prefixes.js`. [See example](https://github.com/postcss/autoprefixer/blob/73c7b6ab090a9a9a03869b3099096af00be7eb7d/lib/prefixes.js)


Add tests to `test/autoprefixer.test.js` to test that Autoprefixer works with Chrome and Edge browsers adds only -webkit- prefix. [See details here](https://github.com/postcss/autoprefixer/commit/73c7b6ab090a9a9a03869b3099096af00be7eb7d)

## Changing an existing prefix
TODO

## Fixing Bugs
TODO

## Filing issues
Issues, questions, or comments about existing features should be filed as an issue. Support for new features also requires filing a new issue. You can file an issue [here](https://github.com/postcssAautoprefixer/issues).

## Guidelines and tips

* Check for unnecessary whitespace with `git diff --check` before committing
* Make logical, meaningful and brief commits
* Push changes to your local feature branch first, Like this: `git push origin fix/background-image`
* Submit a [Pull Request](https://help.github.com/articles/creating-a-pull-request/) with the description of the feature/fix/enhancement that you want to propose
