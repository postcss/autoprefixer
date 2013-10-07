FlexDeclaration = require('./flex-declaration')

class AlignItems extends FlexDeclaration
  @names = ['align-items', 'flex-align', 'box-align']

  @oldValues =
    'flex-end':   'end'
    'flex-start': 'start'

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'align-items'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2009 and 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    oldValue = AlignItems.oldValues[@value] || @value
    if spec == '2009'
      @insertBefore(prefix + 'box-align', oldValue)
    else if spec == '2012'
      @insertBefore(prefix + 'flex-align', oldValue)
    else if spec == 'final'
      super

module.exports = AlignItems
