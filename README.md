# Autoprefixer

<img align="right" width="94" src="http://ai.github.io/autoprefixer/logo.svg" title="Autoprefixer logo by Anton Lovchikov">

Parse CSS and add vendor prefixes to CSS rules using values
from [Can I Use](http://caniuse.com/).

Write your CSS rules without vendor prefixes (in fact, forget about them
entirely):

```css
:fullscreen a {
    transition: transform 1s
}
```

Process your CSS by Autoprefixer:

```js
var prefixed = autoprefixer.process(css).css;
```

It will use the data on current browser popularity and properties support
to apply prefixes for you:

```css
:-webkit-full-screen a {
    -webkit-transition: -webkit-transform 1s;
    transition: transform 1s
}
:-moz-full-screen a {
    transition: transform 1s
}
:-ms-fullscreen a {
    transition: transform 1s
}
:fullscreen a {
    -webkit-transition: -webkit-transform 1s;
    transition: transform 1s
}
```

You can play with your CSS in the [interactive demo] of Autoprefixer.

Twitter account for news and releases: [@autoprefixer].

Sponsored by [Evil Martians]. Based on [PostCSS] framework.

[interactive demo]: http://jsfiddle.net/simevidas/udyTs/show/light/
[@autoprefixer]:    https://twitter.com/autoprefixer
[Evil Martians]:    http://evilmartians.com/
[PostCSS]:          https://github.com/ai/postcss

## Features

### Forget about prefixes

The best tool is a tool you can't see and one that does the work for you.
This is the main idea behind Autoprefixer.

Autoprefixer interface is simple: just forget about vendor prefixes
and write normal CSS according to the latest W3C specs. You don’t need
a special language (like Sass) or special mixins.

Because Autoprefixer is a postprocessor for CSS,
you can also use it with preprocessors, such as Sass, Stylus or LESS.

### Actual data from Can I Use

Autoprefixer uses the most recent data from [Can I Use](http://caniuse.com/),
understands which browsers are actual and popular and adds only the necessary
vendor prefixes.

It also cleans your CSS from old prefixes (like prefixed `border-radius`,
produced by many CSS libraries):

```css
a {
    -webkit-border-radius: 5px;
    border-radius: 5px
}
```

compiles to:

```css
a {
    border-radius: 5px
}
```

Note, that Autoprefixer doesn’t load Can I Use data every time. It takes it from
[caniuse-db](https://www.npmjs.org/package/caniuse-db) dependency.
So, if you use Autoprefixer from `npm`, try to keep your `autoprefixer`
and `caniuse-db` packages fresh to have only actual prefixes in your CSS.

### Flexbox, Gradients, etc.

Flexbox or gradients have different syntaxes in different browsers
(sometimes you need to recalculate angles, sometimes you need 2 old properties
instead of new one), but Autoprefixer hides this from you.

Just code by latest W3C specs and Autoprefixer will produce the code
for old browsers:

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

Autoprefixer has [22 special hacks] to fix browser’s differences.

[22 special hacks]: https://github.com/ai/autoprefixer/tree/master/lib/hacks

### Fast

Autoprefixer is about several times faster than Compass and Stylus.

On a Core i7 with 10 GB of RAM and SSD, benchmark with GitHub styles is:

```
~/Dev/autoprefixer$ ./node_modules/.bin/cake bench
Load GitHub styles
Autoprefixer: 466 ms
Compass:      2828 ms (6.1 times slower)
Stylus:       1491 ms (3.2 times slower)
```

Unlike [-prefix-free](http://leaverou.github.io/prefixfree/), Autoprefixer
compiles CSS once on deploy and doesn’t hurt client-side performance.

## Browsers

You can specify the browsers you want to target in your project:

```js
autoprefixer("last 1 version", "> 1%", "Explorer 7").process(css).css;
```

* `last 2 versions` is last versions for each browser. Like “last 2 versions”
  [strategy](http://support.google.com/a/bin/answer.py?answer=33864) in
  Google.
* `last 2 Chrome versions` is last versions of the specified browser.
* `> 5%` is browser versions, selected by global usage statistics.
* `Firefox > 20` is Firefox versions newer than 20.
* `Firefox >= 20` is Firefox version 20 or newer.
* `Firefox ESR` is the latest [Firefox ESR] version.
* `none` don’t set any browsers to clean CSS from any vendor prefixes.
* `ios 7` to set browser version directly.

Blackberry and stock Android browsers will not be used in `last n versions`.
You can add them by name:

```js
autoprefixer("last 1 version", "BlackBerry 10", "Android 4").process(css).css;
```

Browsers names (case insensitive):
* `Android` for old Android stock browser.
* `BlackBerry` or `bb` for Blackberry browser.
* `Chrome` for Google Chrome.
* `Firefox` or `ff` for Mozilla Firefox.
* `Explorer` or `ie` for Internet Explorer.
* `iOS` for iOS Safari.
* `Opera` for Opera.
* `Safari` for desktop Safari.

By default, Autoprefixer uses `> 1%, last 2 versions, Firefox ESR, Opera 12.1`:
* Latest [Firefox ESR] is a 24 version.
* Opera 12.1 will be in list until Opera supports non-Blink 12.x branch.

[Firefox ESR]: http://www.mozilla.org/en/firefox/organizations/faq/

## Source Map

You must set input and output CSS files paths (by `from` and `to` options)
to generate a correct map.

Autoprefixer can modify previous source maps (for example, from Sass):
it will autodetect a previous map if it is listed in an annotation comment or
in a file near the input CSS. You can disable source map with `map: false` or
set the previous source map content manually to `map` option (as a string or a
JS object).

```js
var result = autoprefixer.process(css, {
    map:   fs.readFileSync('main.sass.css.map'),
    from: 'main.sass.css',
    to:   'main.min.css'
});

result.css //=> CSS with source map annotation comment
result.map //=> Source map from main.sass to main.min.css

fs.writeFileSync('main.min.css.map', result.map);
```

Autoprefixer supports inline source maps too. If input CSS contains annotation
from the previous step with map in `data:uri`, Autoprefixer will update the
source map with prefixes changes and inine the new map back into the output CSS.

You can read more about source map options in
[PostCSS documentation](https://github.com/ai/postcss#source-map-1).

## Visual Cascade

Autoprefixer can change CSS indentation to create a nice visual cascade
of prefixes. You need to send `cascade: true` option to processor constructor:

```js
autoprefixer("> 1 %", "last 2 version", { cascade: true }).process(css).css
```

and, if CSS will be uncompressed, output would be like:

```css
a {
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
            box-sizing: border-box
}
```

## Debug

You can check which browsers are selected and which properties will be prefixed:

```js
info = autoprefixer("last 1 version").info();
console.log(info);
```

Or by CLI command:

```sh
autoprefixer -i
```

## FAQ

### Does it add polyfills for old browsers?

No. Autoprefixer only adds prefixes, not polyfills. There are two reasons:

1. Prefixes and polyfills are very different and need a different API.
   Two separate libraries would be much better.
2. Most of IE polyfills are very bad for client perfomance. They use slow hacks
   and old IEs is mostly used on old hardware. Most CSS3 features used only
   for styling should be ignored in old IEs as is recommended for
   Graceful Degradation.

### Why don’t gradients work in Firefox?

Check that you use correct [direction syntax]. For example, you should use
`to bottom` instead of `top`:

```css
a {
  background: linear-gradient(to bottom, white, black)
}
```

Unfortunately, unprefixed gradients use a different direction syntax and most
examples you find use an old gradient syntax, so be careful and use always the
latest W3C specs with Autoprefixer.

[direction syntax]: https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient

### Why doesn’t Autoprefixer add prefixes to `border-radius`?

Developers are often surprised by how few prefixes are required today.
If Autoprefixer doesn’t add prefixes to your CSS, check if they’re still
required on [Can I Use](http://caniuse.com/).

If a prefix is required, but Autoprefixer doesn’t add it or adds it
incorrectly, please
[report an issue](https://github.com/ai/autoprefixer/issues/new)
and include your source CSS and expected output.

### Why doesn’t Autoprefixer support `appearance`?

Unlike `transition`, the `appearance` property is not a part of
any specification. So there is no `appearance`, only `-moz-appearance`
and `-webkit-appearance`. Quote from [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/-moz-appearance):

> Do not use this property on Web sites: not only is it non-standard, but its
> behavior changes from one browser to another. Even the keyword `none` does not
> have the same behavior on each form element across different browsers, and
> some do not support it at all.

### Why does Autoprefixer use CoffeeScript?

JavaScript is very popular, but this is the same reason why its syntax does not
evolve. There is an entire Internet with a lot of legacy code which should
be supported by browsers. If developers add an inappropriate feature then
it can’t be removed in then next versions but must be supported for a very
long time. This is very bad for innovation. To create new, we need to experiment
and to choose.

As a result JavaScript doesn’t have even basic syntax features, which are
present in other languages like Ruby or Python. There are no string
interpolation, short lambda syntax, foreach statement for arrays, string and
arrays slicing, etc. This features are really important and they will be in
ECMAScript 6 (first update of JS syntax after 15 years), but this
new specification is still not released and, of course, we must wait until
all browsers support it.

With JavaScript preprocessors like CoffeeScript or TypeScript we can bring
innovation back. We can add a new operator and use it right now, without waiting
for support in all browsers.

Autoprefixer was written in pure JavaScript before. But CoffeeScript made
Autoprefixer code much cleaner and more readable. Often, 2 lines of code
became 1.

Don’t be afraid of CoffeeScript. It is just a new syntax, not another language
(like ClojureScript). You can open [examples on CoffeeScript.org] and start
to code. After a week your eyes will adjust and you will see that CoffeeScript
is cleaner and more readable.

Situation with CoffeeScript and JavaScript is absolutely the same as with
CSS preprocessors and postprocessors. How can we develop a CSS postprocessor
and avoid using a JS preproccesor :).

[examples on CoffeeScript.org]: http://coffeescript.org/

## Usage

### Grunt

You can use the
[grunt-autoprefixer](https://github.com/nDmitry/grunt-autoprefixer)
plugin for Grunt. Install the npm package and add it to Gruntfile:

```js
grunt.loadNpmTasks('grunt-autoprefixer');
```

### Gulp

You can use [gulp-autoprefixer](https://github.com/Metrime/gulp-autoprefixer)
to use Autoprefixer in your Gulp build configuration.

```js
var prefix = require('gulp-autoprefixer');
gulp.src('./css/*.css')
  .pipe(prefix(["last 1 version", "> 1%", "ie 8", "ie 7"], { cascade: true }))
  .pipe(gulp.dest('./dist/'));
```

### Brunch

You can use the
[autoprefixer-brunch](https://github.com/lydell/autoprefixer-brunch)
plugin for [Brunch](http://brunch.io/).

### Compass

If you use Compass binary to compile your styles, you can easily integrate
Autoprefixer with it. Install `autoprefixer-rails` gem:

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

You can set the browsers option as the second argument in `process` method:

```ruby
io << AutoprefixerRails.process(css, browsers: ["last 1 version", "> 1%"])
```

### Stylus

If you use Stylus CLI, you can add Autoprefixer by
[autoprefixer-stylus](https://github.com/jenius/autoprefixer-stylus) plugin.

Just install npm package and use it in `-u` option:

```
stylus -u autoprefixer-stylus -w file.styl
```

### Ruby on Rails

Add [autoprefixer-rails](https://github.com/ai/autoprefixer-rails) gem
to `Gemfile` and write CSS in a usual way:

```ruby
gem "autoprefixer-rails"
```

### Ruby

You can integrate Autoprefixer into your Sprockets environment
by `autoprefixer-rails` gem:

```ruby
AutoprefixerRails.install(sprockets_env)
```

or process CSS from plain Ruby:

```ruby
prefixed = AutoprefixerRails.process(css)
```

### CodeKit

CodeKit, since the 2.0 version, contains Autoprefixer. In the After Compiling
section, there is a checkbox to enable Autoprefixer.
Read [CodeKit docs](https://incident57.com/codekit/help.html#autoprefixer)
for more inforamtion.

### Prepros

If you want to build your assets with a GUI, try
[Prepros](http://alphapixels.com/prepros/). Just set “Auto Prefix CSS”
[checkbox](https://f.cloud.github.com/assets/3478693/930798/faa29892-0016-11e3-8901-87850de7aed2.jpg)
in right panel.

<img src="http://alphapixels.com/prepros/static/img/prepros.jpg" width="550" height="340" />

### Broccoli

You can use the
[broccoli-autoprefixer](https://github.com/sindresorhus/broccoli-autoprefixer)
plugin for [Broccoli](https://github.com/joliss/broccoli).

### Mincer

To use Autoprefixer in [Mincer](https://github.com/nodeca/mincer),
install `autoprefixer` npm package and enable it:

```js
environment.enable('autoprefixer');
```

### Middleman

Add [middleman-autoprefixer](https://github.com/porada/middleman-autoprefixer)
gem to `Gemfile`:

```ruby
gem "middleman-autoprefixer"
```

and activate the extension in your project’s `config.rb`:

```ruby
activate :autoprefixer
```

### Node.js

Use `autoprefixer` npm package:

```js
var autoprefixer = require('autoprefixer');
var css          = 'a { transition: transform 1s }';
var prefixed     = autoprefixer.process(css).css;
```

### PHP

You can use Autoprefixer in PHP by
[autoprefixer-php](https://github.com/vladkens/autoprefixer-php) library:


```php
$autoprefixer = new Autoprefixer();
$css          = 'a { transition: transform 1s }';
$prefixed     = $autoprefixer->compile($css);
```

### .NET

You can use Autoprefixer from .NET and BundleTransformer with the
[Autoprefixer](https://github.com/digitalcreations/autoprefixer) NuGet package.

### JavaScript

You can use Autoprefixer in the browser or as a non-Node.js runtime
with [standalone version](https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js).

### PostCSS

Autoprefixer can be also used as a [PostCSS](https://github.com/ai/postcss)
processor, so you can combine it with other processors and parse CSS only once:

```js
postcss().
    use( autoprefixer(['> 1%', 'opera 12.5']).postcss ).
    use( compressor ).
    process(css);
```

### Sublime Text

You can process your styles directly in Sublime Text with the
[sublime-autoprefixer](https://github.com/sindresorhus/sublime-autoprefixer)
plugin.

### Brackets

Styles can processed automatically in Brackets using the
[brackets-autoprefixer](https://github.com/mikaeljorhult/brackets-autoprefixer)
extension.

### Atom Editor

You can process your styles directly in Atom with the
[atom-autoprefixer](https://github.com/sindresorhus/atom-autoprefixer)
package.

### Others

You can use the `autoprefixer` binary to process CSS files using
any assets manager:

```
sudo npm install --global autoprefixer
autoprefixer *.css
```

See `autoprefixer -h` for help.
