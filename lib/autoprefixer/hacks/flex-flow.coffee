FlexDeclaration = require('./flex-declaration')

class FlexFlow extends FlexDeclaration
  @names = ['flex-flow']

  # Don't add prefix for 2009 spec
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2012'
      super
    else if spec == 'final'
      super

module.exports = FlexFlow
