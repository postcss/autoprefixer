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

utils = require('./utils')

class OldValue
  constructor: (@name, @string, @regexp) ->
    @regexp ||= utils.regexp(@name)
    @string ||= @name

  # Check, that value contain old value
  check: (value) ->
    if value.indexOf(@string) != -1
      !!value.match(@regexp)
    else
      false

module.exports = OldValue
