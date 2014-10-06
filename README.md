# Autoprefixer Core [![Build Status](https://travis-ci.org/postcss/autoprefixer-core.png)](https://travis-ci.org/postcss/autoprefixer-core)

<img align="right" width="94" height="71" src="http://postcss.github.io/autoprefixer/logo.svg" title="Autoprefixer logo by Anton Lovchikov">

Autoprefixer is a tool to parse CSS and add vendor prefixes using values
from [Can I Use].

This is core package to build Autoprefixer plugin for some environment
(like [grunt‑autoprefixer]). For end-user documentation, features
and plugins list visit [main Autoprefixer] project.

Sponsored by [Evil Martians]. Based on [PostCSS] framework.

[grunt‑autoprefixer]: https://github.com/nDmitry/grunt-autoprefixer
[main Autoprefixer]:  https://github.com/postcss/autoprefixer
[Evil Martians]:      http://evilmartians.com/
[Can I Use]:          http://caniuse.com/
[PostCSS]:            https://github.com/postcss/postcss

## Quick Example

Write your CSS rules without vendor prefixes (in fact, forget about them
entirely):

```css
:fullscreen a {
    transition: transform 1s;
}
```

Process your CSS by Autoprefixer:

```js
var autoprefixer = require('autoprefixer-core');
var prefixed = autoprefixer.process(css).css;
```

It will use the data based on current browser popularity and property support
to apply prefixes for you:

```css
:-webkit-full-screen a {
    -webkit-transition: -webkit-transform 1s;
            transition: transform 1s;
}
:-moz-full-screen a {
    transition: transform 1s;
}
:-ms-fullscreen a {
    transition: transform 1s;
}
:fullscreen a {
    -webkit-transition: -webkit-transform 1s;
            transition: transform 1s;
}
```

## Usage

To process your CSS you need to make 2 steps:

1. Build processor for your options and browsers supported in your project.
2. Process CSS throw this processor.

Function `autoprefixer(options)` returns new processor object:

```js
var processor = autoprefixer({ browsers: ['> 1%', 'IE 7'], cascade: false });
```

There are 2 options:

* `browsers` (array): list of browsers, which are supported in your project.

  You can directly specify browser version (like `iOS 7`) or use selections
  (like `last 2 version` or `> 5%`). [Full browsers documentation] is available
  on main Autoprefixer page.

  By default, Autoprefixer uses
  `'> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'`. You can get current
  default list from `autoprefixer.default` property.
* `cascade` (boolean): should Autoprefixer uses [Visual Cascade],
  if CSS will be uncompressed.

Processor object had:

* `.process(css, opts)` method, which will add prefixes to `css`.
* `.info()` method, which returns debug information: which browsers are selected
  and which properties will be prefixed
* `.postcss` property returns [PostCSS] processor to use in chain
  with other [PostCSS processors].

You can use processor object to process several CSS files
to increase perfomance.

There are `autoprefixer.process()`, `autoprefixer.info()`
and `autoprefixer.postcss` shortcuts, which use default browsers and options.

[Full browsers documentation]: https://github.com/postcss/autoprefixer#browsers
[PostCSS processors]:    https://github.com/postcss/postcss#built-with-postcss
[Visual Cascade]:              https://github.com/postcss/autoprefixer#visual-cascade
[PostCSS]:                     https://github.com/postcss/postcss

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

  * `inline: true` to force inline map to CSS annotation comment.
    You can shortcut `map { inline: true }` to `map: 'inline'`.
  * `prev` (string or object): map content from previous processing step
    (like Sass compilation).

  If you set `map: false`, PostCSS will remove source map.

You can read more about the source map options in [PostCSS documentation].

[PostCSS documentation]: https://github.com/postcss/postcss#source-map-1
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

[Autoprefixer demo]: http://jsfiddle.net/simevidas/udyTs/show/light/

## Debug

You can check which browsers are selected and which properties will be prefixed:

```js
info = autoprefixer({ browsers: ['last 1 version'] }).info();
console.log(info);
```
