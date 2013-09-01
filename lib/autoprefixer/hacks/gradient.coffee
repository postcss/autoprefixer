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

class Gradient extends Value
  @names = ['linear-gradient', 'repeating-linear-gradient',
            'radial-gradient', 'repeating-radial-gradient']

  @regexps = { }
  for i in @names
    @regexps[i] = new RegExp('(^|\\s|,)' + i + '\\(([^)]+)\\)', 'gi')

  # Cache regexp to parse params
  constructor: (@name, @prefixes) ->
    @regexp = Gradient.regexps[@name]

  # Change degrees for webkit prefix
  addPrefix: (prefix, string) ->
    string.replace @regexp, (all, before, params) =>
      params = params.trim().split(/\s*,\s*/)
      if prefix == '-webkit- old'
        return all if @name != 'linear-gradient'
        return all if params[0] and params[0].indexOf('deg') != -1

        params = @oldDirection(params)
        params = @colorStops(params)

        '-webkit-gradient(linear, ' + params.join(', ') + ')'
      else
        if params.length > 0
          if params[0][0..2] == 'to '
            params[0] = @fixDirection(params[0])
          else if params[0].indexOf('deg') != -1
            params[0] = @fixAngle(params[0])
        before + prefix + @name + '(' + params.join(', ') + ')'

  # Direction to replace
  directions:
    top:    'bottom'
    left:   'right'
    bottom: 'top'
    right:  'left'

  # Direction to replace
  oldDirections:
    top:    'bottom left, top left'
    left:   'top right, top left'
    bottom: 'top left, bottom left'
    right:  'top left, top right'

  # Replace `to top left` to `bottom right`
  fixDirection: (param) ->
    param = param.split(' ')
    param.splice(0, 1)
    param = for value in param
      @directions[value.toLowerCase()] || value
    param.join(' ')

  # Round float and save digits under dot
  roundFloat: (float, digits) ->
    parseFloat(float.toFixed(digits))

  # Add 90 degrees
  fixAngle: (param) ->
    param = parseFloat(param)
    param = Math.abs(450 - param) % 360
    param = @roundFloat(param, 3)
    "#{param}deg"

  oldDirection: (params) ->
    params if params.length == 0

    if params[0].indexOf('to ') != -1
      direction = params[0].replace(/^to\s+/, '')
      direction = @oldDirections[direction]
      params[0] = direction
      params
    else
      direction = @oldDirections.bottom
      [direction].concat(params)

  # Change colors syntax to old webkit
  colorStops: (params) ->
    params.map (param, i) ->
      [color, position] = param.split(' ')
      if i == 0
        param
      else if i == 1
        "from(#{color})"
      else if i == params.length - 1
        "to(#{color})"
      else
        "color-stop(#{position}, #{color})"

  # Remove old WebKit gradient too
  old: (prefix) ->
    if prefix == '-webkit-'
      type   = if @name == 'linear-gradient' then 'linear' else 'radial'
      string = '-gradient'
      regexp = utils.regexp(
        "-webkit-(#{type}-gradient|gradient\\(\\s*#{type})", false)

      new OldValue(prefix + @name, string, regexp)
    else
      super

module.exports = Gradient
