Value = require('../value')

class TransformValue extends Value
  @names = ['transform']

  # Don't prefix transform for IE
  replace: (value, prefix) ->
    if prefix == '-ms-'
      return value
    else
      super

module.exports = TransformValue
