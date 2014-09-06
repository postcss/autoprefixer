# Autoprefixer [![Build Status](https://travis-ci.org/postcss/autoprefixer.png)](https://travis-ci.org/postcss/autoprefixer)

<img align="right" width="94" height="71" src="http://postcss.github.io/autoprefixer/logo.svg" title="Autoprefixer logo by Anton Lovchikov">

Parse CSS and add vendor prefixes to CSS rules using values
from [Can I Use].

Write your CSS rules without vendor prefixes (in fact, forget about them
entirely):

```css
:fullscreen a {
    transition: transform 1s;
}
```

Autoprefixer will use the data based on current browser popularity and property
support to apply prefixes for you. You try in the [interactive demo]
of Autoprefixer.

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

Twitter account for news and releases: [@autoprefixer].

Sponsored by [Evil Martians]. Based on [PostCSS] framework.

[interactive demo]: http://jsfiddle.net/simevidas/udyTs/show/light/
[@autoprefixer]:    https://twitter.com/autoprefixer
[Evil Martians]:    http://evilmartians.com/
[Can I Use]:        http://caniuse.com/
[PostCSS]:          https://github.com/postcss/postcss

## Features

### Write Pure CSS

Working with Autoprefixer is simple: just forget about vendor prefixes
and write normal CSS according to the latest W3C specs. You don’t need
a special language (like Sass) or remember, where you must use mixins.

Autoprefixer supports selectors (like `:fullscreen` and `::selection`),
unit function (`calc()`), at‑rules (`@support` and `@keyframes`) and properties.

Because Autoprefixer is a postprocessor for CSS,
you can also use it with preprocessors such as Sass, Stylus or LESS.

### Flexbox, Filters, etc.

Just write normal CSS according to the latest W3C specs and Autoprefixer
will produce the code for old browsers.

```css
a {
    display: flex;
}
```

compiles to:

```css
a {
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex
}
```

Autoprefixer has [22 special hacks] to fix web browser differences.

[22 special hacks]: https://github.com/postcss/autoprefixer-core/tree/master/lib/hacks

### Only Actual Prefixes

Autoprefixer utilizes the most recent data from [Can I Use]
to add only necessary vendor prefixes.

It also removes old, unnecessary prefixes from your CSS (like `border-radius`
prefixes, produced by many CSS libraries).

```css
a {
    -webkit-border-radius: 5px;
            border-radius: 5px;
}
```

compiles to:

```css
a {
    border-radius: 5px;
}
```

[Can I Use]: http://caniuse.com/

## Browsers

You can specify the browsers you want to target in your project:

* `last 2 versions` targets the last 2 versions for each browser..
* `last 2 Chrome versions` targets the last versions of a specific browser.
* `> 5%` declares browser versions selected by global usage statistics.
* `Firefox > 20` targets versions of Firefox newer than 20.
* `Firefox >= 20` targets versions of Firefox newer than or equal to 20.
* `Firefox < 20` targets versions of Firefox less than 20.
* `Firefox <= 20` targets versions of Firefox less than or equal to 20.
* `Firefox ESR` specifies the latest [Firefox ESR] version.
* `ios 7` will set the browser version directly.
* `none` will not target any browsers.

Blackberry and stock Android browsers will not be used in `last n versions`.
You should add them by name.

Browsers names (case insensitive):

* `Android` for old Android stock browser.
* `BlackBerry` or `bb` for Blackberry browser.
* `Chrome` for Google Chrome.
* `Firefox` or `ff` for Mozilla Firefox.
* `Explorer` or `ie` for Internet Explorer.
* `iOS` or `ios_saf` for iOS Safari.
* `Opera` for Opera.
* `Safari` for desktop Safari.
* `OperaMobile` or `op_mob` for Opera Mobile.
* `OperaMini` or `op_mini` for Opera Mini.
* `ChromeAndroid` or `and_chr` for Chrome for Android
  (mostly same as common `Chrome`).
* `FirefoxAndroid` or `and_ff` for Firefox for Android.
* `ExplorerMobile` or `ie_mob` for Internet Explorer Mobile.

By default, Autoprefixer uses `> 1%, last 2 versions, Firefox ESR, Opera 12.1`:

* Latest [Firefox ESR] is a 24 version.
* Opera 12.1 will be in list until Opera supports non-Blink 12.x branch.

[Firefox ESR]: http://www.mozilla.org/en/firefox/organizations/faq/

## Source Map

Autoprefixer can modify previous source maps (for example, from Sass):
it will autodetect a previous map if it is listed in an annotation comment.

Autoprefixer supports inline source maps too. If an input CSS contains
annotation from the previous step with a map in data:uri, Autoprefixer will
update the source map with prefix changes and inline the new map back into
the output CSS.

