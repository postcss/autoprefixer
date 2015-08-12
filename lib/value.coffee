Prefixer = require('./prefixer')
OldValue = require('./old-value')
utils    = require('./utils')

vendor = require('postcss/lib/vendor')

class Value extends Prefixer

  # Clone decl for each prefixed values
  @save: (prefixes, decl) ->
    for prefix, value of decl._autoprefixerValues
      continue if value == decl.value
      propPrefix = vendor.prefix(decl.prop)

      if propPrefix == prefix
        decl.value = value
      else if propPrefix == '-pie-'
        continue
      else
        prefixed = prefixes.prefixed(decl.prop, prefix)
        rule     = decl.parent
        if rule.every( (i) -> i.prop != prefixed )
          trimmed = value.replace(/\s+/, ' ')
          already = rule.some (i) ->
            i.prop == decl.prop and i.value.replace(/\s+/, ' ') == trimmed

          unless already
            if value.indexOf('-webkit-filter') != -1 and
               (decl.prop == 'transition' or decl.prop == 'transition-property')
              decl.value = value
            else
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
    value = decl._autoprefixerValues[prefix] || decl._value?.raw || decl.value
    value = @replace(value, prefix)
    decl._autoprefixerValues[prefix] = value if value

  # Return function to fast find prefixed value
  old: (prefix) ->
    new OldValue(@name, prefix + @name)

module.exports = Value
