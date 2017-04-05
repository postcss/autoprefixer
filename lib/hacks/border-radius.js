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

  # Change syntax, when add Mozilla prefix
  prefixed: (prop, prefix) ->
    if prefix == '-moz-'
      prefix + (BorderRadius.toMozilla[prop] || prop)
    else
      super

  # Return unprefixed version of property
  normalize: (prop) ->
    BorderRadius.toNormal[prop] || prop

module.exports = BorderRadius
