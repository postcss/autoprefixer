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

# Common code from flexbox declarations hacks
class FlexDeclaration extends Declaration

  # Return flexbox spec versions by prefix
  flexSpec: (prefix) ->
    spec = if prefix == '-webkit- 2009' or prefix == '-moz-'
      '2009'
    else if prefix == '-ms-'
      '2012'
    else if prefix == '-webkit-'
      'final'
    prefix = '-webkit-' if prefix == '-webkit- 2009'

    [spec, prefix]

module.exports = FlexDeclaration
