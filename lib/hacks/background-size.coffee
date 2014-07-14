Declaration = require('../declaration')

class BackgroundSize extends Declaration
  @names = ['background-size']

  # Remove fill parameter for prefixed declarations
  set: (decl, prefix) ->
    value = decl.value.toLowerCase()
    if prefix == '-webkit-' and value.indexOf(' ') == -1 and
       value != 'contain' and value != 'cover'
      decl.value = decl.value + ' ' + decl.value
    super(decl, prefix)

module.exports = BackgroundSize
