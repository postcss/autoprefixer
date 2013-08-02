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

Rule = require('./rule')

class Rules

  # Shortcut to create Rules instance and run each
  @each: (list, callback) ->
    rules = new Rules(list)
    rules.each(callback)

  constructor: (@list) ->

  # Execute callback on every rule
  each: (callback) ->
    @number = 0
    while @number < @list.length
      i = @list[@number]

      Rules.each(i.rules, callback) if i.rules

      if i.keyframes
        for keyframe in i.keyframes
          if keyframe.type == 'keyframe'
            rule = new Rule(@, @number, keyframe, i.vendor)
            callback(rule)

      if i.declarations
        rule = new Rule(@, @number, i, i.vendor)
        callback(rule)

      @number += 1
    false

module.exports = Rules
