flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class AlignContent extends Declaration
  @names = ['align-content', 'flex-line-pack']

  @oldValues =
    'flex-end':      'end'
    'flex-start':    'start'
    'space-between': 'justify'
    'space-around':  'distribute'

  # Change property name for 2012 spec
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      prefix + 'flex-line-pack'
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    'align-content'

  # Change value for 2012 spec and ignore prefix for 2009
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2012
      decl.value = AlignContent.oldValues[decl.value] || decl.value
      super(decl, prefix)
    else if spec == 'final'
      super

module.exports = AlignContent
