let Declaration = require('../declaration')

class TextEmphasisPosition extends Declaration {
  static names = ['text-emphasis-position']

  set (decl, prefix) {
    if (prefix === '-webkit-') {
      decl.value = decl.value.replace(/\s*(right|left)\s*/i, '')
    }
    return super.set(decl, prefix)
  }
}

module.exports = TextEmphasisPosition
