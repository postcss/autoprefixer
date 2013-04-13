# Autoprefixer

Parse CSS and add prefixed properties and values by
[Can I Use](http://caniuse.com/) database for actual browsers.

Write your CSS usual code without prefixes (forget about them at all,
Autoprefixer will think for you):

```js
var css = 'a { transition: transform 1s }';
var prefixed = autoprefixer.compile(css);
```

Autoprefixer will take database with current browser statistics
and properties support and adds only actual prefixes:

```css
a {
  -webkit-transition: -webkit-transform 1s;
  -ms-transition: -ms-transform 1s;
  -o-transition: -o-transform 1s;
  -webkit-transition: transform 1s;
  -o-transition: transform 1s;
  transition: transform 1s
}
```

## Features

* You write normal CSS (or use Autoprefixer after Sass, Stylus
  or another preprocessor).
* You write normal properties (not special mixins), so you don’t need to
  remember which properties needs to be prefixed.
* Autoprefixed uses only really necessary prefixes. You set browsers (by default
  last 2 version for each browsers). Do you know, that prefixes for
  `border-radius` [is not necessary](http://caniuse.com/border-radius)
  for a long time?
* Properties and browsers database is updated automatically
  (from [Can I Use](http://caniuse.com/)), so prefixes will be always actual
  (scripts don’t have holidays and work).
* It also adds prefixes to the values. For example, to `calc(1em + 5px)` or
  to properties names in `transition`.

## Browsers

You can specify browsers actual for your project (by default, it’s
`"last 2 versions"`):

```js
autoprefixer.compile(css, ["last 1 version", "> 1%", "ie 8", "ie 7"]);
```

* `last n versions` is last `n` versions for each browser (for example,
  [Google also uses](http://support.google.com/a/bin/answer.py?answer=33864)
  “last 2 version” strategy).
* `> n%` is browser versions, which global usage statistics is more than `n`%.
* You can also set browsers directly.

## Usage

### Ruby on Rails

Add `autoprefixer-rails` [gem](https://github.com/ai/autoprefixer-rails)
to `Gemfile` and write CSS in usual way:

```ruby
gem "autoprefixer-rails"
```

### Ruby

You can integrate Autoprefxier to your Sprockets environment
by `autoprefixer-rails` gem:

```ruby
AutoprefixerRails.install(sprockets_env)
```

or process CSS from plain Ruby:

```ruby
prefixed = AutoprefixerRails.compile(css)
```

### Node.js

Use `autoprefixer` npm-package:

```js
var autoprefixer = require('autoprefixer');
var prefixed     = autoprefixer.compile(css);
```

### JavaScript

You can use Autoprefixer in browser or non-node JS runtime
by [standalone version](https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js).

### Rework

Autoprefixer is a [Rework](https://github.com/visionmedia/rework) filter,
so you can can combine it with other filters:

```js
rework(css).
    use( autoprefixer.filter(['> 1%', 'opera 12.5']) ).
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
