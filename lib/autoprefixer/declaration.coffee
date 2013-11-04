Prefixer = require('./prefixer')
Browsers = require('./browsers')
vendor   = require('postcss/lib/vendor')

class Declaration extends Prefixer

  # Always true, because we already get prefixer by property name
  check: (decl) ->
    true

  # Return prefixed version of property
  prefixed: (prop, prefix) ->
    prefix + prop

  # Return unprefixed version of property
  normalize: (prop) ->
    prop

  # Check `value`, that it contain other prefixes, rather than `prefix`
  otherPrefixes: (value, prefix) ->
    for other in Browsers.prefixes()
      continue if other == prefix
      return true if value.indexOf(other) != -1
    return false

  # Set prefix to declaration
  set: (decl, prefix) ->
    decl.prop = @prefixed(decl.prop, prefix)
    decl

  # Clone and add prefixes for declaration
  add: (decl, prefix) ->
    prefixed = @prefixed(decl.prop, prefix)

    return if decl.parent.some (i) -> i.prop == prefixed
    return if @otherPrefixes(decl.value, prefix)

    cloned = @set(@clone(decl), prefix)
    decl.parent.insertBefore(decl, cloned)

module.exports = Declaration
