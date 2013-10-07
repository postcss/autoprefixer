FlexDeclaration = require('./flex-declaration')

class AlignContent extends FlexDeclaration
  @names = ['align-content', 'flex-line-pack']

  @oldValues =
    'flex-end':      'end'
    'flex-start':    'start'
    'space-between': 'justify'
    'space-around':  'distribute'

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'align-content'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2012 spec
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2012'
      oldValue = AlignContent.oldValues[@value] || @value
      @insertBefore(prefix + 'flex-line-pack', oldValue)
    else if spec == 'final'
      super

module.exports = AlignContent
