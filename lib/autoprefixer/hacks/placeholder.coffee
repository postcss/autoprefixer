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

Selector = require('../selector')

class Placeholder extends Selector
  @names = ['::placeholder']

  # Return different selectors depend on prefix
  prefixed: (prefix) ->
    if '-webkit-' == prefix
      '::-webkit-input-placeholder'
    else if '-ms-' == prefix
      ':-ms-input-placeholder'
    else
      "::#{ prefix }placeholder"

module.exports = Placeholder
