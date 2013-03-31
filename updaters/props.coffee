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

updater    = require('../lib/autoprefixer/updater')
properties = { }

props = (names..., data) ->
  for name in names
    properties[name] = data

browsers = (data) ->
  need = []
  for browser, versions of data.stats
    for interval, support of versions
      for version in interval.split('-')
        if updater.browsers[browser] and support.match(/\sx$/)
          need.push(updater.browsers[browser] + ' ' + version)
  need

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
  props 'linear-gradient', 'repeating-linear-gradient',
        'radial-gradient', 'repeating-radial-gradient',
         browsers:  browsers(data)
         onlyValue: true

# Box sizing
updater.caniuse 'features-json/css3-boxsizing.json', (data) ->
  props 'box-sizing',
         browsers: browsers(data)

# Filter Effects
updater.caniuse 'features-json/css-filters.json', (data) ->
  props 'filter',
         browsers:   browsers(data)
         transition: true

updater.done -> updater.save('props.js', properties)
