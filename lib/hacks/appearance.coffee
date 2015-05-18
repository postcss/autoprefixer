Declaration = require('../declaration')

class Appearance extends Declaration
  @names = ['appearance']

  # Prefix only none value
  check: (decl) ->
    decl.value.toLowerCase() == 'none'

module.exports = Appearance
