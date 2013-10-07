FlexDeclaration = require('./flex-declaration')

class Order extends FlexDeclaration
  @names = ['order', 'flex-order', 'box-ordinal-group']

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'order'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2009 and 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2009'
      oldValue = parseInt(@value) + 1
      @insertBefore(prefix + 'box-ordinal-group', oldValue.toString())
    else if spec == '2012'
      @insertBefore(prefix + 'flex-order', @value)
    else if spec == 'final'
      super

module.exports = Order
