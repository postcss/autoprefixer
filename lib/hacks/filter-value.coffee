Value = require('../value')

class FilterValue extends Value
  @names = ['filter']

  # Use prefixed and unprefixed filter for Webkit transition
  replace: (value, prefix) ->
    if prefix == '-webkit-'
      if value.indexOf('-webkit-filter') == -1
        super + ', ' + value
      else
        value
    else
      super

module.exports = FilterValue
