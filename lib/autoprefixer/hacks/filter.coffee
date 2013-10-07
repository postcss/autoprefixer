Declaration = require('../declaration')

class Filter extends Declaration
  @names = ['filter']

  # Check is it Internet Explorer filter
  constructor: ->
    super
    if @value.indexOf('DXImageTransform.Microsoft') != -1 or
       @value.indexOf('alpha(') != -1
      @unprefixed = @prop = '-ms-filter'

module.exports = Filter
