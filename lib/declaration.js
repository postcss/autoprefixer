Prefixer = require('./prefixer')
Browsers = require('./browsers')
utils    = require('./utils')

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

  # Should we use visual cascade for prefixes
  needCascade: (decl) ->
    decl._autoprefixerCascade ||= @all.options.cascade != false and
                                  decl.raw('before').indexOf('\n') != -1

  # Return maximum length of possible prefixed property
  maxPrefixed: (prefixes, decl) ->
    return decl._autoprefixerMax if decl._autoprefixerMax

    max = 0
    for prefix in prefixes
      prefix = utils.removeNote(prefix)
      max    = prefix.length if prefix.length > max

    decl._autoprefixerMax = max

  # Calculate indentation to create visual cascade
  calcBefore: (prefixes, decl, prefix = '') ->
    before = decl.raw('before')
    max    = @maxPrefixed(prefixes, decl)
    diff   = max - utils.removeNote(prefix).length
    for i in [0...diff]
      before += ' '
    before

  # Remove visual cascade
  restoreBefore: (decl) ->
    lines = decl.raw('before').split("\n")
    min   = lines[lines.length - 1]

    @all.group(decl).up (prefixed) ->
      array = prefixed.raw('before').split("\n")
      last  = array[array.length - 1]
      min   = last if last.length < min.length

    lines[lines.length - 1] = min
    decl.raws.before = lines.join("\n")

  # Clone and insert new declaration
  insert: (decl, prefix, prefixes) ->
    cloned = @set(@clone(decl), prefix)
    return unless cloned

    already = decl.parent.some (i) ->
      i.prop == cloned.prop and i.value == cloned.value
    return if already

    if @needCascade(decl)
      cloned.raws.before = @calcBefore(prefixes, decl, prefix)
    decl.parent.insertBefore(decl, cloned)

  # Did this declaration has this prefix above
  isAlready: (decl, prefixed) ->
    already   = @all.group(decl).up   (i) -> i.prop == prefixed
    already ||= @all.group(decl).down (i) -> i.prop == prefixed
    return already

  # Clone and add prefixes for declaration
  add: (decl, prefix, prefixes) ->
    prefixed = @prefixed(decl.prop, prefix)
    return if @isAlready(decl, prefixed) or @otherPrefixes(decl.value, prefix)
    @insert(decl, prefix, prefixes)

  # Add spaces for visual cascade
  process: (decl) ->
    if @needCascade(decl)
      prefixes = super
      if prefixes?.length
        @restoreBefore(decl)
        decl.raws.before = @calcBefore(prefixes, decl)
    else
      super

  # Return list of prefixed properties to clean old prefixes
  old: (prop, prefix) ->
    [@prefixed(prop, prefix)]

module.exports = Declaration
