# Autoprefixer [![Build Status][ci-img]][ci]

<img align="right" width="94" height="71"
     src="http://postcss.github.io/autoprefixer/logo.svg"
     title="Autoprefixer logo by Anton Lovchikov">

[PostCSS] plugin to parse CSS and add vendor prefixes to CSS rules using values
from [Can I Use]. It is [recommended] by Google and used in Twitter,
and Taobao.

Write your CSS rules without vendor prefixes (in fact, forget about them
entirely):

```css
:fullscreen a {
    display: flex
}
```

Autoprefixer will use the data based on current browser popularity and property
support to apply prefixes for you. You try in the [interactive demo]
of Autoprefixer.

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

Twitter account for news and releases: [@autoprefixer].

<a href="https://evilmartians.com/?utm_source=autoprefixer">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[interactive demo]: http://simevidas.jsbin.com/gufoko/quiet
[@autoprefixer]:    https://twitter.com/autoprefixer
[recommended]:      https://developers.google.com/web/fundamentals/tools/build/setupbuildprocess#dont-trip-up-with-vendor-prefixes
[Can I Use]:        http://caniuse.com/
[PostCSS]:          https://github.com/postcss/postcss
[ci-img]:           https://travis-ci.org/postcss/autoprefixer.svg
[ci]:               https://travis-ci.org/postcss/autoprefixer

## Features

### Write Pure CSS

Working with Autoprefixer is simple: just forget about vendor prefixes
and write normal CSS according to the latest W3C specs. You don’t need
a special language (like Sass) or remember where you must use mixins.

Autoprefixer supports selectors (like `:fullscreen` and `::selection`),
unit function (`calc()`), at‑rules (`@support` and `@keyframes`) and properties.

Because Autoprefixer is a postprocessor for CSS,
you can also use it with preprocessors such as Sass, Stylus or LESS.

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
    display: -ms-flexbox;
    display: flex
}
```

Autoprefixer has [27 special hacks] to fix web browser differences.

[27 special hacks]: https://github.com/postcss/autoprefixer-core/tree/master/lib/hacks

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

Autoprefixer uses [Browserslist], so you can specify the browsers
you want to target in your project by queries like `last 2 versions`
or `> 5%`.

If you don’t provide browsers option, Browserslist will try
to find `browserslist` config in parent dirs.

See [Browserslist docs] for queries, browser names, config format
and default value.

[Browserslist]:      https://github.com/ai/browserslist
[Browserslist docs]: https://github.com/ai/browserslist#queries

## Source Map

Autoprefixer can modify previous source maps (for example, from Sass):
it will autodetect a previous map if it is listed in an annotation comment.

Autoprefixer supports inline source maps too. If an input CSS contains
annotation from the previous step with a map in data:uri, Autoprefixer will
update the source map with prefix changes and inline the new map back into
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

## Outdated Prefixes

By default, Autoprefixer also removes outdated prefixes.

You can disable this behavior by `remove: false` option. If you have
no legacy code, this options will make Autoprefixer about 10% faster.

Also you can set `add: false` option. Autoprefixer will only clean outdated
prefixes, but will not any new prefixes.

Autoprefixer adds new prefixes between unprefixed property and already
written prefixes in your CSS. If it will broke expected prefixes order,
you can clean all prefixes from your CSS and then add necessary prefixes again:

```js
var cleaner  = postcss([ autoprefixer({ add: false, browsers: [] }) ]);
var prefixer = postcss([ autoprefixer ]);

cleaner.process(css).then(function (cleaned) {
    prefixer.process(cleaned.css, function (result) {
        console.log(result.css);
    });
});
```

## Disabling

Autoprefixer was designed to have no interface – it just works.
If you need some browser specific hack just write a prefixed property
after the unprefixed one.

```css
a {
    transform: scale(0.5);
    -moz-transform: scale(0.6);
}
```

If some prefixes were generated in a wrong way,
please create an issue on GitHub.

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

Control comments disable Autoprefixer within the whole rule in which
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

#### Does it add polyfills?

No. Autoprefixer only adds prefixes.

Most new CSS features will require client side JavaScript to handle correctly
a new behavior.

Depending on what you consider being a “polyfill”, you can take a look to some
other tools and libraries. If you just look for syntax sugar, you might take
a look to:

- [CSS Grace], a PostCSS plugin that handles some IE hacks (opacity, rgba,
  inline-block, etc) in addition to some non-standard handy shortcuts.
- [cssnext], a tool that allows you to write standard CSS syntax non-implemented
  yet in browsers (custom properties, custom media, color functions, etc).
  It includes autoprefixer and can be used as a PostCSS plugin too.

[CSS Grace]: https://github.com/cssdream/cssgrace
[cssnext]: https://cssnext.github.io/

#### Why doesn’t Autoprefixer add prefixes to `border-radius`?

Developers are often surprised by how few prefixes are required today.
If Autoprefixer doesn’t add prefixes to your CSS, check if they’re still
required on [Can I Use].

There is [list with all supported] properties, values and selectors in wiki.

[list with all supported]: https://github.com/postcss/autoprefixer/wiki/support-list
[Can I Use]:               http://caniuse.com/

#### Why Autoprefixer uses unprefixed properties in `@-webkit-keyframes`?

Browser teams can remove some prefix before other. So we try to use
all combinations of prefixed/unprefixed values.

#### Does Autoprefixer add `-epub-` prefix?

No, Autoprefixer works only with browsers prefixes from Can I Use.
But you can use [postcss-epub](https://github.com/Rycochet/postcss-epub)
for prefixing ePub3 properties.

## Usage

### Gulp

In Gulp you can use [gulp-postcss] with `autoprefixer-core` npm package.

```js
gulp.task('autoprefixer', function () {
    var postcss      = require('gulp-postcss');
    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer-core');

    return gulp.src('./src/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dest'));
});
```

With `gulp-postcss` you also can combine Autoprefixer
with [other PostCSS plugins].

[other PostCSS plugins]: https://github.com/postcss/postcss#plugins
[gulp-postcss]:          https://github.com/postcss/gulp-postcss

### Webpack

In [webpack] you can use [postcss-loader] with `autoprefixer-core`
and [other PostCSS plugins].

```js
var autoprefixer = require('autoprefixer-core');

