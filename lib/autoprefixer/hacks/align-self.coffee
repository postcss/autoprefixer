FlexDeclaration = require('./flex-declaration')

class AlignSelf extends FlexDeclaration
  @names = ['align-self', 'flex-item-align']

  @oldValues =
    'flex-end':   'end'
    'flex-start': 'start'

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'align-self'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2012'
      oldValue = AlignSelf.oldValues[@value] || @value
      @insertBefore(prefix + 'flex-item-align', oldValue)
    else if spec == 'final'
      super

module.exports = AlignSelf
