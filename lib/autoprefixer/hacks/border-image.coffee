Declaration = require('../declaration')

class BorderImage extends Declaration
  @names = ['border-image']

  # Remove fill parameter for prefixed declarations
  set: (decl, prefix) ->
    decl = super
    decl.value = decl.value.replace(/\s+fill(\s)/, '$1')
    decl

module.exports = BorderImage
