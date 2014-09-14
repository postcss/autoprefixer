## 3.1 “Satyameva Jayate”
* Do not remove comments from prefixed values (by Eitan Rousso).
* Allow Safari 6.1 to use final Flexbox spec (by John Kreitlow).
* Fix `filter` value in `transition` in Webkits.
* Show greetings if your browsers don’t require any prefixes.
* Add `<=` and `<` browsers requirement.

## 3.0 “Liberté, Égalité, Fraternité”
* Project was split to autoprefixer (with CLI) and autoprefixer-core.
* `autoprefixer()` now receives only `options` object with `browsers` key.
* GNU format for syntax error messages from PostCSS 2.2.
* CLI was rewritten from CoffeeScript to ES6.

## 2.2 “Mobilis in mobili”
* Allow to disable Autoprefixer for some rule by control comment.
* Use PostCSS 2.1 with Safe Mode option and broken source line
  in CSS syntax error messages.

## 2.1.1
* Fix `-webkit-background-size` hack for `contain` and `cover` values.
* Don’t add `-webkit-` prefix to `filter` with SVG (by Vincent De Oliveira).

## 2.1 “Eleftheria i thanatos”
* Add support for `clip-path` and `mask` properties.
* Return `-webkit-` prefix to `filter` with SVG URI.

## 2.0.2
* Add readable names for new browsers from 2.0 release.
* Don’t add `-webkit-` prefix to `filter` with SVG URI.
* Don’t add `-o-` prefix 3D transforms.

## 2.0.1
* Save declaration style, when clone declaration to prefix.

