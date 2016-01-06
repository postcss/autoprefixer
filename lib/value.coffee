Prefixer = require('./prefixer')
OldValue = require('./old-value')
utils    = require('./utils')

vendor = require('postcss/lib/vendor')

class Value extends Prefixer

  # Clone decl for each prefixed values
  @save: (prefixes, decl) ->
    prop = decl.prop
    for prefix, value of decl._autoprefixerValues
      continue if value == decl.value

      propPrefix = vendor.prefix(prop)
      if propPrefix == prefix
        decl.value = value
      else if propPrefix == '-pie-'
        continue
      else
        prefixed = prefixes.prefixed(prop, prefix)
        rule     = decl.parent
        if rule.every( (i) -> i.prop != prefixed )
          trimmed = value.replace(/\s+/, ' ')
          already = rule.some (i) ->
            i.prop == decl.prop and i.value.replace(/\s+/, ' ') == trimmed

          unless already
            cloned = @clone(decl, value: value)
            decl.parent.insertBefore(decl, cloned)

  # Is declaration need to be prefixed
  check: (decl) ->
    value = decl.value
    if value.indexOf(@name) != -1
      !!value.match(@regexp())
    else
      false

  # Lazy regexp loading
  regexp: ->
    @regexpCache ||= utils.regexp(@name)

  # Add prefix to values in string
  replace: (string, prefix) ->
    string.replace(@regexp(), '$1' + prefix + '$2')

  # Get value with comments if it was not changed
  value: (decl) ->
    if decl.raws.value and decl.raws.value.value == decl.value
      decl.raws.value.raw
    else
      decl.value

  # Save values with next prefixed token
  add: (decl, prefix) ->
    decl._autoprefixerValues ||= { }
    value = decl._autoprefixerValues[prefix] || @value(decl)
    value = @replace(value, prefix)
    decl._autoprefixerValues[prefix] = value if value

  # Return function to fast find prefixed value
  old: (prefix) ->
    new OldValue(@name, prefix + @name)

module.exports = Value
