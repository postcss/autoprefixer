Prefixer = require('./prefixer')

class Declaration extends Prefixer

  # All vendor prefixes
  @prefixes: []

  # Always true, because we already get prefixer by property name
  check: (decl) ->
    true

  # Return prefixed version of property
  prefixed: (prefix) ->
    prefix + @name

  # Check `value`, that it contain other prefixes, rather than `prefix`
  otherPrefixes: (value, prefix) ->
    for other in Declaration.prefixes
      continue if other == prefix
      return true if value.indexOf(other) != -1
    return false

  # Clone and add prefixes for declaration
  add: (decl, prefix) ->
    prefixed = @prefixed(prefix)

    return if decl.parent.some (i) -> i.prop == prefixed
    return if @otherPrefixes(decl.value, prefix)

    clone = decl.clone(prop: prefixed)
    decl.parent.insertBefore(decl, clone)

module.exports = Declaration
