vendor = require('postcss/lib/vendor')
Value  = require('./value')
utils  = require('./utils')

class Processor
  constructor: (@prefixes) ->

  # Add necessary prefixes
  add: (css) ->
    # Keyframes
    prefixes = @prefixes.add['@keyframes']
    css.eachAtRule( (rule) -> prefixes.process(rule) ) if prefixes

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
    for selector in @prefixes.remove.selectors
      css.eachRule (rule, i) =>
        if rule.selector.indexOf(selector) != -1
          rule.parent.remove(i)

    css.eachDecl (decl, i) =>
      rule       = decl.parent
      unprefixed = @prefixes.unprefixed(decl.prop)

      # Properties
      if @prefixes.remove[decl.prop]?.remove
        if rule.some( (other) -> other.prop == unprefixed )
          rule.remove(i)
          return

      # Values
      for checker in @prefixes.values('remove', unprefixed)
        if checker.check(decl.value)
          rule.remove(i)
          return

module.exports = Processor
