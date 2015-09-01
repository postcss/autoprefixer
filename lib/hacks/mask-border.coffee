Declaration = require('../declaration')

class MaskBorder extends Declaration
  @names = ['mask-border',        'mask-border-source',
            'mask-border-slice',  'mask-border-width',
            'mask-border-outset', 'mask-border-repeat',
            'mask-box-image',        'mask-box-image-source',
            'mask-box-image-slice',  'mask-box-image-width',
            'mask-box-image-outset', 'mask-box-image-repeat']

  # Return property name by final spec
  normalize: ->
    @name.replace('box-image', 'border')

  # Return flex property for 2012 spec
  prefixed: (prop, prefix) ->
    if prefix == '-webkit-'
      super.replace('border', 'box-image')
    else
      super

module.exports = MaskBorder
