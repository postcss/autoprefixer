Declaration = require('../declaration')

class BlockLogical extends Declaration
  @names = ['border-block-start',  'border-block-end',
            'margin-block-start',  'margin-block-end',
            'padding-block-start', 'padding-block-end',
            'border-before',  'border-after',
            'margin-before',  'margin-after',
            'padding-before', 'padding-after']

  # Use old syntax for -moz- and -webkit-
  prefixed: (prop, prefix) ->
    prefix + if prop.indexOf('-start') != -1
      prop.replace('-block-start', '-before')
    else
      prop.replace('-block-end', '-after')

  # Return property name by spec
  normalize: (prop) ->
    if prop.indexOf('-before') != -1
      prop.replace('-before', '-block-start')
    else
      prop.replace('-after', '-block-end')

module.exports = BlockLogical
