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

utils = require('./utils')

class Processor
  constructor: (@prefixes) ->

  # Add necessary prefixes
  add: (css) ->
    # Keyframes
    css.eachKeyframes (keyframes) =>
      return if keyframes.prefix
      @prefixes.each '@keyframes', (prefix) ->
        keyframes.cloneWithPrefix(prefix)

    # Selectors
    for selector in @prefixes.add.selectors
      css.eachRule (rule) =>
        return unless rule.selectors
        if selector.check(rule.selectors)
          rule.prefixSelector(selector)

    # Properties
    css.eachDeclaration (decl, vendor) =>
      vendor = null if @prefixes.isCustom(vendor)

      @prefixes.each decl.prop, (prefix) =>
        return if vendor and vendor != utils.removeNote(prefix)
        return if decl.valueContain(@prefixes.other(prefix))
        decl.prefixProp(prefix)

    # Values
    css.eachDeclaration (decl, vendor) =>
      vendor = null if @prefixes.isCustom(vendor)

      for value in @prefixes.values('add', decl.unprefixed)
        continue unless value.check(decl.value)

        for prefix in value.prefixes
          continue if vendor and vendor != utils.removeNote(prefix)
          decl.prefixValue(prefix, value)
      decl.saveValues()

  # Remove unnecessary pefixes
  remove: (css) ->
    # Keyframes
    css.eachKeyframes (keyframes) =>
      if @prefixes.toRemove(keyframes.prefix + '@keyframes')
        keyframes.remove()

    # Selectors
    for selector in @prefixes.remove.selectors
      css.eachRule (rule) =>
        return unless rule.selectors
        if rule.selectors.indexOf(selector) != -1
          rule.remove()

    css.eachDeclaration (decl, vendor) =>
      # Properties
      if @prefixes.toRemove(decl.prop)
        if decl.rule.byProp(decl.unprefixed)
          decl.remove()
          return

      # Values
      for checker in @prefixes.values('remove', decl.unprefixed)
        if checker.check(decl.value)
          decl.remove()
          return

module.exports = Processor
