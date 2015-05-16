Declaration = require('../declaration')

class Appearance extends Declaration
  @names = ['appearance']

  # Prefix only none and auto values
  check: (decl) ->
    v = decl.value.toLowerCase()
    v == 'auto' or v == 'none'

module.exports = Appearance
