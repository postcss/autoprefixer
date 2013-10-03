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
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

module.exports = (updater) ->
  prefixes = { }
  prefix   = (names..., data) ->
    for name in names
      prefixes[name] = data

  # Border Radius
  @feature 'border-radius', (browsers) =>
    prefix 'border-radius', 'border-top-left-radius', 'border-top-right-radius',
           'border-bottom-right-radius', 'border-bottom-left-radius',
            mistakes:   ['-ms-']
            browsers:   browsers
            transition: true

  # Box Shadow
  @feature 'css-boxshadow', (browsers) =>
    prefix 'box-shadow',
            browsers:   browsers
            transition: true

  # Animation
  @feature 'css-animation', (browsers) =>
    prefix 'animation', 'animation-name', 'animation-duration',
           'animation-delay', 'animation-direction', 'animation-fill-mode',
           'animation-iteration-count', 'animation-play-state',
           'animation-timing-function', '@keyframes',
            browsers: browsers

  # Transition
  @feature 'css-transitions', (browsers) =>
    prefix 'transition', 'transition-property', 'transition-duration',
           'transition-delay', 'transition-timing-function',
            mistakes: ['-ms-']
            browsers: browsers

  # Transform
  @feature 'transforms2d', (browsers) =>
    prefix 'transform', 'transform-origin', 'perspective', 'perspective-origin',
            browsers:   browsers
            transition: true

    prefix 'transform-style', 'backface-visibility',
            browsers: browsers

  # Gradients
  @feature 'css-gradients', (browsers) =>
    browsers = @map browsers, (browser, name, version) ->
      if name == 'android' and version < 4
        browser + ' old'
      else
        browser

    prefix 'linear-gradient', 'repeating-linear-gradient',
           'radial-gradient', 'repeating-radial-gradient',
            props:    ['background', 'background-image', 'border-image']
            mistakes: ['-ms-']
            browsers: browsers

  # Box sizing
  @feature 'css3-boxsizing', (browsers) =>
    prefix 'box-sizing',
            browsers: browsers

  # Filter Effects
  @feature 'css-filters', (browsers) =>
    prefix 'filter',
            browsers:   browsers
            transition: true

  # Multicolumns
  @feature 'multicolumn', (browsers) =>
    prefix 'columns', 'column-width', 'column-gap',
           'column-rule', 'column-rule-color', 'column-rule-width',
            browsers:   browsers
            transition: true

    prefix 'column-count', 'column-rule-style', 'column-span', 'column-fill',
           'break-before', 'break-after', 'break-inside',
            browsers:   browsers

  # User select
  @feature 'user-select-none', (browsers) =>
    prefix 'user-select',
            browsers: browsers

  # Flexible Box Layout
  @feature 'flexbox', (browsers) =>
    browsers = @map browsers, (browser, name, version) ->
      if (name == 'safari' or name == 'ios') and version < 7
        browser + ' 2009'
      else if name == 'chrome' and version < 21
        browser + ' 2009'
      else
        browser

    prefix 'display-flex',
            browsers: browsers

    prefix 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
            transition: true
            browsers: browsers

    prefix 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
           'order', 'align-items', 'align-self', 'align-content',
            browsers: browsers

  # calc() unit
  @feature 'calc', (browsers) =>
    prefix 'calc',
            props:  ['*']
            browsers: browsers

  # Background options
  @feature 'background-img-opts', (browsers) =>
    prefix 'background-clip', 'background-origin', 'background-size',
            browsers: browsers

  # Font feature settings
  @feature 'font-feature', (browsers) =>
    prefix 'font-feature-settings', 'font-variant-ligatures',
           'font-language-override','font-kerning',
            browsers: browsers

  # Border image
  @feature 'border-image', (browsers) =>
    prefix 'border-image',
            browsers: browsers

  # Selection selector
  @feature 'css-selection', (browsers) =>
    prefix '::selection',
            selector: true,
            browsers: browsers

  # Placeholder selector
  @feature 'css-placeholder', (browsers) =>
    prefix '::placeholder',
            selector: true,
            browsers: browsers

  # Hyphenation
  @feature 'css-hyphens', (browsers) =>
    prefix 'hyphens',
            browsers: browsers

  # Fullscreen selector
  @feature 'fullscreen', (browsers) =>
    prefix ':fullscreen',
            selector: true,
            browsers: browsers

  # Tab size
  @feature 'css3-tabsize', (browsers) =>
    prefix 'tab-size',
            browsers: browsers

  # Intrinsic & Extrinsic Sizing
  @feature 'intrinsic-width', (browsers) =>
    prefix 'max-content', 'min-content', 'fit-content', 'fill-available',
            props:  ['width',  'min-width',  'max-width',
                     'height', 'min-height', 'max-height']
            browsers: browsers

  @feature 'css3-cursors-newer', (browsers) =>
    prefix 'zoom-in', 'zoom-out', 'grab', 'grabbing',
            props:  ['cursor']
            browsers: browsers

  @done => @save('prefixes', prefixes)
