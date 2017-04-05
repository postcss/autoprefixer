vendor = require('postcss/lib/vendor')
Value  = require('./value')
utils  = require('./utils')

OLD_DIRECTION = /(^|[^-])(linear|radial)-gradient\(\s*(top|left|right|bottom)/i

SIZES = ['width', 'height',  'min-width',  'max-width',
         'min-height', 'max-height', 'inline-size',
         'min-inline-size', 'max-inline-size', 'block-size',
         'min-block-size',  'max-block-size']

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
        if @prefixes.options.supports != false and not @disabled(rule)
          supports.process(rule)
      else if rule.name == 'media' and rule.params.indexOf('-resolution') != -1
        resolution?.process(rule) if not @disabled(rule)

    # Selectors
    css.walkRules (rule) =>
      return if @disabled(rule)
      for selector in @prefixes.add.selectors
        selector.process(rule, result)

    css.walkDecls (decl) =>
      return if @disabled(decl)

      if decl.prop == 'display' and decl.value == 'box'
        result.warn('You should write display: flex by final spec ' +
                    'instead of display: box', node: decl)
        return
      if decl.value.indexOf('linear-gradient') != -1
        if OLD_DIRECTION.test(decl.value)
          result.warn('Gradient has outdated direction syntax. ' +
                      'New syntax is like `to left` instead of `right`.',
                      node: decl)
      if decl.prop == 'text-emphasis-position'
        if decl.value == 'under' or decl.value == 'over'
          result.warn('You should use 2 values for text-emphasis-position ' +
                      'For example, `under left` instead of just `under`.',
                      node: decl)

      if SIZES.indexOf(decl.prop) != -1
        if decl.value.indexOf('fill-available') != -1
          result.warn('Replace fill-available to stretch, ' +
                      'because spec had been changed',
                      node: decl)
        else if decl.value.indexOf('fill') != -1
          result.warn('Replace fill to stretch, because spec had been changed',
                      node: decl)

      if @prefixes.options.flexbox != false
        if decl.prop == 'grid-row-end' and decl.value.indexOf('span') == -1
          result.warn('IE supports only grid-row-end with span. ' +
                      'You should add grid: false option to Autoprefixer ' +
                      'and use some JS grid polyfill for full spec support',
                      node: decl)
        if decl.prop == 'grid-row'
          if decl.value.indexOf('/') != -1 and decl.value.indexOf('span') == -1
            result.warn('IE supports only grid-row with / and span. ' +
                        'You should add grid: false option to Autoprefixer ' +
                        'and use some JS grid polyfill for full spec support',
                        node: decl)

      if decl.prop == 'transition' or decl.prop == 'transition-property'
        # Transition
        @prefixes.transition.add(decl, result)

      else if decl.prop == 'align-self'
        # align-self flexbox or grid
        display = @displayType(decl)
        if display != 'grid' and @prefixes.options.flexbox != false
          prefixer = @prefixes.add['align-self']
          if prefixer and prefixer.prefixes
            prefixer.process(decl)
        if display != 'flex' and @prefixes.options.grid != false
          prefixer = @prefixes.add['grid-row-align']
          if prefixer and prefixer.prefixes
            prefixer.process(decl)

      else
        # Properties
        prefixer = @prefixes.add[decl.prop]
        if prefixer and prefixer.prefixes
          prefixer.process(decl)

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

      # Transition
      if decl.prop == 'transition' or decl.prop == 'transition-property'
        @prefixes.transition.remove(decl)

      # Properties
      if @prefixes.remove[decl.prop]?.remove
        notHack = @prefixes.group(decl).down (other) =>
          @prefixes.normalize(other.prop) == unprefixed

        notHack = true if unprefixed == 'flex-flow'

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

  # Check for control comment and global options
  disabled: (node) ->
    if @prefixes.options.grid == false and node.type == 'decl'
      if node.prop == 'display' and node.value.indexOf('grid') != -1
        return true
      if node.prop.indexOf('grid') != -1 or node.prop == 'justify-items'
        return true
    if @prefixes.options.flexbox == false and node.type == 'decl'
      if node.prop == 'display' and node.value.indexOf('flex') != -1
        return true
      other = ['order', 'justify-content', 'align-items', 'align-content']
      if node.prop.indexOf('flex') != -1 or other.indexOf(node.prop) != -1
        return true

    if node._autoprefixerDisabled?
      node._autoprefixerDisabled

    else if node.nodes
      status = undefined
      node.each (i) ->
        return unless i.type == 'comment'
        if /(!\s*)?autoprefixer:\s*off/i.test(i.text)
          status = false
          return false
        else if /(!\s*)?autoprefixer:\s*on/i.test(i.text)
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

  # Is it flebox or grid rule
  displayType: (decl) ->
    for i in decl.parent.nodes
      if i.prop == 'display'
        if i.value.indexOf('flex') != -1
          return 'flex'
        else if i.value.indexOf('grid') != -1
          return 'grid'
    return false

module.exports = Processor
