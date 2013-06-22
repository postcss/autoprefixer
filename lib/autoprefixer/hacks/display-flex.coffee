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

  constructor: ->
    super
    if @value == 'flex'
      @unprefixed = @prop = 'display-flex'
    else if @value == '-webkit-box' or @value == '-webkit-flex'
      @prefix     = '-webkit-'
      @unprefixed = 'display-flex'
      @prop       = '-webkit-display-flex'
    else if @value == '-moz-box'
      @prefix     = '-moz-'
      @unprefixed = 'display-flex'
      @prop       = '-moz-display-flex'
    else if @value == '-ms-flexbox'
      @prefix     = '-ms-'
      @unprefixed = 'display-flex'
      @prop       = '-ms-display-flex'

  # Add prefix to value depend on flebox spec version
  prefixProp: (prefix) ->
    if @unprefixed != 'display-flex'
      super
    else
      spec = @flexSpec(prefix)
      if spec.spec2009
        @insertBefore('display', prefix + 'box')
      if spec.spec2012
        @insertBefore('display', prefix + 'flexbox')
      if spec.final
        @insertBefore('display', prefix + 'flex')

module.exports = DisplayFlex
