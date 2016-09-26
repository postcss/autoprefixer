Declaration = require('../declaration')

class GridRowAlign extends Declaration
  @names = ['grid-row-align']

  # Do not prefix flexbox values
  check: (decl) ->
    decl.value.indexOf('flex-') == -1 and decl.value != 'baseline'

  # Change property name for IE
  prefixed: (prop, prefix) ->
    prefix + 'grid-row-align'

  # Change IE property back
  normalize: (prop) ->
    'align-self'

module.exports = GridRowAlign
