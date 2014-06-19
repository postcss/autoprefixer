Declaration = require('../declaration')

class BackgroundSize extends Declaration
  @names = ['background-size']

  # Remove fill parameter for prefixed declarations
  set: (decl, prefix) ->
    if prefix == '-webkit-' and decl.value.indexOf(' ') == -1
      decl.value = decl.value + ' ' + decl.value
    super(decl, prefix)

module.exports = BackgroundSize
