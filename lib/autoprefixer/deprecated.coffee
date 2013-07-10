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

# Old deprecated API
deprecated =
  # Show deprecated warning
  warning: (method) ->
    return unless console?.warn?
    console.warn("Method autoprefixer.#{method} is deprecated. " +
                 "Use autoprefixer(reqs).#{method} instead.")

  # Instance cache
  cache: { }

  # Convert browsers list and create Autoprefixer instance
  create: (autoprefixer, browsers) ->
    if not browsers?
      browsers = []
    else if not (browsers instanceof Array)
      browsers = [browsers]
    else if browsers.length == 0
      browsers = [false]

    key = browsers.toString()

    @cache[key] ||= autoprefixer.apply(autoprefixer, browsers)

  # Install old deprecated compile, rework and inspect to Autoprefixer
  install: (autoprefixer) ->
    for name in ['compile', 'rework', 'inspect']
      if name != 'install' and name != 'warning'
        autoprefixer[name] = @[name]

  compile: (str, browsers) ->
    deprecated.warning('compile') if browsers
    deprecated.create(@, browsers).compile(str)
  rework: (browsers) ->
    deprecated.warning('rework') if browsers
    deprecated.create(@, browsers).rework
  inspect: (browsers) ->
    deprecated.warning('inspect') if browsers
    deprecated.create(@, browsers).inspect()

module.exports = deprecated
