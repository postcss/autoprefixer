FlexDeclaration = require('./flex-declaration')

class Flex extends FlexDeclaration
  @names = ['flex', 'box-flex']

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'flex'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2009 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2009'
      first = @value.split(' ')[0]
      @insertBefore(prefix + 'box-flex', first)
    else if spec == '2012'
      super
    else if spec == 'final'
      super

module.exports = Flex
