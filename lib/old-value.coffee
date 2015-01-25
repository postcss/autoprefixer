utils = require('./utils')

class OldValue
  constructor: (@unprefixed, @prefixed, @string, @regexp) ->
    @regexp ||= utils.regexp(@prefixed)
    @string ||= @prefixed

  # Check, that value contain old value
  check: (value) ->
    if value.indexOf(@string) != -1
      !!value.match(@regexp)
    else
      false

module.exports = OldValue
