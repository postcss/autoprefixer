OldValue = require('../old-value')
Value    = require('../value')

class Stretch extends Value
  @names = ['stretch', 'fill', 'fill-available']

  # Different prefix for WebKit and Firefox
  replace: (string, prefix) ->
    if prefix == '-moz-'
      string.replace(@regexp(), '$1-moz-available$3')
    else if prefix == '-webkit-'
      string.replace(@regexp(), '$1-webkit-fill-available$3')
    else
      super

  # Different name for WebKit and Firefox
  old: (prefix) ->
    if prefix == '-moz-'
      new OldValue(@name, '-moz-available')
    else if prefix == '-webkit-'
      new OldValue(@name, '-webkit-fill-available')
    else
      super

module.exports = Stretch
