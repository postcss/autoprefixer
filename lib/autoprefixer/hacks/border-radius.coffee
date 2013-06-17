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

Declaration = require('../declaration')

class BorderRadius extends Declaration
  @names     = ['border-radius']
  @toMozilla = { }
  @toNormal  = { }

  for ver in ['top', 'bottom']
    for hor in ['left', 'right']
      normal  = "border-#{ver}-#{hor}-radius"
      mozilla = "border-radius-#{ver}#{hor}"

      @names.push(normal)
      @names.push(mozilla)

      @toMozilla[normal] = mozilla
      @toNormal[mozilla] = normal

  # Normalize property name to understand old Mozilla syntax
  constructor: ->
    super
    if @prefix == '-moz-'
      @unprefixed = BorderRadius.toNormal[@unprefixed] || @unprefixed
      @prop = @prefix + @unprefixed

  # Change syntax, when add Mozilla prefix
  prefixProp: (prefix) ->
    if prefix == '-moz-'
      prop = BorderRadius.toMozilla[@unprefixed] || @unprefixed
      return if @rule.contain(prefix + prop)
      @insertBefore(prefix + prop, @value)
    else
      super

module.exports = BorderRadius
