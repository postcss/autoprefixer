flexSpec = require('./flex-spec')
OldValue = require('../old-value')
Value    = require('../value')

class DisplayGrid extends Value
  @names = ['display-grid', 'inline-grid']

  constructor: (name, prefixes) ->
    super
    @name = 'grid' if name == 'display-grid'

  # Faster check for flex value
  check: (decl) ->
    decl.prop == 'display' and decl.value == @name

module.exports = DisplayGrid
