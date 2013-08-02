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
browsers = (data) ->
  need = []
  for browser, versions of data.stats
    for interval, support of versions
      for version in interval.split('-')
        if updater.browsers[browser] and support.match(/\sx($|\s)/)
          version = version.replace(/\.0$/, '')
          need.push(updater.browsers[browser] + ' ' + version)
  need

# Border Radius
updater.feature 'border-radius.json', (data) ->
  prefix 'border-radius',
          browsers:   browsers(data)
          transition: true
  prefix 'border-top-left-radius',
          browsers:   browsers(data)
          transition: true
  prefix 'border-top-right-radius',
          browsers:   browsers(data)
          transition: true
  prefix 'border-bottom-right-radius',
          browsers:   browsers(data)
          transition: true
  prefix 'border-bottom-left-radius',
          browsers:   browsers(data)
          transition: true

# Box Shadow
updater.feature 'css-boxshadow.json', (data) ->
  prefix 'box-shadow',
          browsers:   browsers(data)
          transition: true

# Animation
updater.feature 'css-animation.json', (data) ->
  prefix 'animation', 'animation-name', 'animation-duration',
         'animation-delay', 'animation-direction', 'animation-fill-mode',
         'animation-iteration-count', 'animation-play-state',
         'animation-timing-function', '@keyframes',
          browsers: browsers(data)

# Transition
updater.feature 'css-transitions.json', (data) ->
  prefix 'transition', 'transition-property', 'transition-duration',
         'transition-delay', 'transition-timing-function',
          browsers: browsers(data)

# Transform
updater.feature 'transforms2d.json', (data) ->
  prefix 'transform', 'transform-origin', 'perspective', 'perspective-origin',
          browsers:   browsers(data)
          transition: true

  prefix 'transform-style', 'backface-visibility',
          browsers: browsers(data)

# Gradients
updater.feature 'css-gradients.json', (data) ->
  prefix 'linear-gradient', 'repeating-linear-gradient',
         'radial-gradient', 'repeating-radial-gradient',
          props:   ['background', 'background-image', 'border-image']
          browsers:  browsers(data)

# Box sizing
updater.feature 'css3-boxsizing.json', (data) ->
  prefix 'box-sizing',
          browsers: browsers(data)

# Filter Effects
updater.feature 'css-filters.json', (data) ->
  prefix 'filter',
          browsers:   browsers(data)
          transition: true

# Multicolumns
updater.feature 'multicolumn.json', (data) ->
  prefix 'columns', 'column-width', 'column-gap',
         'column-rule', 'column-rule-color', 'column-rule-width',
          browsers:   browsers(data)
          transition: true

  prefix 'column-count', 'column-rule-style', 'column-span', 'column-fill',
         'break-before', 'break-after', 'break-inside',
          browsers:   browsers(data)

# User select
updater.feature 'user-select-none.json', (data) ->
  prefix 'user-select',
          browsers: browsers(data)

# Flexible Box Layout
updater.feature 'flexbox.json', (data) ->
  prefix 'display-flex',
          browsers: browsers(data)

  prefix 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
         'flex-shrink', 'flex-basis', 'justify-content', 'order',
         'align-items', 'align-self', 'align-content',
          browsers: browsers(data)

# calc() unit
updater.feature 'calc.json', (data) ->
  prefix 'calc',
          props:  ['*']
          browsers: browsers(data)

# Background options
updater.feature 'background-img-opts.json', (data) ->
  prefix 'background-clip', 'background-origin', 'background-size',
          browsers: browsers(data)

# Font feature settings
updater.feature 'font-feature.json', (data) ->
  prefix 'font-feature-settings', 'font-variant-ligatures',
         'font-language-override','font-kerning',
          browsers: browsers(data)

# Border image
updater.feature 'border-image.json', (data) ->
  prefix 'border-image',
          browsers: browsers(data)

# Selection selector
# Wait for https://github.com/Fyrd/caniuse/pull/269
updater.fork 'porada/patch-1', 'css-selection.json', (data) ->
  prefix '::selection',
          selector: true,
          browsers: browsers(data)

updater.done -> updater.save('prefixes', prefixes)
