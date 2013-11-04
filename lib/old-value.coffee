utils = require('./utils')

class OldValue
  constructor: (@name, @string, @regexp) ->
    @regexp ||= utils.regexp(@name)
    @string ||= @name

  # Check, that value contain old value
  check: (value) ->
    if value.indexOf(@string) != -1
      !!value.match(@regexp)
    else
      false

module.exports = OldValue
