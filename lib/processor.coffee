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

    css.eachAtRule (rule) =>
      if rule.name == 'keyframes'
        keyframes?.process(rule) if not @disabled(rule)
      else if rule.name == 'supports'
        supports.process(rule) if not @disabled(rule)

    # Selectors
    css.eachRule (rule) =>
      return if @disabled(rule)
      for selector in @prefixes.add.selectors
        selector.process(rule)

    # Properties
    css.eachDecl (decl) =>
      prefix = @prefixes.add[decl.prop]
      if prefix and prefix.prefixes
        prefix.process(decl) if not @disabled(decl)

    # Values
    css.eachDecl (decl) =>
      return if @disabled(decl)

      unprefixed = @prefixes.unprefixed(decl.prop)
      for value in @prefixes.values('add', unprefixed)
        value.process(decl)
      Value.save(@prefixes, decl)

  # Remove unnecessary pefixes
  remove: (css) ->
    # Keyframes
    css.eachAtRule (rule, i) =>
      if @prefixes.remove['@' + rule.name]
        rule.parent.remove(i) if not @disabled(rule)

    # Selectors
    for checker in @prefixes.remove.selectors
      css.eachRule (rule, i) =>
        if checker.check(rule)
          rule.parent.remove(i) if not @disabled(rule)

    css.eachDecl (decl, i) =>
      return if @disabled(decl)

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

  # Check for control comment
  disabled: (node) ->
    if node._autoprefixerDisabled?
      node._autoprefixerDisabled

    else if node.childs
      status = undefined
      node.each (i) ->
        return unless i.type == 'comment'
        if i.text == 'autoprefixer: off'
          status = false
          return false
        else if i.text == 'autoprefixer: on'
          status = true
          return false

      node._autoprefixerDisabled = if status?
        !status
      else if node.parent
        @disabled(node.parent)
      else
        false

    else
      node._autoprefixerDisabled = @disabled(node.parent)

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
