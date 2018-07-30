let list = require('postcss').list

module.exports = {

  /**
     * Throw special error, to tell beniary,
     * that this error is from Autoprefixer.
     */
  error (text) {
    let err = new Error(text)
    err.autoprefixer = true
    throw err
  },

  /**
     * Return array, that doesn’t contain duplicates.
     */
  uniq (array) {
    let filtered = []
    for (let i of array) {
      if (filtered.indexOf(i) === -1) {
        filtered.push(i)
      }
    }
    return filtered
  },

  /**
     * Return "-webkit-" on "-webkit- old"
     */
  removeNote (string) {
    if (string.indexOf(' ') === -1) {
      return string
    }

    return string.split(' ')[0]
  },

  /**
     * Escape RegExp symbols
     */
  escapeRegexp (string) {
    return string.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&')
  },

  /**
     * Return regexp to check, that CSS string contain word
     */
  regexp (word, escape = true) {
    if (escape) {
      word = this.escapeRegexp(word)
    }
    return new RegExp(`(^|[\\s,(])(${ word }($|[\\s(,]))`, 'gi')
  },

  /**
     * Change comma list
     */
  editList (value, callback) {
    let origin = list.comma(value)
    let changed = callback(origin, [])

    if (origin === changed) {
      return value
    }

    let join = value.match(/,\s*/)
    join = join ? join[0] : ', '
    return changed.join(join)
  }

}
