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

Declaration = require('./declaration')

Declaration.register require('./hacks/filter')
Declaration.register require('./hacks/border-radius')

Declaration.register require('./hacks/flex')
Declaration.register require('./hacks/order')
Declaration.register require('./hacks/flex-wrap')
Declaration.register require('./hacks/flex-flow')
Declaration.register require('./hacks/align-self')
Declaration.register require('./hacks/align-items')
Declaration.register require('./hacks/display-flex')
Declaration.register require('./hacks/align-content')
Declaration.register require('./hacks/flex-direction')
Declaration.register require('./hacks/justify-content')

class Rule
  constructor: (@declarations, @prefix) ->

  # Execute callback on every property: value declarations
  each: (callback) ->
    @number = 0
    while @number < @declarations.length
      if @declarations[@number].property
        decl = Declaration.load(@, @number, @declarations[@number])
        callback(decl, decl.prefix || @prefix)
      @number += 1

  # Is current list contain rule with same property and value
  contain: (prop, value) ->
    if value?
      @declarations.some (i) -> i.property == prop and i.value == value
    else
      @declarations.some (i) -> i.property == prop

  # Add new declaration at selected position
  add: (position, decl) ->
    @declarations.splice(position, 0, decl)
    @number += 1

  # Get declaration by property name
  byProp: (prop) ->
    for decl, i in @declarations
      if decl.property == prop
        return Declaration.load(@, i, decl)
    return null

  # Remove declaration in selected position
  remove: (position) ->
    @declarations.splice(@number, 1)
    @number -= 1


module.exports = Rule
