Value = require('../value')

class Transform extends Value
  @names = ['transform']

  # Don't prefix transform for IE
  replace: (value, prefix) ->
    if prefix == '-ms-'
      return value
    else
      super

module.exports = Transform
