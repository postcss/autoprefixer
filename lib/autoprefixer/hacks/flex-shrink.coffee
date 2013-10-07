FlexDeclaration = require('./flex-declaration')

class FlexShrink extends FlexDeclaration
  @names = ['flex-shrink']

  # Add prefix and convert to 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2012'
      @insertBefore(prefix + 'flex', '0 ' + @value)
    else if spec == 'final'
      super

module.exports = FlexShrink
