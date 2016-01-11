Declaration = require('../declaration')

class GridStart extends Declaration
  @names = ['grid-row-start', 'grid-column-start', 'grid-row', 'grid-column']

  # Do not add prefix for unsupported value in IE
  check: (decl) ->
    decl.value.indexOf('/') == -1 or decl.value.indexOf('span') != -1

  # Return a final spec property
  normalize: (prop) ->
    prop.replace('-start', '')

  # Change property name for IE
  prefixed: (prop, prefix) ->
    if prefix == '-ms-'
      prefix + prop.replace('-start', '')
    else
      super(prop, prefix)

  # Split one value to two
  insert: (decl, prefix, prefixes) ->
    parts = @splitValue(decl, prefix)
    if parts.length == 2
      decl.cloneBefore(prop: '-ms-' + decl.prop + '-span', value: parts[1])
    super(decl, prefix, prefixes)

  # Change value for combine property
  set: (decl, prefix) ->
    parts = @splitValue(decl, prefix)
    if parts.length == 2
      decl.value = parts[0]
    super(decl, prefix)

  # If property contains start and end
  splitValue: (decl, prefix) ->
    if prefix == '-ms-' and decl.prop.indexOf('-start') == -1
      parts = decl.value.split(/\s*\/\s*span\s+/)
      if parts.length == 2
        return parts
    false

module.exports = GridStart
