# Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>,
# sponsored by Evil Martians.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http:#www.gnu.org/licenses/>.

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

  # Clone object and make some changes
  clone: (obj, changes = { }) ->
    clone = { }
    for key, value of obj
      unless changes[key]
        if value instanceof Array
          clone[key] = value.slice(0)
        else
          clone[key] = value
    for key, value of changes
      clone[key] = value
    clone

  # Return "-webkit-" on "-webkit- old"
  removeNote: (string) ->
    if string.indexOf(' ') == -1
      string
    else
      string.split(' ')[0]

  # Escape RegExp symbols
  escapeRegexp: (string) ->
    string.replace(/([.?*+\^\$\[\]\\(){}|\-])/g, "\\$1")

  # Return regexp to check, that CSS string contain word
  regexp: (word, escape = true) ->
    word = @escapeRegexp(word) if escape
    new RegExp('(^|\\s|,|\\()(' + word + '($|\\s|\\(|,))', 'gi')
