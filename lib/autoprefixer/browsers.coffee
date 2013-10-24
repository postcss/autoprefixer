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

class Browsers
  constructor: (@data, requirements) ->
    @selected = @parse(requirements)

  # Return browsers selected by requirements
  parse: (requirements) ->
    requirements = [requirements] unless requirements instanceof Array
    selected = []

    requirements.map (req) =>
      for name, i of @requirements
        if match = req.match(i.regexp)
          selected = selected.concat i.select.apply(@, match[1..-1])
          return
      utils.error "Unknown browser requirement `#{req}`"

    utils.uniq(selected)

  # Aliases for browser names
  aliases:
    fx: 'ff'

  # Available requirements to select browsers
  requirements:

    none:
      regexp: /^none$/i
      select: -> []

    lastVersions:
      regexp: /^last (\d+) versions?$/i
      select: (versions) ->
        @browsers (data) ->
          if data.minor then [] else data.versions[0...versions]

    globalStatistics:
      regexp: /^> (\d+(\.\d+)?)%$/
      select: (popularity) ->
        @browsers (data) ->
          data.versions.filter (version, i) -> data.popularity[i] > popularity

    newerThen:
      regexp: /^(\w+) (>=?)\s*([\d\.]+)/
      select: (browser, sign, version) ->
        browser = @aliases[browser] || browser
        data    = @data[browser]
        version = parseFloat(version)
        utils.error("Unknown browser #{browser}") unless data

        if sign == '>'
          filter = (v) -> v > version
        else if sign == '>='
          filter = (v) -> v >= version
        data.versions.filter(filter).map (v) -> "#{browser} #{v}"

    direct:
      regexp: /^(\w+) ([\d\.]+)$/
      select: (browser, version) ->
        browser = @aliases[browser] || browser
        data    = @data[browser]
        version = parseFloat(version)
        utils.error("Unknown browser #{browser}") unless data

        last  = if data.future then data.future[0] else data.versions[0]
        first = data.versions[data.versions.length - 1]
        if version > last
          version = last
        else if version < first
          version = first

        ["#{browser} #{version}"]

  # Select major browsers versions by criteria
  browsers: (criteria) ->
    selected = []
    for browser, data of @data
      versions = criteria(data).map (version) -> "#{browser} #{version}"
      selected = selected.concat(versions)
    selected

  # Return all prefixes
  prefixes: ->
    @prefixesCache ||= utils.uniq(i.prefix for name, i of @data).
                             sort (a, b) -> b.length - a.length

  # Return prefix for selected browser
  prefix: (browser) ->
    [name, version] = browser.split(' ')
    if name == 'opera' and parseFloat(version) >= 15
      '-webkit-'
    else
      @data[name].prefix

  # Is browser is selected by requirements
  isSelected: (browser) ->
    @selected.indexOf(browser) != -1

module.exports = Browsers
