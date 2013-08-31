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

capitalize = (str) ->
  str.slice(0, 1).toUpperCase() + str.slice(1)

names =
  ie:  'IE'
  ff:  'Firefox'
  ios: 'iOS'

prefix = (name, transition, prefixes) ->
    out  = '  ' + name + (if transition then '*' else '') + ': '
    out += prefixes.map( (i) -> i.replace(/^-(.*)-$/g, '$1') ).join(', ')
    out += "\n"
    out

module.exports = (prefixes) ->
  return "No browsers selected" if prefixes.browsers.selected.length == 0

  versions = []
  for browser in prefixes.browsers.selected
    [name, version] = browser.split(' ')

    name = names[name] || capitalize(name)
    if versions[name]
      versions[name].push(version)
    else
      versions[name] = [version]

  out  = "Browsers:\n"
  for browser, list of versions
    list = list.sort (a, b) -> parseFloat(b) - parseFloat(a)
    out += '  ' + browser + ': ' + list.join(', ') + "\n"

  values = ''
  props  = ''
  useTransition  = false
  needTransition = prefixes.add.transition?.prefixes
  for name, data of prefixes.add
    if data.prefixes
      transitionProp = needTransition and prefixes.data[name].transition
      useTransition  = true if transitionProp
      props += prefix(name, transitionProp, data.prefixes)

    continue unless data.values
    continue if prefixes.transitionProps.some (i) -> i == name
    for value in data.values
      string = prefix(value.name, false, value.prefixes)
      if values.indexOf(string) == -1
        values += string

  if useTransition
    props += "  * - can be used in transition\n"

  out += "\nProperties:\n"+ props if props  != ''
  out += "\nValues:\n" + values   if values != ''

  out
