FlexDeclaration = require('./flex-declaration')

class FlexDirection extends FlexDeclaration
  @names = ['flex-direction', 'box-direction', 'box-orient']

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'flex-direction'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2009 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2009'
      orient = if @value.indexOf('row') != -1 then 'horizontal' else 'vertical'
      @insertBefore(prefix + 'box-orient', orient)

      dir = if @value.indexOf('reverse') != -1 then 'reverse' else 'normal'
      @insertBefore(prefix + 'box-direction', dir)
    else
      super

module.exports = FlexDirection
