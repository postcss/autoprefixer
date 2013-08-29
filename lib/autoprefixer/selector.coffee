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

utils = require('./utils')

class Selector
  # Add hack to selected names
  @register: (klass) ->
    for name in klass.names
      @hacks[name] = klass

  # Override classes for special values
  @hacks: { }

  # Detect right class by value name and create it instance
  @load: (name, prefixes) ->
    klass = @hacks[name]
    if klass
      new klass(name, prefixes)
    else
      new Selector(name, prefixes)

  constructor: (@name, @prefixes = []) ->
    @prefixes = @prefixes.sort (a, b) -> a.length - b.length

  # Is rule selectors need to be prefixed
  check: (selectors) ->
    selectors.indexOf(@name) != -1

  # Return prefixed version of selector
  prefixed: (prefix) ->
    @name.replace(/^([^\w]*)/, '$1' + prefix)

  # Lazy loadRegExp for name
  regexp: ->
    @regexpCache ||= new RegExp(utils.escapeRegexp(@name), 'gi')

  # Replace selectors by prefixed one
  replace: (selectors, prefix) ->
    selectors.replace(@regexp(), @prefixed(prefix))

module.exports = Selector
