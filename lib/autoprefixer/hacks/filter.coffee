Declaration = require('../declaration')

class Filter extends Declaration
  @names = ['filter']

  # Check is it Internet Explorer filter
  check: (decl) ->
    v = decl.value
    v.indexOf('alpha(') == -1 and v.indexOf('DXImageTransform.Microsoft') == -1

module.exports = Filter
