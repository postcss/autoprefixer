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
# along with this program.  If not, see <http:#www.gnu.org/licenses/>.

parse     = require('css-parse')
stringify = require('css-stringify')

Browsers = require('./autoprefixer/browsers')
Prefixes = require('./autoprefixer/prefixes')
CSS      = require('./autoprefixer/css')

# Parse CSS and add prefixed properties and values by Can I Use database
# for actual browsers.
#
#   var prefixed = autoprefixer.compile(css, ['> 1%', 'ie 8']);
#
# If you want to combine Autoprefixer with another Rework filters,
# you can use it as separated filter:
#
#   rework(css).
#     use(autoprefixer.rework('last 1 version')).
#     toString();
autoprefixer =

  # Parse CSS and add prefixed properties for selected browsers
  compile: (str, requirements) ->
    nodes = parse(@removeBadComments str)
    @rework(requirements)(nodes.stylesheet)
    stringify(nodes)

  # Return Rework filter, which will add necessary prefixes
  rework: (requirements) ->
    browsers = new Browsers(@data.browsers, requirements)
    prefixes = new Prefixes(@data.prefixes, browsers)
    (stylesheet) ->
      css = new CSS(stylesheet)
      prefixes.processor.add(css)
      prefixes.processor.remove(css)

  data:
    browsers: require('../data/browsers')
    prefixes: require('../data/prefixes')

  # Remove /**/ in non-IE6 declaration, until CSS parser has this issue
  removeBadComments: (css) ->
    css.replace(/\/\*[^\*]*\*\/\s*:/g, ':').
        replace(/\/\*[^\*]*\{[^\*]*\*\//g, '')

  # Return string, what browsers selected and whar prefixes will be added
  inspect: (requirements) ->
    browsers = new Browsers(@data.browsers, requirements)
    prefixes = new Prefixes(@data.prefixes, browsers)

    @inspectFunc ||= require('./autoprefixer/inspect')
    @inspectFunc(prefixes)


module.exports = autoprefixer
