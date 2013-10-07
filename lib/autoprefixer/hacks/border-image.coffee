Declaration = require('../declaration')

class BorderImage extends Declaration
  @names = ['border-image']

  # Remove fill parameter for prefixed declarations
  prefixProp: (prefix) ->
    super(prefix, @value.replace(/\s+fill(\s)/, '$1'))

module.exports = BorderImage
