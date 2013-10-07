FlexDeclaration = require('./flex-declaration')

class Flex extends FlexDeclaration
  @names = ['flex-grow']

  # Add prefix and convert to 2009 and 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2009'
      @insertBefore(prefix + 'box-flex', @value)
    else if spec == '2012'
      @insertBefore(prefix + 'flex', @value)
    else if spec == 'final'
      super

module.exports = Flex
