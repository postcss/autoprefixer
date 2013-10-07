Selector = require('../selector')

class Placeholder extends Selector
  @names = ['::placeholder']

  # Return different selectors depend on prefix
  prefixed: (prefix) ->
    if '-webkit-' == prefix
      '::-webkit-input-placeholder'
    else if '-ms-' == prefix
      ':-ms-input-placeholder'
    else
      "::#{ prefix }placeholder"

module.exports = Placeholder
