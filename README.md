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

Autoprefixer uses a database with current browser popularity
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

Best tool, is a tool, that you can’t see, but it’s work.
This is a main idea behind Autoprefixer.

So Autoprefixer interface is simple: just forget about vendor prefixes
and write normal CSS by latest W3C specs. You don’t need
special language (like Sass) and special mixins.

Because Autoprefixer is postprocessor and doesn’t depend on styles language,
you can also use it with Sass, Stylus or LESS preprocessors.

### Actual data from Can I Use

Autoprefixer uses latest database from [Can I Use](http://caniuse.com/),
understands what browsers is actual and popular and adds only necessary
vendor prefixes.

Also it cleans your CSS from old prefixes (like unnecessary `border-radius`
from a lot of CSS libraries):

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

On Core i7, 10 GB RAM and SSD, benchmark with GitHub styles is:

```
~/Dev/autoprefixer$ ./node_modules/.bin/cake bench
Load GitHub styles
Autoprefixer: 257 ms
Compass:      13626 ms (53.0 times slower)
Rework:       213 ms   (1.2 times faster)
Stylus:       2596 ms  (10.1 times slower)
```

Unlike -prefix-free Autoprefixer compiles CSS once on deploy and doesn’t hit
client performance.

### Rewrite syntax

Flexbox or gradients have different syntaxes in different browsers
(sometimes you need to recalculate angles, sometimes you need 2 old properties
instead of new one), but Autoprefixer hides this from you.

Just write code by latest W3C specs and Autoprefixer write code
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

You can specify browsers for your project (by default, it’s `last 2 versions`):

```js
autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7").compile(css);
```

* `last n versions` is last versions for each browser. Like “last 2 versions”
  [strategy](http://support.google.com/a/bin/answer.py?answer=33864) in
  Google.
* `> n%` is browser versions, selected by global usage statistics.
* `none` don’t set any browsers to clean CSS from any vendor prefixes.
* You can also set browsers directly.

Blackberry and stock Android browsers will not be used in `last n versions`.
You can add them by name:

```js
autoprefixer("last 1 version", "bb 10", "android 4").compile(css);
```

## Inspect

You can check, what browsers is selected and what properties will be prefixes:

```js
inspect = autoprefixer("last 1 version").inspect();
console.log(inspect);
```

## Usage

### Ruby on Rails

Add [autoprefixer-rails](https://github.com/ai/autoprefixer-rails) gem
to `Gemfile` and write CSS in usual way:

```ruby
gem "autoprefixer-rails"
```

### Middleman

Add [middleman-autoprefixer](https://github.com/porada/middleman-autoprefixer) gem to `Gemfile`:

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

You can use [grunt-autoprefixer](https://github.com/nDmitry/grunt-autoprefixer)
plugin for Grunt. Install npm package and add it to Gruntfile:

```js
grunt.loadNpmTasks('grunt-autoprefixer');
```

### Node.js

Use `autoprefixer` npm package:

```js
var autoprefixer = require('autoprefixer');
var prefixed     = autoprefixer.compile(css);
```

### JavaScript

You can use Autoprefixer in browser or non-node JS runtime
with [standalone version](https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js).

### Rework

Autoprefixer can be also as [Rework](https://github.com/visionmedia/rework)
filter, so you can combine it with other filters:

```js
rework(css).
    use( autoprefixer.rework(['> 1%', 'opera 12.5']) ).
    use( rework.references() ).
    toString();
```

### Sublime Text

You can process your styles directly in Sublime Text by
[sublime-autoprefixer](https://github.com/sindresorhus/sublime-autoprefixer)
plugin.


### Others

You can use `autoprefixer` binary to process CSS files in any assets manager:

```
sudo npm install --global autoprefixer
autoprefixer *.css
```

See `autoprefixer -h` for help.
