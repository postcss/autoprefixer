OldSelector = require('./old-selector')
Prefixer    = require('./prefixer')
Browsers    = require('./browsers')
utils       = require('./utils')

class Selector extends Prefixer
  constructor: (@name, @prefixes, @all) ->
    @regexpCache = { }

  # Is rule selectors need to be prefixed
  check: (rule) ->
    if rule.selector.indexOf(@name) != -1
      !!rule.selector.match(@regexp())
    else
      false

  # Return prefixed version of selector
  prefixed: (prefix) ->
    @name.replace(/^([^\w]*)/, '$1' + prefix)

  # Lazy loadRegExp for name
  regexp: (prefix) ->
    return @regexpCache[prefix] if @regexpCache[prefix]

    name = if prefix then @prefixed(prefix) else @name
    @regexpCache[prefix] = /// (^|[^:"'=]) #{ utils.escapeRegexp(name) } ///gi

  # All possible prefixes
  possible: ->
    Browsers.prefixes()

  # Return all possible selector prefixes
  prefixeds: (rule) ->
    return rule._autoprefixerPrefixeds if rule._autoprefixerPrefixeds

    prefixeds = { }
    for prefix in @possible()
      prefixeds[prefix] = @replace(rule.selector, prefix)

    rule._autoprefixerPrefixeds = prefixeds

  # Is rule already prefixed before
  already: (rule, prefixeds, prefix) ->
    index = rule.parent.index(rule) - 1

    while index >= 0
      before = rule.parent.nodes[index]

      return false if before.type != 'rule'

      some = false
      for key, prefixed of prefixeds
        if before.selector == prefixed
          if prefix == key
            return true
          else
            some = true
            break
      return false unless some

      index -= 1

    false

  # Replace selectors by prefixed one
  replace: (selector, prefix) ->
    selector.replace(@regexp(), '$1' + @prefixed(prefix))

  # Clone and add prefixes for at-rule
  add: (rule, prefix) ->
    prefixeds = @prefixeds(rule)

    return if @already(rule, prefixeds, prefix)

    cloned = @clone(rule, selector: prefixeds[prefix])
    rule.parent.insertBefore(rule, cloned)

  # Return function to fast find prefixed selector
  old: (prefix) ->
    new OldSelector(@, prefix)

module.exports = Selector
