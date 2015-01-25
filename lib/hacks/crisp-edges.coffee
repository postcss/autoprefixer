Value = require('../value')

class CrispEdges extends Value
  @names = ['crisp-edges']

  # Use non-standard name for WebKit
  replace: (string, prefix) ->
    if prefix == '-webkit-'
      string.replace(@regexp(), '$1-webkit-optimize-contrast')
    else
      super

module.exports = CrispEdges
