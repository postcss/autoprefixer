list = require('postcss/lib/list')

Value = require('../value')

class ImageSet extends Value
  @names = ['image-set']

  # Use non-standard name for WebKit and Firefox
  replace: (string, prefix) ->
    if prefix == '-webkit-'
      super.replace(/("[^"]+"|'[^']+')(\s+\d+\w)/gi, 'url($1)$2')
    else
      super

module.exports = ImageSet
