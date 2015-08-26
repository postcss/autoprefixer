vendor = require('postcss/lib/vendor')
Value  = require('./value')
utils  = require('./utils')

class Processor
  constructor: (@prefixes) ->

  # Add necessary prefixes
  add: (css, result) ->
    # At-rules
    resolution = @prefixes.add['@resolution']
    keyframes  = @prefixes.add['@keyframes']
    viewport   = @prefixes.add['@viewport']
    supports   = @prefixes.add['@supports']

    css.walkAtRules (rule) =>
      if rule.name == 'keyframes'
        keyframes?.process(rule) if not @disabled(rule)
      else if rule.name == 'viewport'
        viewport?.process(rule) if not @disabled(rule)
      else if rule.name == 'supports'
        supports.process(rule) if not @disabled(rule)
      else if rule.name == 'media' and rule.params.indexOf('-resolution') != -1
        resolution?.process(rule) if not @disabled(rule)

    # Selectors
    css.walkRules (rule) =>
      return if @disabled(rule)
      for selector in @prefixes.add.selectors
        selector.process(rule, result)

    # Properties
    css.walkDecls (decl) =>
      if decl.prop == 'display' and decl.value == 'box'
        result.warn('You should write display: flex by final spec ' +
                    'instead of display: box', node: decl)
        return

      prefix = @prefixes.add[decl.prop]
      if prefix and prefix.prefixes
        prefix.process(decl, result) if not @disabled(decl)

    # Values
    css.walkDecls (decl) =>
      return if @disabled(decl)

      unprefixed = @prefixes.unprefixed(decl.prop)
      for value in @prefixes.values('add', unprefixed)
        value.process(decl, result)
      Value.save(@prefixes, decl)

  # Remove unnecessary pefixes
  remove: (css) ->
    # At-rules
    resolution = @prefixes.remove['@resolution']

    css.walkAtRules (rule, i) =>
      if @prefixes.remove['@' + rule.name]
        rule.parent.removeChild(i) if not @disabled(rule)
      else if rule.name == 'media' and rule.params.indexOf('-resolution') != -1
        resolution?.clean(rule)

    # Selectors
    for checker in @prefixes.remove.selectors
      css.walkRules (rule, i) =>
        if checker.check(rule)
          rule.parent.removeChild(i) if not @disabled(rule)

    css.walkDecls (decl, i) =>
      return if @disabled(decl)

      rule       = decl.parent
      unprefixed = @prefixes.unprefixed(decl.prop)

      # Properties
      if @prefixes.remove[decl.prop]?.remove
        notHack = @prefixes.group(decl).down (other) -> other.prop == unprefixed

        if notHack and not @withHackValue(decl)
          @reduceSpaces(decl) if decl.raw('before').indexOf("\n") > -1
          rule.removeChild(i)
          return

      # Values
      for checker in @prefixes.values('remove', unprefixed)
        if checker.check(decl.value)
          unprefixed = checker.unprefixed
          notHack    = @prefixes.group(decl).down (other) ->
            other.value.indexOf(unprefixed) != -1

          if notHack
            rule.removeChild(i)
            return
          else if checker.clean
            checker.clean(decl)
            return

  # Some rare old values, which is not in standard
  withHackValue: (decl) ->
    decl.prop == '-webkit-background-clip' and decl.value == 'text'

  # Check for control comment
  disabled: (node) ->
    if node._autoprefixerDisabled?
      node._autoprefixerDisabled

    else if node.nodes
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

    else if node.parent
      node._autoprefixerDisabled = @disabled(node.parent)

    else
      # unknown state
      false

  # Normalize spaces in cascade declaration group
  reduceSpaces: (decl) ->
    stop = false
    @prefixes.group(decl).up (other) -> stop = true
    return if stop

    parts   = decl.raw('before').split("\n")
    prevMin = parts[parts.length - 1].length
    diff    = false

    @prefixes.group(decl).down (other) ->
      parts = other.raw('before').split("\n")
      last  = parts.length - 1

      if parts[last].length > prevMin
        diff = parts[last].length - prevMin if diff == false
        parts[last] = parts[last][0...-diff]

        other.raws.before = parts.join("\n")

module.exports = Processor
