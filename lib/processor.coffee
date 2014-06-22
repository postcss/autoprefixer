vendor = require('postcss/lib/vendor')
Value  = require('./value')
utils  = require('./utils')

class Processor
  constructor: (@prefixes) ->

  # Add necessary prefixes
  add: (css) ->
    # At-rules
    keyframes = @prefixes.add['@keyframes']
    supports  = @prefixes.add['@supports']

    css.eachAtRule (rule) ->
      if rule.name == 'keyframes'
        keyframes?.process(rule)
      else if rule.name == 'supports'
        supports.process(rule)

    # Selectors
    for selector in @prefixes.add.selectors
      css.eachRule (rule) -> selector.process(rule)

    # Properties
    css.eachDecl (decl) =>
      prefix = @prefixes.add[decl.prop]
      prefix.process(decl) if prefix and prefix.prefixes

    # Values
    css.eachDecl (decl) =>
      unprefixed = @prefixes.unprefixed(decl.prop)
      for value in @prefixes.values('add', unprefixed)
        value.process(decl)
      Value.save(@prefixes, decl)

  # Remove unnecessary pefixes
  remove: (css) ->
    # Keyframes
    css.eachAtRule (rule, i) =>
      if @prefixes.remove['@' + rule.name]
        rule.parent.remove(i)

    # Selectors
    for checker in @prefixes.remove.selectors
      css.eachRule (rule, i) =>
        rule.parent.remove(i) if checker.check(rule)

    css.eachDecl (decl, i) =>
      rule       = decl.parent
      unprefixed = @prefixes.unprefixed(decl.prop)

      # Properties
      if @prefixes.remove[decl.prop]?.remove
        notHack = @prefixes.group(decl).down (other) -> other.prop == unprefixed

        if notHack
          @reduceSpaces(decl) if decl.before.indexOf("\n") > -1
          rule.remove(i)
          return

      # Values
      for checker in @prefixes.values('remove', unprefixed)
        if checker.check(decl.value)
          rule.remove(i)
          return

  # Normalize spaces in cascade declaration group
  reduceSpaces: (decl) ->
    stop = false
    @prefixes.group(decl).up (other) -> stop = true
    return if stop

    parts   = decl.before.split("\n")
    prevMin = parts[parts.length - 1].length
    diff    = false

    @prefixes.group(decl).down (other) ->
      parts = other.before.split("\n")
      last  = parts.length - 1

      if parts[last].length > prevMin
        diff = parts[last].length - prevMin if diff == false
        parts[last] = parts[last][0...-diff]

        other.before = parts.join("\n")

module.exports = Processor
