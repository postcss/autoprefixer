<img width="94" height="71" src="logo.svg" title="Autoprefixer logo by Anton Lovchikov">

# Contributing to Autoprefixer

* [Filing Issues](#filing-issues)
* [Getting Started](#getting-started)
* [Adding a Prefix](#adding-a-prefix)


## Filing Issues

- If you have problems with the output CSS from Autoprefixer;
you’ll need to post:

  1. Input CSS.
  2. Output CSS.
  3. Expected output CSS.
  4. Browserslist config. If you use `browsers` or option,
     create Browserslist config first.
  5. Run `npm ls | grep autoprefixer` and check output.

- If Autoprefixer throws error:

  1. Input CSS.
  2. Browserslist config.
  3. Error stacktrace (copy and paste the error message that you get
     so we can identify where the problem is).
  4. Run `npm ls | grep autoprefixer` and check output.
  5. Run `npm ls | grep postcss` and check output.


## Getting Started

Before you begin contributing make sure you have a [GitHub account].

* [Fork the repository](https://github.com/postcss/autoprefixer)
* Clone a copy of it to your computer:
  `git clone https://github.com/USERNAME/autoprefixer` (replace `USERNAME`
  to your GitHub name).
* Ensure that you have the [Yarn](https://yarnpkg.com/) package manager
  installed.
* Run `yarn install` this will install all dependencies needed to run tests.

[GitHub account]: https://github.com/signup/free


## Adding a Prefix

We’ll explain how would you go about adding a CSS feature to Autoprefixer.
For example, we’ll add support for a CSS feature called `background-clip: text`.

Note: Remember that the feature that you want to add must also be supported
on [Can I use](https://caniuse.com/).

1. Create a topic branch from the `master` branch.
   Like this: `git checkout -b background-clip-text`.

2. To add support for a CSS feature you must call the convert function inside
   of `data/prefixes.js` and specify three parameters: data, options
   and a callback. Like this:

   ```js
  f(require('caniuse-lite/data/features/background-clip-text'), browsers =>
    prefix(['background-clip'], {
      feature: 'background-clip-text',
      browsers
    })
  )
   ```

3. If the prefix is simple (`-webkit-` for Safari, `-moz-` for Firefox,
  all use the same syntax) go to step 8.

4. If you need some non-standard behavior for the prefix (`-webkit-` prefix
   for Firefox or different syntax for different browsers) you will need
   to create a “hack”. Create a JS file in the `libs/hacks` folder using
   the name of the CSS feature as the filename.

5. Check out other hacks for examples. In this new class change the prefix
   for `IE` to `-webkit-`. [See complete example](https://github.com/postcss/Autoprefixer/blob/73c7b6ab090a9a9a03869b3099096af00be7eb7d/lib/hacks/background-clip.js)

6. Load the new hack in `lib/prefixes.js`. Load it into `Declaration`
   if you need a prefix for property name. Load it into `Value` if you need
   a prefix for value.

   ```js
  Declaration.hack(require('./hacks/background-clip'))
   ```

7. Create a `.css` and `.out.css` example in `test/cases`. Add this test to
   `test/autoprefixer.test.js`:

   ```js
  it('supports background-clip', () => check('background-clip'))
   ```

   If you need different browsers, change `prefixer()` function in the top
   of test file.

8. Run `yarn test`.
9. Push the branch to GitHub.
10. Open your fork on GitHub an send pull request.
