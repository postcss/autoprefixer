Declaration = require('../declaration')

class GridRowAlign extends Declaration
  @names = ['grid-row-align']

  # Change property name for IE
  prefixed: (prop, prefix) ->
    prefix + 'grid-row-align'

  # Change IE property back
  normalize: (prop) ->
    'align-items'

module.exports = GridRowAlign
