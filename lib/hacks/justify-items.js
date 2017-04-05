Declaration = require('../declaration')

class JustifyItems extends Declaration
  @names = ['justify-items', 'grid-column-align']

  # Change property name for IE
  prefixed: (prop, prefix) ->
    prefix + if prefix == '-ms-'
      'grid-column-align'
    else
      prop

  # Change IE property back
  normalize: (prop) ->
    'justify-items'

module.exports = JustifyItems