## Visual Cascade

Autoprefixer changes CSS indentation to create a nice visual cascade
of prefixes if the CSS is uncompressed:

```css
a {
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
            box-sizing: border-box;
}
```

You can disable cascade by using the `cascade: false` option.

## Disabling

Autoprefixer was designed to have no interface – it just works. If you need
some browser specific hack just write prefixed property after unprefixed.

```css
a {
    transform: scale(0.5);
    -moz-transform: scale(0.6);
}
```

If some prefixes were generated in wrong way, please create issue on GitHub.

But if you do not need Autoprefixer in some part of your CSS,
you can use control comments to disable Autoprefixer.

```css
a {
    transition: 1s; /* it will be prefixed */
}

b {
    /* autoprefixer: off */
    transition: 1s; /* it will not be prefixed */
}
```

Control comments disables Autoprefixer within the whole rule in which
you place it. In the above example, Autoprefixer will be disabled
in the entire `b` rule scope, not only after the comment.

You can also use comments recursively:

```css
/* autoprefixer: off */
@support (transition: all) {
    /* autoprefixer: on */
    a {
        /* autoprefixer: off */
    }
}
```

## FAQ

#### Does it add polyfills for old browsers?

No. Autoprefixer only adds prefixes, not polyfills. There are two reasons:

1. Prefixes and polyfills are very different and need a different API.
   Two separate libraries would be much better.
2. Most of IE polyfills are bad for client performance, as they use slow hacks
   and old IEs often runs on old hardware. Most CSS3 features used only
   for styling should be ignored in old IEs as it is recommended for
   graceful degradation.

#### Why doesn’t gradients work in Firefox?

Make sure that you use correct the [direction syntax].
For example, you should use `to bottom` instead of `top`:

```css
a {
  background: linear-gradient(to bottom, white, black)
}
```

Unfortunately, unprefixed gradients use a different direction syntax and most
examples you find use an old gradient syntax, so be careful and use always the
latest W3C specs with Autoprefixer.

[direction syntax]: https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient

#### Why doesn’t Autoprefixer add prefixes to `border-radius`?

Developers are often surprised by how few prefixes are required today.
If Autoprefixer doesn’t add prefixes to your CSS, check if they’re still
required on [Can I Use].

[Can I Use]: http://caniuse.com/

#### Why doesn’t Autoprefixer support `appearance`?

Unlike `transition`, the `appearance` property is not a part of
any specification. So there is no `appearance`, only `-moz-appearance`
and `-webkit-appearance`.

## Usage

### Grunt

You can use the [grunt-autoprefixer] plugin for Grunt.
Install the npm package and add it to Gruntfile:

```js
grunt.loadNpmTasks('grunt-autoprefixer');
```

[grunt-autoprefixer]: https://github.com/nDmitry/grunt-autoprefixer

### Gulp

In Gulp you can use [gulp-postcss] with `autoprefixer-core` npm package.

```js
gulp.task('autoprefixer', function () {
    var postcss      = require('gulp-postcss');
    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer-core');

    return gulp.src('./src/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dest'));
});
```

With `gulp-postcss` you also can combine Autoprefixer
with [other PostCSS plugins].

[other PostCSS plugins]: https://github.com/postcss/postcss#built-with-postcss
[gulp-postcss]:          https://github.com/w0rm/gulp-postcss

### Other Build Tools:

* **Ruby on Rails**: [autoprefixer-rails]
* **Webpack**: [autoprefixer-loader]
* **Brunch**: [autoprefixer-brunch]
* **Broccoli**: [broccoli-autoprefixer]
* **Middleman**: [middleman-autoprefixer]
* **Mincer**: add `autoprefixer` npm package and enable it:
  `environment.enable('autoprefixer')`.

[middleman-autoprefixer]: https://github.com/porada/middleman-autoprefixer
[broccoli-autoprefixer]:  https://github.com/sindresorhus/broccoli-autoprefixer
[autoprefixer-loader]:    https://github.com/passy/autoprefixer-loader
[autoprefixer-brunch]:    https://github.com/lydell/autoprefixer-brunch
[autoprefixer-rails]:     https://github.com/ai/autoprefixer-rails

### Compass

If you use Compass binary to compile your styles, you can easily integrate
Autoprefixer with it. Install `autoprefixer-rails` gem:

```
gem install autoprefixer-rails
```

and add post-compile hook to `config.rb`:

```ruby
require 'autoprefixer-rails'

on_stylesheet_saved do |file|
  css = File.read(file)
  File.open(file, 'w') do |io|
    io << AutoprefixerRails.process(css)
  end
end
```

