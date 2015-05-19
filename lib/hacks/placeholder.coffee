Selector = require('../selector')

class Placeholder extends Selector
  @names = [':placeholder-shown', '::placeholder']

  # Add old mozilla to possible prefixes
  possible: ->
    super.concat('-moz- old')

  # Return different selectors depend on prefix
  prefixed: (prefix) ->
    if '-webkit-' == prefix
      '::-webkit-input-placeholder'
    else if '-ms-' == prefix
      ':-ms-input-placeholder'
    else if '-moz- old' == prefix
      ':-moz-placeholder'
    else
      "::#{ prefix }placeholder"

module.exports = Placeholder
