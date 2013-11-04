flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class JustifyContent extends Declaration
  @names = ['justify-content', 'flex-pack', 'box-pack']

  @oldValues =
    'flex-end':      'end'
    'flex-start':    'start'
    'space-between': 'justify'
    'space-around':  'distribute'

  # Change property name for 2009 and 2012 specs
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      prefix + 'box-pack'
    else if spec == 2012
      prefix + 'flex-pack'
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    'justify-content'

  # Change value for 2009 and 2012 specs
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2009 or spec == 2012
      value = JustifyContent.oldValues[decl.value] || decl.value
      decl.value = value
      super(decl, prefix) if spec != 2009 or value != 'distribute'
    else if spec == 'final'
      super

module.exports = JustifyContent
