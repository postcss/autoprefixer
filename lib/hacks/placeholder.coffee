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

  # Warn on old unofficial selector
  process: (node, result) ->
    if @name == '::placeholder' and node.selector.indexOf('::placeholder') != -1
      result.warn('Selector ::placeholder is unofficial. ' +
                  'Use :placeholder-shown instead.', node: node);
    super

module.exports = Placeholder
