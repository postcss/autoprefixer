OldValue = require('../old-value')
Value    = require('../value')

class FillAvailable extends Value
  @names = ['fill-available']

  # Different prefix for -moz-available
  replace: (string, prefix) ->
    if prefix == '-moz-'
      string.replace(@regexp(), '$1-moz-available$3')
    else
      super

  # Different name for -moz-available
  old: (prefix) ->
    if prefix == '-moz-'
      new OldValue('-moz-available')
    else
      super

module.exports = FillAvailable
