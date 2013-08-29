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

inspectCache = null

# Parse CSS and add prefixed properties and values by Can I Use database
# for actual browsers.
#
#   var prefixed = autoprefixer('> 1%', 'ie 8').compile(css);
#
# If you want to combine Autoprefixer with another Rework filters,
# you can use it as separated filter:
#
#   rework(css).
#     use(autoprefixer('last 1 version').rework).
#     toString();
autoprefixer = (reqs...) ->
  if reqs.length == 1 and reqs[0] instanceof Array
    reqs = reqs[0]
  else if reqs.length == 0 or (reqs.length == 1 and not reqs[0]?)
    reqs = undefined

  reqs = autoprefixer.default unless reqs?

  browsers = new Browsers(autoprefixer.data.browsers, reqs)
  prefixes = new Prefixes(autoprefixer.data.prefixes, browsers)
  new Autoprefixer(prefixes, autoprefixer.data)

autoprefixer.data =
  browsers: require('../data/browsers')
  prefixes: require('../data/prefixes')

class Autoprefixer
  constructor: (@prefixes, @data) ->
    @browsers = @prefixes.browsers.selected

  # Parse CSS and add prefixed properties for selected browsers
  compile: (str) ->
    nodes = @catchParseErrors => parse(@removeBadComments str)
    @rework(nodes.stylesheet)
    stringify(nodes)

  # Return Rework filter, which will add necessary prefixes
  rework: (stylesheet) =>
    css = new CSS(stylesheet)
    @prefixes.processor.add(css)
    @prefixes.processor.remove(css)

  # Return string, what browsers selected and whar prefixes will be added
  inspect: ->
    inspectCache ||= require('./autoprefixer/inspect')
    inspectCache(@prefixes)

  # Catch errors from CSS parsing and throw readable message
  catchParseErrors: (callback) ->
    try
      callback()
    catch e
      error = new Error("Can't parse CSS: " + e.message)
      error.stack = e.stack
      error.css   = true
      throw error

  # Remove /**/ in non-IE6 declaration, until CSS parser has this issue
  removeBadComments: (css) ->
    css.replace(/\/\*[^\*]*\}[^\*]*\*\//g, '')

# Autoprefixer default browsers
autoprefixer.default = ['last 2 versions']

# Lazy load for Autoprefixer with default browsers
autoprefixer.loadDefault = ->
  @defaultCache ||= autoprefixer(@default)

# Compile with default Autoprefixer
autoprefixer.compile = (str) ->
  @loadDefault().compile(str)

# Rework with default Autoprefixer
autoprefixer.rework = (stylesheet) ->
  @loadDefault().rework(stylesheet)

# Inspect with default Autoprefixer
autoprefixer.inspect = ->
  @loadDefault().inspect()

module.exports = autoprefixer
