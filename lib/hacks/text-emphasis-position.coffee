Declaration = require('../declaration')

class TextEmphasisPosition extends Declaration
  @names = ['text-emphasis-position']

  set: (decl, prefix) ->
    if prefix == '-webkit-'
      decl.value = decl.value.replace(/\s*(right|left)\s*/i, '')
      super(decl, prefix)
    else
      super

module.exports = TextEmphasisPosition
