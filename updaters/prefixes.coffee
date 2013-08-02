# Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>,
# sponsored by Evil Martians.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

updater = require('./lib/updater')

prefixes = { }
prefix   = (names..., data) ->
  for name in names
    prefixes[name] = data

# Border Radius
updater.feature 'border-radius.json', (browsers) ->
  prefix 'border-radius',
          browsers:   browsers
          transition: true
  prefix 'border-top-left-radius',
          browsers:   browsers
          transition: true
  prefix 'border-top-right-radius',
          browsers:   browsers
          transition: true
  prefix 'border-bottom-right-radius',
          browsers:   browsers
          transition: true
  prefix 'border-bottom-left-radius',
          browsers:   browsers
          transition: true

# Box Shadow
updater.feature 'css-boxshadow.json', (browsers) ->
  prefix 'box-shadow',
          browsers:   browsers
          transition: true

# Animation
updater.feature 'css-animation.json', (browsers) ->
  prefix 'animation', 'animation-name', 'animation-duration',
         'animation-delay', 'animation-direction', 'animation-fill-mode',
         'animation-iteration-count', 'animation-play-state',
         'animation-timing-function', '@keyframes',
          browsers: browsers

# Transition
updater.feature 'css-transitions.json', (browsers) ->
  prefix 'transition', 'transition-property', 'transition-duration',
         'transition-delay', 'transition-timing-function',
          browsers: browsers

# Transform
updater.feature 'transforms2d.json', (browsers) ->
  prefix 'transform', 'transform-origin', 'perspective', 'perspective-origin',
          browsers:   browsers
          transition: true

  prefix 'transform-style', 'backface-visibility',
          browsers: browsers

# Gradients
updater.feature 'css-gradients.json', (browsers) ->
  prefix 'linear-gradient', 'repeating-linear-gradient',
         'radial-gradient', 'repeating-radial-gradient',
          props:   ['background', 'background-image', 'border-image']
          browsers:  browsers

# Box sizing
updater.feature 'css3-boxsizing.json', (browsers) ->
  prefix 'box-sizing',
          browsers: browsers

# Filter Effects
updater.feature 'css-filters.json', (browsers) ->
  prefix 'filter',
          browsers:   browsers
          transition: true

# Multicolumns
updater.feature 'multicolumn.json', (browsers) ->
  prefix 'columns', 'column-width', 'column-gap',
         'column-rule', 'column-rule-color', 'column-rule-width',
          browsers:   browsers
          transition: true

  prefix 'column-count', 'column-rule-style', 'column-span', 'column-fill',
         'break-before', 'break-after', 'break-inside',
          browsers:   browsers

# User select
updater.feature 'user-select-none.json', (browsers) ->
  prefix 'user-select',
          browsers: browsers

# Flexible Box Layout
updater.feature 'flexbox.json', (browsers) ->
  prefix 'display-flex',
          browsers: browsers

  prefix 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
         'flex-shrink', 'flex-basis', 'justify-content', 'order',
         'align-items', 'align-self', 'align-content',
          browsers: browsers

# calc() unit
updater.feature 'calc.json', (browsers) ->
  prefix 'calc',
          props:  ['*']
          browsers: browsers

# Background options
updater.feature 'background-img-opts.json', (browsers) ->
  prefix 'background-clip', 'background-origin', 'background-size',
          browsers: browsers

# Font feature settings
updater.feature 'font-feature.json', (browsers) ->
  prefix 'font-feature-settings', 'font-variant-ligatures',
         'font-language-override','font-kerning',
          browsers: browsers

# Border image
updater.feature 'border-image.json', (browsers) ->
  prefix 'border-image',
          browsers: browsers

# Selection selector
# Wait for https://github.com/Fyrd/caniuse/pull/269
updater.fork 'porada/patch-1', 'css-selection.json', (browsers) ->
  prefix '::selection',
          selector: true,
          browsers: browsers

# Placeholder selector
# Wait for https://github.com/Fyrd/caniuse/pull/272
updater.fork 'ai/css-placeholder', 'css-placeholder.json', (browsers) ->
  prefix '::placeholder',
          selector: true,
          browsers: browsers

updater.done -> updater.save('prefixes', prefixes)
