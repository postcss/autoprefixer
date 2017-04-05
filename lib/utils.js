list = require('postcss/lib/list')

module.exports =

  # Throw special error, to tell beniary, that this error is from Autoprefixer.
  error: (text) ->
    err = new Error(text)
    err.autoprefixer = true
    throw err

  # Return array, that doesn’t contain duplicates.
  uniq: (array) ->
    filtered = []
    for i in array
      filtered.push(i) if filtered.indexOf(i) == -1
    filtered

  # Return "-webkit-" on "-webkit- old"
  removeNote: (string) ->
    if string.indexOf(' ') == -1
      string
    else
      string.split(' ')[0]

  # Escape RegExp symbols
  escapeRegexp: (string) ->
    string.replace(/[.?*+\^\$\[\]\\(){}|\-]/g, '\\$&')

  # Return regexp to check, that CSS string contain word
  regexp: (word, escape = true) ->
    word = @escapeRegexp(word) if escape
    /// (^|[\s,(]) ( #{ word } ($|[\s(,]) ) ///gi

  # Change comma list
  editList: (value, callback) ->
    origin  = list.comma(value)
    changed = callback(origin, [])

    if origin == changed
      value
    else
      join = value.match(/,\s*/)
      join = if join then join[0] else ', '
      changed.join(join)
