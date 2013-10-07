Declaration = require('../declaration')

# Common code from flexbox declarations hacks
class FlexDeclaration extends Declaration

  # Return flexbox spec versions by prefix
  flexSpec: (prefix) ->
    spec = if prefix == '-webkit- 2009' or prefix == '-moz-'
      '2009'
    else if prefix == '-ms-'
      '2012'
    else if prefix == '-webkit-'
      'final'
    prefix = '-webkit-' if prefix == '-webkit- 2009'

    [spec, prefix]

module.exports = FlexDeclaration
