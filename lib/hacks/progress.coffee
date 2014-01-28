Selector = require('../selector')

class Progress extends Selector
  @names = ['::progress-bar']

  # Return different selectors depend on prefix
  prefixed: (prefix) ->
    if '-webkit-' == prefix
      '::-webkit-progress-value'
    else
      "::#{ prefix }progress-bar"

module.exports = Progress
