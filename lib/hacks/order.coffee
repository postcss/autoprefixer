flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class Order extends Declaration
  @names = ['order', 'flex-order', 'box-ordinal-group']

  # Change property name for 2009 and 2012 specs
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      prefix + 'box-ordinal-group'
    else if spec == 2012
      prefix + 'flex-order'
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    'order'

  # Fix value for 2009 spec
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2009 and /\d/.test(decl.value)
      decl.value = (parseInt(decl.value) + 1).toString()
      super(decl, prefix)
    else
      super

module.exports = Order