module.exports = {
    module: {
        loaders: [
            {
                test:   /\.css$/,
                loader: "style-loader!css-loader!postcss-loader"
            }
        ]
    },
    postcss: [ autoprefixer({ browsers: ['last 2 version'] }) ]
}
```

[other PostCSS plugins]: https://github.com/postcss/postcss#plugins
[postcss-loader]:        https://github.com/postcss/postcss-loader
[webpack]:               http://webpack.github.io/

### Other Build Tools:

* **Ruby on Rails**: [autoprefixer-rails]
* **Grunt**: [grunt-postcss]
* **Brunch**: [postcss-brunch]
* **Broccoli**: [broccoli-postcss]
* **Middleman**: [middleman-autoprefixer]
* **Mincer**: add `autoprefixer` npm package and enable it:
  `environment.enable('autoprefixer')`
* **Jekyll**: add `autoprefixer-rails` and `jekyll-assets` to `Gemfile`

[middleman-autoprefixer]: https://github.com/porada/middleman-autoprefixer
[autoprefixer-rails]:     https://github.com/ai/autoprefixer-rails
[broccoli-postcss]:       https://github.com/jeffjewiss/broccoli-postcss
[postcss-brunch]:         https://github.com/iamvdo/postcss-brunch
[grunt-postcss]:          https://github.com/nDmitry/grunt-postcss

### Compass

You should consider using Gulp instead of Compass binary, because it has
better Autoprefixer integration and many other awesome plugins.

But if you can’t move from Compass binary right now, there’s a hack
to run Autoprefixer after `compass compile`.

Install `autoprefixer-rails` gem:

```
gem install autoprefixer-rails
```

and add post-compile hook to `config.rb`:

```ruby
require 'autoprefixer-rails'

on_stylesheet_saved do |file|
  css = File.read(file)
  map = file + '.map'

  if File.exists? map
    result = AutoprefixerRails.process(css,
      from: file,
      to:   file,
      map:  { prev: File.read(map), inline: false })
    File.open(file, 'w') { |io| io << result.css }
    File.open(map,  'w') { |io| io << result.map }
  else
    File.open(file, 'w') { |io| io << AutoprefixerRails.process(css) }
  end
end
```

### Less

You can use autoprefixer with less by including
the [less-plugin-autoprefix] plugin.

[less-plugin-autoprefix]: https://github.com/less/less-plugin-autoprefix

### Stylus

If you use Stylus CLI, you can add Autoprefixer by [autoprefixer-stylus] plugin:

```
stylus -u autoprefixer-stylus -w file.styl
```

[autoprefixer-stylus]: https://github.com/jenius/autoprefixer-stylus

### CodeKit

CodeKit, since the 2.0 version, contains Autoprefixer. In the After Compiling
section, there is a checkbox to enable Autoprefixer. Read [CodeKit docs]
for more information.

[CodeKit docs]: https://incident57.com/codekit/help.html#autoprefixerWW

### CLI

You can use the [postcss-cli] to run Autoprefixer from CLI:

```sh
npm install --global postcss-cli autoprefixer
postcss --use autoprefixer *.css -d build/
```

See `postcss-cli -h` for help.

[postcss-cli]: https://github.com/code42day/postcss-cli

### JavaScript

You can use [autoprefixer-core] with [PostCSS] in your node.js application
or if you want to develop an Autoprefixer plugin for new environment.

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

There is also [standalone build] for the browser or as a non-Node.js runtime.

You can use [html-autoprefixer] to process HTML with inlined CSS.

[autoprefixer-core]: https://github.com/postcss/autoprefixer-core
[html-autoprefixer]: https://github.com/RebelMail/html-autoprefixer
[standalone build]:  https://raw.github.com/ai/autoprefixer-rails/master/vendor/autoprefixer.js
[PostCSS]:           https://github.com/postcss/postcss

### Text Editors and IDE

Autoprefixer should be used in assets build tools. Text editor plugins are not
a good solution, because prefixes decrease code readability and you will need
to change value in all prefixed properties.

I recommend you to learn how to use build tools like [Gulp].
They work much better and will open you a whole new world of useful plugins
and automatization.

But, if you can’t move to a build tool, you can use text editor plugins:

* [Sublime Text](https://github.com/sindresorhus/sublime-autoprefixer)
* [Brackets](https://github.com/mikaeljorhult/brackets-autoprefixer)
* [Atom Editor](https://github.com/sindresorhus/atom-autoprefixer)
* [Visual Studio](http://vswebessentials.com/)

[Gulp]:  http://gulpjs.com/
