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

utils       = require('./utils')
Declaration = require('./declaration')

Declaration.register require('./hacks/filter')
Declaration.register require('./hacks/border-radius')

Declaration.register require('./hacks/flex')
Declaration.register require('./hacks/order')
Declaration.register require('./hacks/flex-grow')
Declaration.register require('./hacks/flex-wrap')
Declaration.register require('./hacks/flex-flow')
Declaration.register require('./hacks/transition')
Declaration.register require('./hacks/align-self')
Declaration.register require('./hacks/flex-basis')
Declaration.register require('./hacks/flex-shrink')
Declaration.register require('./hacks/align-items')
Declaration.register require('./hacks/border-image')
Declaration.register require('./hacks/display-flex')
Declaration.register require('./hacks/align-content')
Declaration.register require('./hacks/flex-direction')
Declaration.register require('./hacks/justify-content')

class Rule
  constructor: (@rules, @number, @node, @prefix) ->
    @type         = @node.type
    @declarations = @node.declarations
    if @type == 'rule'
      @selectors  = @node.selectors.join(', ')
      unless @prefix
        match   = @selectors.match(/(^|\s|:)(-(\w+)-)/)
        @prefix = match[2] if match

  # Execute callback on every property: value declarations
  each: (callback) ->
    @number = 0
    while @number < @declarations.length
      item = @declarations[@number]
      if item.property
        decl = Declaration.load(@, @number, item)
        callback(decl, decl.prefix || @prefix)
      @number += 1
    false

  # Clone rule with prefixed selector
  prefixSelector: (selector) ->
    for prefix in selector.prefixes
      prefixed = selector.replace(@selectors, prefix)
      unless @rules.contain(prefixed)
        clone = utils.clone(@node, selectors: prefixed.split(', '))
        @rules.add(@number, clone)

  # Is current list contain rule with same property and value
  contain: (prop, value) ->
    if value?
      @declarations.some (i) -> i.property == prop and i.value == value
    else
      @declarations.some (i) -> i.property == prop

  # Get declaration by property name
  byProp: (prop) ->
    for node, i in @declarations
      if node.property
        decl = Declaration.load(@, i, node)
        return decl if decl.prop == prop
    return null

  # Remove this rule
  remove: ->
    @rules.remove(@number)

  # Add new declaration at selected position
  add: (position, decl) ->
    @declarations.splice(position, 0, decl)
    @number += 1

  # Remove declaration in selected position
  removeDecl: (position) ->
    @declarations.splice(position, 1)
    @number -= 1

module.exports = Rule
