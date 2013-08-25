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

OldValue = require('../old-value')
Value    = require('../value')
utils    = require('../utils')

class FillAvailable extends Value
  @names = ['fill-available']

  # Different prefix for -moz-available
  addPrefix: (prefix, string) ->
    if prefix == '-moz-'
      string.replace(@regexp, '$1-moz-available$3')
    else
      super

  # Different name for -moz-available
  old: (prefix) ->
    if prefix == '-moz-'
      new OldValue('-moz-available')
    else
      super

module.exports = FillAvailable
