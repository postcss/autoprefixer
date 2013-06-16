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

class Declaration
  # Add hack to selected names
  @register: (klass) ->
    for name in klass.names
      @hacks[name] = klass

  # Override classes for special values
  @hacks: { }

  # Detect right class by value name and create it instance
  @load: (rule, number, node) ->
    klass = @hacks[node.property] || Declaration
    new klass(rule, number, node)

  constructor: (@rule, @number, @node) ->
    @prop  = @node.property
    @name  = @prop
    @value = @node.value

    if @prop[0] == '-'
      separator   = @prop.indexOf('-', 1) + 1
      @prefix     = @prop[0...separator]
      @unprefixed = @prop[separator..-1]
    else
      @unprefixed = @prop

    @valuesCache = { }

  # Is property value contain any of strings
  valueContain: (strings) ->
    strings.some (i) => @value.indexOf(i) != -1

  # Add another declaration with prefixed property
  prefixProp: (prefix) ->
    return if @rule.contain(prefix + @unprefixed)
    @insertBefore(prefix + @unprefixed, @value)

  # Insert new declaration before current one
  insertBefore: (prop, value) ->
    return if @rule.contain(prop, value)
    clone = utils.clone(@node, property: prop, value: value)
    @rule.add(@number, clone)
    @number += 1

  # Remove this declaration
  remove: ->
    @rule.remove(@number)

  # Add to cache, that we need to add new property with prefixed value
  prefixValue: (prefix, value) ->
    val = @valuesCache[prefix] || @value
    @valuesCache[prefix] = value.addPrefix(prefix, val)

  # Set new declaration value
  setValue: (value) ->
    @value = @node.value = value

  # Add new propertirs with prefixed by prefixValue() values
  saveValues: ->
    for prefix, value of @valuesCache
      continue if @rule.prefix and prefix != @rule.prefix
      if prefixed = @rule.byProp(prefix + @unprefixed)
        prefixed.setValue(value)
      else
        @insertBefore(@prop, value)

module.exports = Declaration
