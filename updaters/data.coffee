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

updater    = require('./lib/updater')
propsData  = { }
valuesData = { }

props = (names..., data) ->
  for name in names
    propsData[name] = data

values = (names..., data) ->
  for name in names
    valuesData[name] = data

browsers = (data) ->
  need = []
  for browser, versions of data.stats
    for interval, support of versions
      for version in interval.split('-')
        if updater.browsers[browser] and support.match(/\sx$/)
          need.push(updater.browsers[browser] + ' ' + version)
  need

# Border Radius
updater.caniuse 'features-json/border-radius.json', (data) ->
  props 'border-radius',
         browsers:   browsers(data)
         transition: true
  props 'border-top-left-radius',
         browsers:   browsers(data)
         transition: true
         prefixed: '-moz-': 'moz-border-radius-topleft'
  props 'border-top-right-radius',
         browsers:   browsers(data)
         transition: true
         prefixed: '-moz-': 'moz-border-radius-topright'
  props 'border-bottom-right-radius',
         browsers:   browsers(data)
         transition: true
         prefixed: '-moz-': 'moz-border-radius-bottomright'
  props 'border-bottom-left-radius',
         browsers:   browsers(data)
         transition: true
         prefixed: '-moz-': 'moz-border-radius-bottomleft'

# Box Shadow
updater.caniuse 'features-json/css-boxshadow.json', (data) ->
  props 'box-shadow',
         browsers:   browsers(data)
         transition: true

# Animation
updater.caniuse 'features-json/css-animation.json', (data) ->
  props 'animation', 'animation-name', 'animation-duration',
        'animation-delay', 'animation-direction', 'animation-fill-mode',
        'animation-iteration-count', 'animation-play-state',
        'animation-timing-function', '@keyframes',
         browsers: browsers(data)

# Transition
updater.caniuse 'features-json/css-transitions.json', (data) ->
  props 'transition', 'transition-property', 'transition-duration',
        'transition-delay', 'transition-timing-function',
         browsers: browsers(data)

# Transform
updater.caniuse 'features-json/transforms2d.json', (data) ->
  props 'transform', 'transform-origin', 'transform-style',
        'perspective', 'perspective-origin', 'backface-visibility',
         browsers:   browsers(data)
         transition: true

# Gradients
updater.caniuse 'features-json/css-gradients.json', (data) ->
  values 'linear-gradient', 'repeating-linear-gradient',
         'radial-gradient', 'repeating-radial-gradient',
          props:   ['background', 'background-image']
          browsers:  browsers(data)
          replace: (string, prefix) ->
            return unless prefix == '-webkit-'
            regexp = /((repeating-)?(linear|radial)-gradient\()\s*(\d+deg)?/g
            string.replace regexp, (_0, gradient, _1, _2, deg) ->
              if deg
                deg  = parseInt(deg)
                deg += 90
                deg -= 360 if deg > 360
                prefix + gradient + deg + 'deg'
              else
                prefix + gradient

# Box sizing
updater.caniuse 'features-json/css3-boxsizing.json', (data) ->
  props 'box-sizing',
         browsers: browsers(data)

# Filter Effects
updater.caniuse 'features-json/css-filters.json', (data) ->
  props 'filter',
         browsers:   browsers(data)
         transition: true
         check:      -> !@match(/DXImageTransform\.Microsoft/)

# Multicolumns
updater.caniuse 'features-json/multicolumn.json', (data) ->
  props 'columns', 'column-width', 'column-count', 'column-gap',
        'column-rule', 'column-rule-color', 'column-rule-style',
        'column-rule-width', 'break-before', 'break-after', 'break-inside',
        'column-span', 'column-fill',
         browsers:   browsers(data)
         transition: true

# User select
updater.caniuse 'features-json/user-select-none.json', (data) ->
  props 'user-select',
         browsers: browsers(data)

# Flexible Box Layout
updater.caniuse 'features-json/flexbox.json', (data) ->
  values 'flex', 'inline-flex',
          props:  ['display']
          browsers: browsers(data)

  props 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
        'flex-shrink', 'flex-basis', 'justify-content', 'order',
        'align-items', 'align-self', 'align-content',
         browsers:   browsers(data)
         transition: true

# calc() unit
updater.caniuse 'features-json/calc.json', (data) ->
  values 'calc',
          props:  ['*']
          browsers: browsers(data)

updater.done ->
  updater.save('values.js', valuesData)
  updater.save('props.js',  propsData)
