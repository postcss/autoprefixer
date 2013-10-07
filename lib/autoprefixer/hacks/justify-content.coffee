FlexDeclaration = require('./flex-declaration')

class JustifyContent extends FlexDeclaration
  @names = ['justify-content', 'flex-pack', 'box-pack']

  @oldValues =
    'flex-end':      'end'
    'flex-start':    'start'
    'space-between': 'justify'
    'space-around':  'distribute'

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'justify-content'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2009 and 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    oldValue = JustifyContent.oldValues[@value] || @value
    if spec == '2009'
      @insertBefore(prefix + 'box-pack', oldValue) if @value != 'space-around'
    else if spec == '2012'
      @insertBefore(prefix + 'flex-pack', oldValue)
    else if spec == 'final'
      super

module.exports = JustifyContent
