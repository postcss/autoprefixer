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

class AlignSelf extends FlexDeclaration
  @names = ['align-self', 'flex-item-align']

  @oldValues =
    'flex-end':   'end'
    'flex-start': 'start'

  # Normalize property name
  constructor: ->
    super
    @unprefixed = 'align-self'
    @prop = @prefix + @unprefixed

  # Add prefix and convert to 2012 specs
  prefixProp: (prefix) ->
    [spec, prefix] = @flexSpec(prefix)
    if spec == '2012'
      oldValue = AlignSelf.oldValues[@value] || @value
      @insertBefore(prefix + 'flex-item-align', oldValue)
    else if spec == 'final'
      super

module.exports = AlignSelf
