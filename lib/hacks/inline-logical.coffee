Declaration = require('../declaration')

class InlineLogical extends Declaration
  @names = ['margin-inline-start',  'margin-inline-end',
            'padding-inline-start', 'padding-inline-end',
            'margin-start', 'margin-end', 'padding-start', 'padding-end']

  # Use old syntax for -moz- and -webkit-
  prefixed: (prop, prefix) ->
    prefix + prop.replace('-inline', '')

  # Return property name by spec
  normalize: (prop) ->
    prop.replace(/(margin|padding)-(start|end)/, '$1-inline-$2')

module.exports = InlineLogical
