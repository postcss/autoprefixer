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

class DisplayFlex extends Declaration
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
    else if prefix == '-webkit-'
      @insertBefore('display', '-webkit-box')
      @insertBefore('display', '-webkit-flex')
    else if prefix == '-moz-'
      @insertBefore('display', '-moz-box')
    else if prefix == '-ms-'
      @insertBefore('display', '-ms-flexbox')

module.exports = DisplayFlex
