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

Rules       = require('./rules')
Keyframes   = require('./keyframes')
Declaration = require('./declaration')

class CSS
  constructor: (@stylesheet) ->

  # Execute callback on every keyframes
  eachKeyframes: (callback) ->
    @number = 0
    while @number < @stylesheet.rules.length
      rule = @stylesheet.rules[@number]
      if rule.keyframes
        callback(new Keyframes(@, @number, rule))
      @number += 1
    false

  # Is CSS contain keyframes with this name and prefix
  containKeyframes: (rule) ->
    @stylesheet.rules.some (i) ->
      i.keyframes and i.name == rule.name and i.vendor == rule.vendor

  # Add keyframes on selected position
  addKeyframes: (position, rule) ->
    return if @containKeyframes(rule)
    @stylesheet.rules.splice(position, 0, rule)
    @number += 1

  # Remove keyframes, where callback return true
  removeKeyframes: (position) ->
    @stylesheet.rules.splice(position, 1)
    @number -= 1

  # Execute callback on every rule
  eachRule: (callback) ->
    Rules.each(@stylesheet.rules, callback)

  # Execute callback on every property: value declaration in CSS tree
  eachDeclaration: (callback) ->
    @eachRule (rule) -> rule.each(callback)

module.exports = CSS
