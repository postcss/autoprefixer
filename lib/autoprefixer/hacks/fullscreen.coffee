Selector = require('../selector')

class Fullscreen extends Selector
  @names = [':fullscreen']

  # Return different selectors depend on prefix
  prefixed: (prefix) ->
    if '-webkit-' == prefix
      ':-webkit-full-screen'
    else if '-moz-' == prefix
      ':-moz-full-screen'
    else
      ":#{ prefix }fullscreen"

module.exports = Fullscreen