You can set the browsers option as the second argument in `process` method.

### Stylus

If you use Stylus CLI, you can add Autoprefixer by [autoprefixer-stylus] plugin:

```
stylus -u autoprefixer-stylus -w file.styl
```

[autoprefixer-stylus]: https://github.com/jenius/autoprefixer-stylus

### CodeKit

CodeKit, since the 2.0 version, contains Autoprefixer. In the After Compiling
section, there is a checkbox to enable Autoprefixer. Read [CodeKit docs]
for more inforamtion.

[CodeKit docs]: https://incident57.com/codekit/help.html#autoprefixer

### Prepros

If you need free assets build GUI tool, try [Prepros].
Just set “Auto Prefix CSS” checkbox in right panel.

<img src="http://alphapixels.com/prepros/static/img/prepros.jpg" width="550" height="340" />

[Prepros]: http://alphapixels.com/prepros/

### CLI

You can use the `autoprefixer` binary to process CSS files using
any assets manager:

```sh
sudo npm install --global autoprefixer
autoprefixer *.css
```

See `autoprefixer -h` for help.

### JavaScript

You can use [autoprefixer-core] in your node.js application
or if you want to develop Autoprefixer plugin for new environment.

```js
var autoprefixer = require('autoprefixer-core');
var prefixed     = autoprefixer.process('a { transition: transform 1s }').css;
```

Autoprefixer can be also used as a [PostCSS] processor, so you can combine
it with [other processors] and parse CSS only once:

```js
postcss().
    use( autoprefixer({ browsers: ['> 1%', 'IE 9'] }) ).
    use( compressor ).
    process(css);
```

There is also [standalone build] for the browser or as a non-Node.js runtime.

[autoprefixer-core]: https://github.com/postcss/autoprefixer-core
[other processors]:  https://github.com/postcss/postcss#built-with-postcss
[standalone build]:  https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js
[PostCSS]:           https://github.com/postcss/postcss

### PHP

You can use Autoprefixer in PHP by [autoprefixer-php] library:

```php
$autoprefixer = new Autoprefixer();
$prefixed     = $autoprefixer->compile('a { transition: transform 1s }');
```

[autoprefixer-php]: https://github.com/vladkens/autoprefixer-php

### .NET

For .NET you can use [Autoprefixer for .NET] library.

For ASP.NET you can use the official [BundleTransformer.Autoprefixer] plugin
for [Bundle Transformer].

1. Install package via NuGet:

  ```
  PM> Install-Package BundleTransformer.Autoprefixer
  ```
2. Perform a post-install actions specified in the `readme.txt` file.
3. Register a bundles in the `App_Start/BundleConfig.cs` file and configure
   the Bundle Transformer (see the [documentation]).

[BundleTransformer.Autoprefixer]: http://www.nuget.org/packages/BundleTransformer.Autoprefixer/
[Autoprefixer for .NET]:          https://github.com/digitalcreations/autoprefixer
[Bundle Transformer]:             http://bundletransformer.codeplex.com/
[documentation]:                  http://bundletransformer.codeplex.com/documentation

### Text Editors

Autoprefixer should be used in assets build tools. Text editor plugins are not
a good solution, because prefixes decrease code readability and you will need
to change value in all prefixed properties.

I recommend you to learn build tools like [Grunt] or [Gulp]. They works much
better and will open you entire new world of useful plugins and automatization.

But, if you can’t move to build tool, you can use text editor plugins:

* [Sublime Text](https://github.com/sindresorhus/sublime-autoprefixer)
* [Brackets](https://github.com/mikaeljorhult/brackets-autoprefixer)
* [Atom Editor](https://github.com/sindresorhus/atom-autoprefixer)

[Grunt]: http://gruntjs.com/
[Gulp]:  http://gulpjs.com/

#### Visual Studio

You can apply the Autoprefixer optimizations to your LESS/Sass stylesheets
in Visual Studio 2013 by using the [Web Essentials 2013] plugin
(since the 2.2 version).

To add this functionality in the Visual Studio 2013 (Update 2 or later)
you need to do the following steps:

1. Download and install the [Web Essentials 2013 for Update 2].
2. Choose a `Tools` → `Options` → `Web Essentials` → `CSS` menu item
3. In the `Enable Autoprefixer` box specify a value equal to `True`

<img src="http://i.imgur.com/X9sBBF8.png" width="700" alt="Autoprefixer options in the Web Essentials 2013" />

[Web Essentials 2013 for Update 2]: http://visualstudiogallery.msdn.microsoft.com/56633663-6799-41d7-9df7-0f2a504ca361
[Web Essentials 2013]:              http://vswebessentials.com/