## 2.0 “Hongik Ingan”
* Based on PostCSS 1.0.
  See [options changes](https://github.com/postcss/postcss/releases/tag/1.0.0).
* Restore visual cascade after declaration removing.
* Enable visual cascade by default.
* Prefix declareation in `@supports` at-rule conditions.
* Add all browsers from Can I Use: `ie_mob`, `and_chr`, `and_ff`,
  `op_mob` and `op_mini`.
* Allow to use latest Autoprefixer from GitHub by npm.
* Add `--no-cascade`, `--annotation` and `--sources-content` options to binary.

## 1.3.1
* Fix gradient hack, when `background` property contains color.

## 1.3 “Tenka Fubu”
* Add `text-size-adjust` support.
* Add `background-size` to support Android 2.

## 1.2 “Meiji”
* Use Can I Use data from official `caniuse-db` npm package.
* Remove package data update from binary.
* Use increment value instead of current date in minor versions.

## 1.1 “Nutrisco et extingo”
* Add source map annotation comment support.
* Add inline source map support.
* Autodetect previous source map.
* Fix source maps support on Windows.
* Fix source maps support in subdirectory.
* Prefix selector even if it is already prefixed by developer.
* Add option `cascade` to create nice visual cascade of prefixes.
* Fix flexbox support for IE 10 (by Roland Warmerdam).
* Better `break-inside` support.
* Fix prefixing, when two same properties are near.

### 20140222:
* Add `touch-action` support.

### 20140226:
* Chrome 33 is moved to released versions.
* Add Chrome 36 data.

### 20140302:
* Add `text-decoration-*` properties support.
* Update browsers usage statistics.
* Use new PostCSS version.

### 20140319:
* Check already prefixed properties after current declaration.
* Normalize spaces before already prefixed check.
* Firefox 28 is moved to released versions.
* Add Firefox 31 data.
* Add some Blackberry data.

### 20140327:
* Don’t use `-ms-transform` in `@keyframes`, because IE 9 doesn’t support
  animations.
* Update BlackBerry 10 data.

### 20140403:
* Update browsers usage statistics.
* Opera 20 is moved to released versions.
* Add Opera 22 data.

### 20140410:
* Chrome 34 is moved to released versions.
* Add Chrome 37 data.
* Fix Chrome 36 data.

### 20140429:
* Fix `display: inline-flex` support by 2009 spec.
* Fix old WebKit gradient converter (by Sergey Belov).
* Fix CSS 3 cursors data (by Nick Schonning).

### 20140430:
* Separate 2D and 3D transform prefixes to clean unnecessary `-ms-` prefixes.
* Firefox 29 is moved to released versions.
* Add Firefox 32 data.

### 20140510
* Do not add `-ms-` prefix for `transform` with 3D functions.
* Update browsers global usage statistics.

### 20140512
* Remove unnecessary `-moz-` prefix for `wavy` in `text-decoration`.
* Update Safari data for font properties.

### 20140521
* Chrome 36 is moved to released versions.
* Add Chrome 38 data.

### 20140523
* Opera 21 is moved to released versions.
* Add Opera 23 data.

### 20140605
* Allow to parse gradients without space between color and position.
* Add iOS 8, Safari 8 and Android 4.4.3 data.
* Update browsers usage statistics.

## 1.0 “Plus ultra”
* Source map support.
* Save origin indents and code formatting.
* Change CSS parser to PostCSS.
* Preserve vendor-prefixed properties put right after unprefixed ones.
* Rename `compile()` to `process()` and return result object,
  instead of CSS string.
* Rename `inspect()` to `info()`.
* Add in binary `-d` option to specify output directory.
* Binary now will not concat output files.
* Allow to select last versions for specified browser.
* Add full browser names aliases: `firefox`, `explorer` and `blackberry`.
* Ignore case in browser names.
* Change license to MIT.
* Add prefixes inside custom at-rules.
* Add only necessary prefixes to selector inside prefixed at-rule.
* Safer backgrounds list parser in gradient hack.
* Prefix `@keyframes` inside `@media`.
* Don’t prefix values for CSS3 PIE properties.
* Binary now shows file name in syntax error.
* Use browserify to build standalone version.

### 20131225:
* Fix deprecated API convertor.
* Add `::placeholder` support for Firefix >= 18.
* Fix vendor prefixes order.

### 20140103:
* Add `-webkit-` prefix for `sticky` position.
* Update browsers popularity statistics.

### 20140109:
* Add selectors and at-rules sections to debug info.
* Fix outdated prefixes cleaning.

### 20140110:
* Add `Firefox ESR` browser requirement.
* Opera 18 is moved to released versions.
* Add Opera 20 data.

### 20140117:
* Chrome 32 is moved to released versions.
* Add Opera 34 data.

### 20140130:
* Fix flexbox properties names in transitions.
* Add Chrome 35 and Firefox 29 data.

### 20140203:
* Android 4.4 stock browser and Opera 19 are moved to released versions.
* Add Opera 21 data.
* Update browsers usage statistics.

### 20140213:
* Add case insensitive to IE’s filter hack (by Dominik Schilling).
* Improve selector prefixing in some rare cases (by Simon Lydell).
* Firefox 27 is moved to released versions.
* Add Firefox 30 data.

## 0.8 “Unbowed, Unbent, Unbroken”
* Add more browsers to defaults ("> 1%, last 2 versions, ff 17, opera 12.1"
  instead of just "last 2 browsers").
* Keep vendor prefixes without unprefixed version (like vendor-specific hacks).
* Convert gradients to old WebKit syntax (actual for Android 2.3).
* Better support for several syntaxes with one prefix (like Flexbox and
  gradients in WebKit).
* Add intrinsic and extrinsic sizing values support.
* Remove never existed prefixes from common mistakes (like -ms-transition).
* Add Opera 17 data.
* Fix selector prefixes order.
* Fix browser versions order in inspect.

### 20130903:
* Fix old WebKit gradients convertor on rgba() colors.
* Allow to write old direction syntax in gradients.

### 20130906:
* Fix direction syntax in radial gradients.
* Don’t prefix IE filter with modern syntax.

### 20130911:
* Fix parsing property name with spaces.

### 20130919:
* Fix processing custom framework prefixes (by Johannes J. Schmidt).
* Concat outputs if several files compiled to one output.
* Decrease standalone build size by removing unnecessary Binary class.
* iOS 7 is moved to released versions.
* Clean up binary code (by Simon Lydell).

### 20130923:
* Firefox 24 is moved to released versions.

### 20131001:
* Add support for grab, grabbing, zoom-in and zoom-out cursor values.

### 20131006:
* Chrome 30 is moved to released versions.

### 20131007:
* Don’t add another prefixes in rule with prefixed selector.

### 20131009:
* Opera 17 is moved to released versions.

### 20131015:
* Fix converting multiple gradients to old webkit syntax (by Aleksei Androsov).

### 20131017:
* Fix @host at-rule parsing.

### 20131020:
* IE 11 and Andrid 4.3 is moved to released versions.
* Add Opera 18 data.
* Add @namespace support.
* Sort browser versions in data file.

### 20131029:
* Add Safari 6.1 data.
* Add fx alias for Firefox.

### 20131104:
* Update Android future version to 4.4.
* Google Chrome 32 added to future versions list.
* Firefox 25 now is actual version, 27 and 28 added to future versions.
* Browsers statistics are updated.

### 20131205:
* Google Chrome 33 added to future releases list.
* Google Chrome 31 moved to current releases list.

### 20131209:
* Use old webkit gradients for old iOS and Safari (by Chad von Nau).
* Fix direction conversion for old webkit gradients (by Chad von Nau).
* Update browsers popularity statistics.

### 20131213:
* Firefox ESR in default browsers was changed to 24 version.
* Firefox 26 was moved to current releases list.
* Firefox 28 was added to future releases list.

## 0.7 “We Do Not Sow”
* Add vendor prefixes to selectors.
* Add ::selection and ::placeholder selectors support.
* Allow to load support data from Can I Use pull requests.
* Remove deprecated API.

### 20130806:
* Add hyphens support.

### 20130807:
* Add tab-size support.
* Add :fullscreen support.

### 20130808:
* Allow to select browser versions by > and >= operator.
* Fix flex properties in transition.

### 20130810:
* Add Firefox 25 data.

### 20130824:
* Add Chrome 31 and 30 data.
* Fix CSS comments parsing (by vladkens).

## 0.6 “As High As Honor”
* New faster API, which cache preprocessed data. Old API is deprecated.
* A lot of perfomance improvements.
* Add Opera 15 -webkit- prefix support.
* Update Chrome 29 and Safari 7 prefixes data.
* Add minor browsers in popularity select.
* Better syntax error messages.

### 20130721:
* Add Chrome 30 data.

### 20130728:
* Don’t remove non-standard -webkit-background-clip: text.
* Don’t remove IE hack on CSS parse.

### 20130729:
* Add Opera 16 data.
* Fix “Invalid range in character class” error on Firefox.

### 20130730:
* Fix correct clone comments inside keyframes (by Alexey Plutalov).
* Fix angle recalculation in gradients (by Roman Komarov).

### 20130731:
* Add border-image support.

## 0.5 “Ours is the Fury”
* Rewrite Autoprefixer to be more flexible.
* Use css, instead of Rework, to fix CSS parsing errors faster.
* Fix a lot of CSS parsing errors.

### 20130616:
* More useful message for CSS parsing errors.
* Remove old WebKit gradient syntax.
* Fix parsing error on comment with braces.

### 20130617:
* Remove old Mozilla border-radius.
* Don’t prefix old IE filter.
* Remove old background-clip, background-size and background-origin prefixes.
* Speed up regexps in values.
* Allow to hack property declarations.

### 20130625:
* Convert flexbox properties to 2009 and 2012 specifications.
* Improve messages on syntax errors.

### 20130626:
* Add Firefox 24 data.
* Add prefixes for font-feature-settings.

### 20130629:
* Fix convert flex properties to old box-flex.

## 0.4 “Winter Is Coming”
* Remove outdated prefixes.
* Add border-radius and box-shadow properties to database.
* Change degrees in webkit gradients.

### 20130515:
* Add old syntax in gradient direction.
* Add old syntax for display: flex.
* Update browser global usage statistics.

### 20130521:
* Add Firefox 23 data.

### 20130524:
* Add Chrome 29 data.

### 20130528:
* Fix compatibilty with Rework from git master.
* Add minor browsers to data, which can be selected only directly.

### 20130530:
* Add Opera 15 and iOS 6.1 data.
* Fix iOS versions in properties and values data.

### 20130603:
* Use latest Rework 0.15 with a lot of CSS parsing fixes.
* Update browsers usage statistics.

## 0.3 “Growing Strong”
* Rename `autoprefixer.filter()` to `autoprefixer.rework()`.
* Use own filters instead of Rework’s `prefix` and `prefixValue`.
* Smarter value prefixer without false match “order” in “border”.
* 40% faster.
* Don’t add unnecessary properties instead of Rework’s `prefixValue`.
* Don’t change properties order.
* Sort properties and values in inspect output.
* Add main to component config (by Jonathan Ong).
* Fix documentation (by Sergey Leschina and Mark Vasilkov).

### 20130424:
* Fix value override in prefixer.

### 20130427:
* Prefix several same values in one property.
* Fix Windows support in binary.
* Improve print errors in binary.

### 20130502:
* Don’t add -webkit- prefix to IE filter.
* Don’t duplicate prefixes on second run.

## 0.2 “Hear Me Roar!”
* Update parse libraries.
* Use component package manager to build standalone script.
* Add inspect to standalone script.

## 0.1 “Fire and Blood”
* Initial release.
