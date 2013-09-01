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

FlexDeclaration = require('./flex-declaration')

class FlexDirection extends FlexDeclaration
  @names = ['flex-direction', 'box-direction', 'box-orient']

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'flex-direction'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2009 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2009'
      orient = if @value.indexOf('row') != -1 then 'horizontal' else 'vertical'
      @insertBefore(prefix + 'box-orient', orient)

      dir = if @value.indexOf('reverse') != -1 then 'reverse' else 'normal'
      @insertBefore(prefix + 'box-direction', dir)
    else
      super

module.exports = FlexDirection
