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

class Processor
  constructor: (@prefixes) ->

  # Add necessary prefixes
  add: (css) ->
    css.eachKeyframes (keyframes) =>
      return if keyframes.prefix
      @prefixes.each '@keyframes', (prefix) ->
        keyframes.cloneWithPrefix(prefix)

    # Properties
    css.eachDeclaration (decl, vendor) =>
     @prefixes.each decl.name, (prefix) =>
       return if vendor and vendor != prefix
       return if decl.valueContain(@prefixes.other(prefix))
       decl.prefixProp(prefix)

    # Values
    css.eachDeclaration (decl, vendor) =>
      for value in @prefixes.values('add', decl.unprefixed)
        continue unless value.check(decl)

        for prefix in value.prefixes
          continue if vendor and vendor != prefix
          decl.prefixValue(prefix, value)
      decl.saveValues()

  # Remove unnecessary pefixes
  remove: (css) ->
    css.eachKeyframes (keyframes) =>
      if @prefixes.toRemove(keyframes.prefix + '@keyframes')
        keyframes.remove()

    css.eachDeclaration (decl, vendor) =>
      # Properties
      if @prefixes.toRemove(decl.name)
        decl.remove()
        return

      # Values
      for value in @prefixes.values('remove', decl.unprefixed)
        if decl.value.match(value)
          decl.remove()
          return

module.exports = Processor
