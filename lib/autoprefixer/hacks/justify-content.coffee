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

class JustifyContent extends FlexDeclaration
  @names = ['justify-content', 'flex-pack', 'box-pack']

  @oldValues =
    'flex-end':      'end'
    'flex-start':    'start'
    'space-between': 'justify'
    'space-around':  'distribute'

  constructor: ->
    super
    @unprefixed = 'justify-content'
    @prop = @prefix + @unprefixed

  # Add prefix and convert spec 2009
  prefixProp: (prefix) ->
    spec     = @flexSpec(prefix)
    oldValue = JustifyContent.oldValues[@value] || @value
    if spec.spec2009
      @insertBefore(prefix + 'box-pack', oldValue) if @value != 'space-around'
    if spec.spec2012
      @insertBefore(prefix + 'flex-pack', oldValue)
    if spec.final
      super

module.exports = JustifyContent
