OldValue = require('../old-value')
Value    = require('../value')

class Pixelated extends Value
  @names = ['pixelated']

  # Use non-standard name for WebKit and Firefox
  replace: (string, prefix) ->
    if prefix == '-webkit-'
      string.replace(@regexp(), '$1-webkit-optimize-contrast')
    else if prefix == '-moz-'
      string.replace(@regexp(), '$1-moz-crisp-edges')
    else
      super

  # Different name for WebKit and Firefox
  old: (prefix) ->
    if prefix == '-webkit-'
      new OldValue(@name, '-webkit-optimize-contrast')
    else if prefix == '-moz-'
      new OldValue(@name, '-moz-crisp-edges')
    else
      super

module.exports = Pixelated
