Declaration = require('../declaration')

class BorderRadius extends Declaration
  @names     = ['border-radius']
  @toMozilla = { }
  @toNormal  = { }

  for ver in ['top', 'bottom']
    for hor in ['left', 'right']
      normal  = "border-#{ver}-#{hor}-radius"
      mozilla = "border-radius-#{ver}#{hor}"

      @names.push(normal)
      @names.push(mozilla)

      @toMozilla[normal] = mozilla
      @toNormal[mozilla] = normal

  # Normalize property name to understand old Mozilla syntax
  constructor: ->
    super
    if @prefix == '-moz-'
      @unprefixed = BorderRadius.toNormal[@unprefixed] || @unprefixed
      @prop = @prefix + @unprefixed

  # Change syntax, when add Mozilla prefix
  prefixProp: (prefix) ->
    if prefix == '-moz-'
      prop = BorderRadius.toMozilla[@unprefixed] || @unprefixed
      return if @rule.contain(prefix + prop)
      @insertBefore(prefix + prop, @value)
    else
      super

module.exports = BorderRadius
