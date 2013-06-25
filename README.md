# Autoprefixer

Parse CSS and add prefixed properties and values from
[Can I Use](http://caniuse.com/) database for actual browsers.

Write your usual CSS code without prefixes (forget about them at all,
Autoprefixer will think for you):

```js
var css = 'a { transition: transform 1s }';
var prefixed = autoprefixer.compile(css);
```

Autoprefixer uses a database with current browser statistics
and properties support to add prefixes automatically:

```css
a {
  -webkit-transition: -webkit-transform 1s;
  -o-transition: -o-transform 1s;
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

* You write normal CSS (or use Autoprefixer after Sass, Stylus
  or another preprocessor).
* You write normal properties (not special mixins), so you don’t need
  to remember which properties needs to be prefixed.
* Autoprefixer uses only necessary prefixes. You choose which browsers
  (by default the last 2 versions for each browser).
  Did you know, that prefixes for `border-radius`
  [have not been necessary](http://caniuse.com/border-radius)
  for a long time now?
* The properties and browsers database is updated automatically
  (from [Can I Use](http://caniuse.com/)), so prefixes will always be up-to-date
  (scripts don’t have holidays or work).
* Removes outdated prefixes to clean libraries and legacy code.
* It also adds prefixes to values. For example, to `calc(1em + 5px)` or
  to property names in `transition`.

## Browsers

You can specify browsers for your project (by default, it’s `last 2 versions`):

```js
autoprefixer.compile(css, ["last 1 version", "> 1%", "ie 8", "ie 7"]);
```

* `last n versions` is last `n` versions for each browser (for example,
  [Google also uses](http://support.google.com/a/bin/answer.py?answer=33864)
  “last 2 versions” strategy).
* `> n%` is browser versions, whose global usage statistics is more than `n`%.
* You can also set browsers directly.

Blackberry and stock Android browsers will not be used in `last n versions`
or `> n%` selects. Add them by name if you need them:

```js
autoprefixer.compile(css, ["last 1 version", "bb 10", "android 4"]);
```

## Usage

### Ruby on Rails

Add [autoprefixer-rails](https://github.com/ai/autoprefixer-rails) gem
to `Gemfile` and write CSS in usual way:

```ruby
gem "autoprefixer-rails"
```

### Ruby

You can integrate Autoprefixer into your Sprockets environment
by `autoprefixer-rails` gem:

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

You can use Autoprefixer in browser or non-node JS runtime
with [standalone version](https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js).

### Rework

Autoprefixer can be also as [Rework](https://github.com/visionmedia/rework)
filter, so you can can combine it with other filters:

```js
rework(css).
    use( autoprefixer.rework(['> 1%', 'opera 12.5']) ).
    use( rework.references() ).
    toString();
```

### Others

You can use `autoprefixer` binary to process CSS files in any assets manager:

```
sudo npm install --global autoprefixer
autoprefixer *.css
```

See `autoprefixer -h` for help.

### Sublime Text

You can process your styles directly in Sublime Text by
[sublime-autoprefixer](https://github.com/sindresorhus/sublime-autoprefixer)
plugin.
