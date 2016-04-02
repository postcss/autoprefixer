flexSpec = require('./flex-spec')
OldValue = require('../old-value')
Value    = require('../value')

class DisplayFlex extends Value
  @names = ['display-flex', 'inline-flex']

  constructor: (name, prefixes) ->
    super
    @name = 'flex' if name == 'display-flex'

  # Faster check for flex value
  check: (decl) ->
    decl.prop == 'display' and decl.value == @name

  # Return value by spec
  prefixed: (prefix) ->
    [spec, prefix] = flexSpec(prefix)

    prefix + if spec == 2009
      if @name == 'flex' then 'box' else 'inline-box'
    else if spec == 2012
      if @name == 'flex' then 'flexbox' else 'inline-flexbox'
    else if spec ==  'final'
      @name

  # Add prefix to value depend on flebox spec version
  replace: (string, prefix) ->
    @prefixed(prefix)

  # Change value for old specs
  old: (prefix) ->
    prefixed = @prefixed(prefix)
    new OldValue(@name, prefixed) if prefixed

module.exports = DisplayFlex
