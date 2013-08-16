# Autoprefixer

<img align="right" width="94" src="http://ai.github.io/autoprefixer/logo.svg">

Parse CSS and add vendor prefixes to CSS rules using values
from the [Can I Use](http://caniuse.com/).

Write your CSS rules without vendor prefixes (in fact, forget about them
entirely):

```js
var css = 'a { transition: transform 1s }';
var prefixed = autoprefixer.compile(css);
```

Autoprefixer uses the data on current browser popularity
and properties support to apply prefixes for you:

```css
a {
  -webkit-transition: -webkit-transform 1s;
  transition: -ms-transform 1s;
  transition: transform 1s
}
```

Twitter account for news and releases:
[@autoprefixer](https://twitter.com/autoprefixer).

Sponsored by [Evil Martians](http://evilmartians.com/).

## Translations

Документация на русском: [habrahabr.ru/company/evilmartians/blog/176909](http://habrahabr.ru/company/evilmartians/blog/176909/)

## Features

### Forget about prefixes

The best tool is a tool you can't see that does the work for you.
This is the main idea behind Autoprefixer.

Autoprefixer interface is simple: just forget about vendor prefixes
and write normal CSS according to latest W3C specs. You don’t need
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

### Fast

Autoprefixer is about 50 times faster than Compass and 10 times faster
than Stylus.

On a Core i7 with 10 GB of RAM and SSD, benchmark with GitHub styles is:

```
~/Dev/autoprefixer$ ./node_modules/.bin/cake bench
Load GitHub styles
Autoprefixer: 257 ms
Compass:      13626 ms (53.0 times slower)
Rework:       213 ms   (1.2 times faster)
Stylus:       2596 ms  (10.1 times slower)
```

Unlike -prefix-free, Autoprefixer compiles CSS once on deploy and doesn’t hit
client-side performance.

### Rewrite syntax

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

## Browsers

You can specify the browsers you want to target in your project
(by default, it’s `last 2 versions`):

```js
autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7").compile(css);
```

* `last n versions` is last versions for each browser. Like “last 2 versions”
  [strategy](http://support.google.com/a/bin/answer.py?answer=33864) in
  Google.
* `> n%` is browser versions, selected by global usage statistics.
* `ff > 20` and `ff >= 20` is Firefox versions newer, that 20.
* `none` don’t set any browsers to clean CSS from any vendor prefixes.
* You can also set browsers directly.

Blackberry and stock Android browsers will not be used in `last n versions`.
You can add them by name:

```js
autoprefixer("last 1 version", "bb 10", "android 4").compile(css);
```

Browsers names are:

You can get browsers codenames in
[data file](https://github.com/ai/autoprefixer/blob/master/data/browsers.coffee):
* `android` for old Android stock browser.
* `bb` for Blackberry browser.
* `chrome` for Google Chrome.
* `ff` for Mozilla Firefox.
* `ie` for Internet Explorer.
* `ios` for iOS Safari.
* `opera` for Opera.
* `safari` for desktop Safari.

## Inspect

You can check which browsers are selected and which properties will be prefixed:

```js
inspect = autoprefixer("last 1 version").inspect();
console.log(inspect);
```

## Usage

### Ruby on Rails

Add [autoprefixer-rails](https://github.com/ai/autoprefixer-rails) gem
to `Gemfile` and write CSS in a usual way:

```ruby
gem "autoprefixer-rails"
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

### Ruby

You can integrate Autoprefixer into your Sprockets environment
by `autoprefixer-rails` gem:

```ruby
AutoprefixerRails.install(sprockets_env)
```

or process CSS from plain Ruby:

```ruby
prefixed = AutoprefixerRails.compile(css)
```

### Grunt

You can use the
[grunt-autoprefixer](https://github.com/nDmitry/grunt-autoprefixer)
plugin for Grunt. Install the npm package and add it to Gruntfile:

```js
grunt.loadNpmTasks('grunt-autoprefixer');
```

If you use Sass with `compress` output style and worry, that Autoprefixer
uncompress CSS, try [csso-grunt](https://github.com/t32k/grunt-csso).
It compress CSS back, but did it much better than Sass.

### Prepros

I you want to build your assets in GUI, try
[Prepros](http://alphapixels.com/prepros/). Just set “Auto Prefix CSS”
[checkbox](https://f.cloud.github.com/assets/3478693/930798/faa29892-0016-11e3-8901-87850de7aed2.jpg)
in right panel.

### Compass

If you use Compass binary to compile your styles, you can easy integrate
Autoprefixer with it. Install `autoprefixer-rails` gem:

```
gem install autoprefixer-rails csso-rails
```

and add post-compile hook to `config.rb`:

```ruby
require 'autoprefixer-rails'
require 'csso'

on_stylesheet_saved do |file|
  css = File.read(file)
  File.open(file, 'w') do |io|
    io << Csso.optimize( AutoprefixerRails.compile(css) )
  end
end
```

If you use `compress` output style, Autoprefixer will uncompress CSS.
For this reason, we use [csso-rails](https://github.com/Vasfed/csso-rails)
to compress CSS back (it compress much better than Sass).

If you need uncompressed CSS, remove `Csso.optimize` method call.

You can set browsers array as second argument in `AutoprefixerRails.compile`.

### Mincer

To use Autoprefixer in [Mincer](https://github.com/nodeca/mincer),
install `autoprefixer` npm package and enable it:

```js
environment.enable("autoprefixer");
```

### Node.js

Use `autoprefixer` npm package:

```js
var autoprefixer = require('autoprefixer');
var prefixed     = autoprefixer.compile(css);
```

### JavaScript

You can use Autoprefixer in the browser or a non-Node.js runtime
with [standalone version](https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js).

### Rework

Autoprefixer can be also used as a
[Rework](https://github.com/visionmedia/rework)
filter, so you can combine it with other filters:

```js
rework(css).
    use( autoprefixer(['> 1%', 'opera 12.5']).rework ).
    use( rework.references() ).
    toString();
```

### Sublime Text

You can process your styles directly in Sublime Text with the
[sublime-autoprefixer](https://github.com/sindresorhus/sublime-autoprefixer)
plugin.


### Others

You can use the `autoprefixer` binary to process CSS files using
any assets manager:

```
sudo npm install --global autoprefixer
autoprefixer *.css
```

See `autoprefixer -h` for help.

## In-package Update

I highly recommend to always have latest version of Autoprefixer.
But, some company has long test period before any libraries updater.
For this cases, you can update Can I Use data inside npm package:

```
autoprefixer --update
```

Note, that in-package update doesn’t get new properties or code fixes. It update
only browsers popularity and propeties support in new browsers versions.
