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
    [prefix, unprefixed] = @split(node.property)
    klass = @hacks[unprefixed]
    if klass
      new klass(rule, number, node, prefix, unprefixed)
    else
      new Declaration(rule, number, node, prefix, unprefixed)

  # Split prefix and unprefixed part of property
  @split: (prop) ->
    if prop[0] == '-'
      separator  = prop.indexOf('-', 1) + 1
      prefix     = prop[0...separator]
      unprefixed = prop[separator..-1]
      [prefix, unprefixed]
    else
      ['', prop]

  constructor: (@rule, @number, @node, @prefix, @unprefixed) ->
    @prop  = @node.property
    @value = @node.value
    @valuesCache = { }

  # Is property value contain any of strings
  valueContain: (strings) ->
    strings.some (i) => @value.indexOf(i) != -1

  # Add another declaration with prefixed property
  prefixProp: (prefix, value = @value) ->
    return if @rule.contain(prefix + @unprefixed)
    @insertBefore(prefix + @unprefixed, value)

  # Insert new declaration before current one
  insertBefore: (prop, value) ->
    return if @rule.contain(prop, value)
    clone = utils.clone(@node, property: prop, value: value)
    @rule.add(@number, clone)
    @number += 1

  # Remove this declaration
  remove: ->
    @rule.removeDecl(@number)

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
      vendor = utils.removeNote(prefix)
      continue if @rule.prefix and vendor != @rule.prefix
      if vendor == @prefix
        @setValue(value)
      else if not @rule.byProp(vendor + @unprefixed)
        @insertBefore(@prop, value)

module.exports = Declaration
