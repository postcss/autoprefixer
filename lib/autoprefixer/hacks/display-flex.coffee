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

class DisplayFlex extends FlexDeclaration
  @names = ['display']

  # Normalize property name
  constructor: ->
    super
    [prefix, name] = FlexDeclaration.split(@value)
    if name == 'flex' or name == 'box' or name == 'flexbox'
      @prefix     = prefix
      @unprefixed = 'display-flex'
      @prop       = @prefix + @unprefixed
    else if name == 'inline-flex' or name == 'inline-flexbox'
      @prefix     = prefix
      @unprefixed = 'display-flex'
      @prop       = @prefix + @unprefixed
      @inline     = true

  # Add prefix to value depend on flebox spec version
  prefixProp: (prefix) ->
    if @unprefixed != 'display-flex'
      super
    else
      [spec, prefix] = @flexSpec(prefix)
      if spec == '2009'
        @prefixDisplay(prefix, 'box') unless @inline
      else if spec == '2012'
        @prefixDisplay(prefix, if @inline then 'inline-flexbox' else 'flexbox')
      else if spec ==  'final'
        @prefixDisplay(prefix, if @inline then 'inline-flex' else 'flex')

  # Prefix value
  prefixDisplay: (prefix, name) ->
    @insertBefore('display', prefix + name)

module.exports = DisplayFlex
