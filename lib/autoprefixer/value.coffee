Prefixer = require('./prefixer')
OldValue = require('./old-value')
vendor   = require('postcss/lib/vendor')
utils    = require('./utils')

class Value extends Prefixer

  # Clone decl for each prefixed values
  @save: (prefixes, decl) ->
    for prefix, value of decl._autoprefixerValues
      continue if value == decl.value

      if vendor.prefix(decl.prop) == utils.removeNote(prefix)
        decl.value = value
      else
        prefixed = prefixes.prefixed(decl.prop, prefix)
        rule     = decl.parent
        if rule.every( (i) -> i.prop != prefixed )
          if rule.every( (i) -> i.prop != decl.prop or i.value != value )
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

  # Save values with next prefixed token
  add: (decl, prefix) ->
    decl._autoprefixerValues ||= { }
    value = decl._autoprefixerValues[prefix] || decl.value
    value = @replace(value, prefix)
    decl._autoprefixerValues[prefix] = value if value

  # Return function to fast find prefixed value
  old: (prefix) ->
    new OldValue(prefix + @name)

module.exports = Value
