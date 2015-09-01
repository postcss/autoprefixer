Declaration = require('../declaration')

class BreakProps extends Declaration
  @names = ['break-inside', 'page-break-inside', 'column-break-inside',
            'break-before', 'page-break-before', 'column-break-before',
            'break-after',  'page-break-after',  'column-break-after']

  # Change name for -webkit- and -moz- prefix
  prefixed: (prop, prefix) ->
    if prefix == '-webkit-'
      '-webkit-column-' + prop
    else if prefix == '-moz-'
      'page-' + prop
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    if prop.indexOf('inside') != -1
      'break-inside'
    else if prop.indexOf('before') != -1
      'break-before'
    else if prop.indexOf('after') != -1
      'break-after'

  # Change prefixed value for avoid-column and avoid-page
  set: (decl, prefix) ->
    v = decl.value
    if decl.prop == 'break-inside' and v == 'avoid-column' or v == 'avoid-page'
      decl.value = 'avoid'
    super

  # Don’t prefix some values
  insert: (decl, prefix, prefixes) ->
    if decl.prop != 'break-inside'
      super
    else if decl.value == 'avoid-region'
      return
    else if decl.value == 'avoid-page' and prefix == '-webkit-'
      return
    else
      super

module.exports = BreakProps
