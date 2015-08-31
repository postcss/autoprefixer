Declaration = require('../declaration')

class MaskBoxImage extends Declaration
  @names = ['mask-box-image', 'mask-box-image-repeat',
            'mask-box-image-source', 'mask-box-image-outset',
            'mask-box-image-width', 'mask-box-image-slice']

  # Return property name by final spec
  normalize: ->
    @name.replace('border', 'box-image')

  # Return flex property for 2012 spec
  prefixed: (prop, prefix) ->
    if prefix == '-webkit-'
      super.replace('box-image', 'border')
    else
      super

module.exports = MaskBoxImage
