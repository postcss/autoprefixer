Declaration = require('../declaration')

class BreakInside extends Declaration
  @names = ['break-inside', 'page-break-inside', 'column-break-inside']

  # Change name for -webkit- and -moz- prefix
  prefixed: (prop, prefix) ->
    if prefix == '-webkit-'
      prefix + 'column-break-inside'
    else if prefix == '-moz-'
      'page-break-inside'
    else
      super

  # Return property name by final spec
  normalize: ->
    'break-inside'

  # Change prefixed value for avoid-column and avoid-page
  set: (decl, prefix) ->
    if decl.value == 'avoid-column' or decl.value == 'avoid-page'
      decl.value = 'avoid'
    super

  # Don’t prefix some values
  insert: (decl, prefix, prefixes) ->
    if decl.value == 'avoid-region'
      return
    else if decl.value == 'avoid-page' and prefix == '-webkit-'
      return
    else
      super

module.exports = BreakInside
