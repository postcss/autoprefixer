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

class FlexDirection extends Declaration
  @names = ['flex-direction', 'box-direction', 'box-orient']

  constructor: ->
    super
    if @unprefixed == 'box-direction' or @unprefixed == 'box-orient'
      @unprefixed = 'flex-direction'
      @prop = @prefix + @unprefixed

  # Add prefix and convert spec 2009
  prefixProp: (prefix) ->
    if prefix == '-webkit-' or prefix == '-moz-'
      @insertBefore(prefix + 'box-orient', if @value.indexOf('row') != -1
          'horizontal'
        else
          'vertical')
      @insertBefore(prefix + 'box-direction', if @value.indexOf('reverse') != -1
          'reverse'
        else
          'normal')
    else if prefix == '-ms-'
      super
    if prefix == '-webkit-'
      super

module.exports = FlexDirection
