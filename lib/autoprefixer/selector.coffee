Prefixer = require('./prefixer')
utils    = require('./utils')

class Selector extends Prefixer

  # Is rule selectors need to be prefixed
  check: (rule) ->
    rule.selector.indexOf(@name) != -1

  # Return prefixed version of selector
  prefixed: (prefix) ->
    @name.replace(/^([^\w]*)/, '$1' + prefix)

  # Lazy loadRegExp for name
  regexp: ->
    @regexpCache ||= new RegExp(utils.escapeRegexp(@name), 'gi')

  # Replace selectors by prefixed one
  replace: (selector, prefix) ->
    selector.replace(@regexp(), @prefixed(prefix))

  # Clone and add prefixes for at-rule
  add: (rule, prefix) ->
    prefixed = @replace(rule.selector, prefix)

    return if rule.parent.some (i) -> i.selector == prefixed

    cloned = @clone(rule, selector: prefixed)
    rule.parent.insertBefore(rule, cloned)

module.exports = Selector
