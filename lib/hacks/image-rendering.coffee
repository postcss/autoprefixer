Declaration = require('../declaration')

class ImageRendering extends Declaration
  @names = ['image-rendering', 'interpolation-mode']

  # Add hack only for crisp-edges
  check: (decl) ->
    decl.value == 'pixelated'

  # Change property name for IE
  prefixed: (prop, prefix) ->
    if prefix == '-ms-'
      '-ms-interpolation-mode'
    else
      super

  # Change property and value for IE
  set: (decl, prefix) ->
    if prefix == '-ms-'
      decl.prop  = '-ms-interpolation-mode'
      decl.value = 'nearest-neighbor'
      decl
    else
      super

  # Return property name by spec
  normalize: (prop) ->
    'image-rendering'

  # Warn on old value
  process: (node, result) ->
    if @name == 'image-rendering' and node.value == 'crisp-edges'
      result.warn('There is no browsers with crisp-edges rendering support.' +
                  'Maybe you mean pixelated?', node: node)

    super

module.exports = ImageRendering
