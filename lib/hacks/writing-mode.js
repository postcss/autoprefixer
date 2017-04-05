Declaration = require('../declaration')

class WritingMode extends Declaration
  @names = ['writing-mode']

  @msValues =
    'horizontal-tb': 'lr-tb'
    'vertical-rl':   'tb-rl'
    'vertical-lr':   'tb-lr'

  set: (decl, prefix) ->
    if prefix == '-ms-'
      decl.value = WritingMode.msValues[decl.value] || decl.value
      super(decl, prefix)
    else
      super

module.exports = WritingMode
