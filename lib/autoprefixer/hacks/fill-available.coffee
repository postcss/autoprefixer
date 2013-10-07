OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')

class FillAvailable extends Value
  @names = ['fill-available']

  # Different prefix for -moz-available
  addPrefix: (prefix, string) ->
    if prefix == '-moz-'
      string.replace(@regexp, '$1-moz-available$3')
    else
      super

  # Different name for -moz-available
  old: (prefix) ->
    if prefix == '-moz-'
      new OldValue('-moz-available')
    else
      super

module.exports = FillAvailable
