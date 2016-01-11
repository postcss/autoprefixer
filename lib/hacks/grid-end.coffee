Declaration = require('../declaration')

class GridEnd extends Declaration
  @names = ['grid-row-end',  'grid-column-end',
            'grid-row-span', 'grid-column-span']

  # Do not add prefix for unsupported value in IE
  check: (decl) ->
    decl.value.indexOf('span') != -1

  # Return a final spec property
  normalize: (prop) ->
    prop.replace(/(-span|-end)/, '')

  # Change property name for IE
  prefixed: (prop, prefix) ->
    if prefix == '-ms-'
      prefix + prop.replace('-end', '-span')
    else
      super(prop, prefix)

  # Change repeating syntax for IE
  set: (decl, prefix) ->
    if prefix == '-ms-'
      decl.value = decl.value.replace(/span\s/i, '')
    super(decl, prefix)

module.exports = GridEnd
