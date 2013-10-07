FlexDeclaration = require('./flex-declaration')

class DisplayFlex extends FlexDeclaration
  @names = ['display']

  # Normalize property name
  constructor: ->
    super
    [prefix, name] = FlexDeclaration.split(@value)
    if name == 'flex' or name == 'box' or name == 'flexbox'
      @prefix     = prefix
      @unprefixed = 'display-flex'
      @prop       = @prefix + @unprefixed
    else if name == 'inline-flex' or name == 'inline-flexbox'
      @prefix     = prefix
      @unprefixed = 'display-flex'
      @prop       = @prefix + @unprefixed
      @inline     = true

  # Add prefix to value depend on flebox spec version
  prefixProp: (prefix) ->
    if @unprefixed != 'display-flex'
      super
    else
      [spec, prefix] = @flexSpec(prefix)
      if spec == '2009'
        @prefixDisplay(prefix, 'box') unless @inline
      else if spec == '2012'
        @prefixDisplay(prefix, if @inline then 'inline-flexbox' else 'flexbox')
      else if spec ==  'final'
        @prefixDisplay(prefix, if @inline then 'inline-flex' else 'flex')

  # Prefix value
  prefixDisplay: (prefix, name) ->
    @insertBefore('display', prefix + name)

module.exports = DisplayFlex
