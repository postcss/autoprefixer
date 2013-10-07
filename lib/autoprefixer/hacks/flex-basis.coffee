FlexDeclaration = require('./flex-declaration')

class FlexBasis extends FlexDeclaration
  @names = ['flex-basis']

  # Add prefix and convert to 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2012'
      @insertBefore(prefix + 'flex', '0 1 ' + @value)
    else if spec == 'final'
      super

module.exports = FlexBasis
