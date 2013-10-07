Declaration = require('../declaration')

class Transition extends Declaration
  @names = ['transition', 'transition-property']

  # Don't prefix transform for IE
  prefixValue: (prefix, value) ->
    if prefix == '-ms-' and value.name == 'transform'
      return
    else
      super

module.exports = Transition
