# Autoprefixer Core [![Build Status][ci-img]][ci]

<img align="right" width="94" height="71"
     src="http://postcss.github.io/autoprefixer/logo.svg"
     title="Autoprefixer logo by Anton Lovchikov">

[PostCSS] plugin to parse CSS and add vendor prefixes using values
from [Can I Use].

This is core package to build Autoprefixer plugin for some environment
(like [grunt‑autoprefixer]). For end-user documentation, features
and plugins list visit [main Autoprefixer] project.

<a href="https://evilmartians.com/?utm_source=autoprefixer-core">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[grunt‑autoprefixer]: https://github.com/nDmitry/grunt-autoprefixer
[main Autoprefixer]:  https://github.com/postcss/autoprefixer
[Can I Use]:          http://caniuse.com/
[PostCSS]:            https://github.com/postcss/postcss
[ci-img]:             https://travis-ci.org/postcss/autoprefixer-core.svg
[ci]:                 https://travis-ci.org/postcss/autoprefixer-core

## Quick Example

Write your CSS rules without vendor prefixes (in fact, forget about them
entirely):

```css
:fullscreen a {
    display: flex
}
```

Process your CSS by Autoprefixer:

```js
var autoprefixer = require('autoprefixer-core');
var postcss      = require('postcss');

postcss([ autoprefixer ]).process(css).then(function (result) {
    result.warnings().forEach(function (warn) {
        console.warn(warn.toString());
    });
    console.log(result.css);
});
```

It will use the data based on current browser popularity and property support
to apply prefixes for you:

```css
:-webkit-full-screen a {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex
}
:-moz-full-screen a {
    display: flex
}
:-ms-fullscreen a {
    display: -ms-flexbox;
    display: flex
}
:fullscreen a {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
}
```

## Usage

To process your CSS you need to make 3 steps:

1. Build plugin for your options and browsers supported in your project.
2. Add this plugin to PostCSS processor.
2. Process CSS through this processor.

Function `autoprefixer(options)` returns new PostCSS plugin:

```js
var plugin = autoprefixer({ browsers: ['> 1%', 'IE 7'], cascade: false });
```

There are 4 options:

* `browsers` (array): list of browsers, which are supported in your project.
  You can directly specify browser version (like `iOS 7`) or use selections
  (like `last 2 version` or `> 5%`). See [Browserslist docs] for available
  queries and default value.
* `cascade` (boolean): should Autoprefixer uses [Visual Cascade],
  if CSS is uncompressed. Default: `true`
* `add` (boolean): should Autoprefixer add prefixes. Default is `true`.
* `remove` (boolean): should Autoprefixer [remove outdated] prefixes.
  Default is `true`.

Plugin object has `info()` method for [debug purpose].

You can use PostCSS processor to process several CSS files
to increase perfomance.

See [PostCSS API] for plugin usage documentation.
See all [PostCSS Runner Guidelines] for best practices.

[PostCSS Runner Guidelines]: https://github.com/postcss/postcss/blob/master/docs/guidelines/runner.md
[Browserslist docs]:         https://github.com/ai/browserslist
[remove outdated]:           https://github.com/postcss/autoprefixer/#outdated-prefixes
[Visual Cascade]:            https://github.com/postcss/autoprefixer#visual-cascade
[debug purpose]:             #debug
[PostCSS API]:               https://github.com/postcss/postcss/blob/master/docs/api.md

## CSS Processing

Method `process(css, opts)` from Autoprefixer processor is a PostCSS’s method.

You must set `from` and `to` options with file names to generates corrects
source maps and useful error messages.

Options:

* `from` (path): file path to origin CSS files.
* `to` (path): file path to future CSS file, which will
  contain processed CSS with prefixes.
* `safe` (boolean): enables [Safe Mode] in PostCSS. By default `false`.
* `map` contains options for source maps:

  * `inline: false` to force save map to separated file, instead of inline it
    to CSS in special comment by base64.
  * `prev` (string or object): map content from previous processing step
    (like Sass compilation).

  If you set `map: false`, PostCSS will remove source map.

You can read more about the source map options in [PostCSS documentation].

[PostCSS documentation]: https://github.com/postcss/postcss#source-map
[Safe Mode]:             https://github.com/postcss/postcss#safe-mode

## PostCSS Chain

You parse CSS only once and then process it through array of PostCSS processors.

For example, you can use [gulp-postcss]:

```js
var postcss    = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('css', function () {
    var processors = [
        require('autoprefixer')('last 1 version'),
        require('css-mqpacker'),
        require('csswring')
     ];
     return gulp.src('./src/style.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dest'));
});
```

[gulp-postcss]: https://github.com/w0rm/gulp-postcss

## Safe Mode

PostCSS has a special safe mode to parse broken CSS. If you set the `safe: true`
option to the `process` method, it will  parse `a {` as `a {}`:

```js
autoprefixer.process('a {');                 // will throw “Unclosed block”
autoprefixer.process('a {', { safe: true }); // will process as a closed block
```

It is useful for legacy code when using several hacks, or interactive
tools with live input, like [Autoprefixer demo].

[Autoprefixer demo]: http://simevidas.jsbin.com/gufoko/quiet

## Debug

You can check which browsers are selected and which properties will be prefixed:

```js
info = autoprefixer({ browsers: ['last 1 version'] }).info();
console.log(info);
```
