caniuse = require('../lib/caniuse')
feature = caniuse.feature

module.exports = { }
prefix = (names..., data) ->
  for name in names
    module.exports[name] = data

# Border Radius
feature require('caniuse-db/features-json/border-radius'), (browsers) ->
  prefix 'border-radius', 'border-top-left-radius', 'border-top-right-radius',
         'border-bottom-right-radius', 'border-bottom-left-radius',
          mistakes:   ['-ms-']
          browsers:   browsers
          transition: true

# Box Shadow
feature require('caniuse-db/features-json/css-boxshadow'), (browsers) ->
  prefix 'box-shadow',
          browsers:   browsers
          transition: true

# Animation
feature require('caniuse-db/features-json/css-animation'), (browsers) ->
  prefix 'animation', 'animation-name', 'animation-duration',
         'animation-delay', 'animation-direction', 'animation-fill-mode',
         'animation-iteration-count', 'animation-play-state',
         'animation-timing-function', '@keyframes',
          browsers: browsers

# Transition
feature require('caniuse-db/features-json/css-transitions'), (browsers) ->
  prefix 'transition', 'transition-property', 'transition-duration',
         'transition-delay', 'transition-timing-function',
          mistakes: ['-ms-']
          browsers: browsers

# Transform 2D
feature require('caniuse-db/features-json/transforms2d'), (browsers) ->
  prefix 'transform', 'transform-origin',
          browsers:   browsers
          transition: true

# Transform 3D
feature require('caniuse-db/features-json/transforms3d'), (browsers) ->
  prefix 'perspective', 'perspective-origin',
          browsers:   browsers
          transition: true

  prefix 'transform-style', 'backface-visibility',
          browsers: browsers

# Gradients
feature require('caniuse-db/features-json/css-gradients'), (browsers) ->
  browsers = caniuse.map browsers, (browser, name, version) ->
    if name == 'android' and version < 4   or
       name == 'safari'  and version < 5.1 or
       name == 'ios'     and version < 5
      browser + ' old'
    else
      browser

  prefix 'linear-gradient', 'repeating-linear-gradient',
         'radial-gradient', 'repeating-radial-gradient',
          props:    ['background', 'background-image', 'border-image']
          mistakes: ['-ms-']
          browsers: browsers

# Box sizing
feature require('caniuse-db/features-json/css3-boxsizing'), (browsers) ->
  prefix 'box-sizing',
          browsers: browsers

# Filter Effects
feature require('caniuse-db/features-json/css-filters'), (browsers) ->
  prefix 'filter',
          browsers:   browsers
          transition: true

# Multicolumns
feature require('caniuse-db/features-json/multicolumn'), (browsers) ->
  prefix 'columns', 'column-width', 'column-gap',
         'column-rule', 'column-rule-color', 'column-rule-width',
          browsers:   browsers
          transition: true

  prefix 'column-count', 'column-rule-style', 'column-span', 'column-fill',
         'break-before', 'break-after', 'break-inside',
          browsers:   browsers

# User select
feature require('caniuse-db/features-json/user-select-none'), (browsers) ->
  prefix 'user-select',
          browsers: browsers

# Flexible Box Layout
feature require('caniuse-db/features-json/flexbox'), (browsers) ->
  browsers = caniuse.map browsers, (browser, name, version) ->
    if (name == 'safari' or name == 'ios') and version < 7
      browser + ' 2009'
    else if name == 'chrome' and version < 21
      browser + ' 2009'
    else
      browser

  prefix 'display-flex', 'inline-flex',
          props:  ['display']
          browsers: browsers

  prefix 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
          transition: true
          browsers: browsers

  prefix 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
         'order', 'align-items', 'align-self', 'align-content',
          browsers: browsers

# calc() unit
feature require('caniuse-db/features-json/calc'), (browsers) ->
  prefix 'calc',
          props:  ['*']
          browsers: browsers

# Background options
feature require('caniuse-db/features-json/background-img-opts'), (browsers) ->
  prefix 'background-clip', 'background-origin', 'background-size',
          browsers: browsers

# Font feature settings
feature require('caniuse-db/features-json/font-feature'), (browsers) ->
  prefix 'font-feature-settings', 'font-variant-ligatures',
         'font-language-override','font-kerning',
          browsers: browsers

# Border image
feature require('caniuse-db/features-json/border-image'), (browsers) ->
  prefix 'border-image',
          browsers: browsers

# Selection selector
feature require('caniuse-db/features-json/css-selection'), (browsers) ->
  prefix '::selection',
          selector: true,
          browsers: browsers

# Placeholder selector
feature require('caniuse-db/features-json/css-placeholder'), (browsers) ->
  browsers = caniuse.map browsers, (browser, name, version) ->
    if name == 'ff' and version <= 18
      browser + ' old'
    else
      browser

  prefix '::placeholder',
          selector: true,
          browsers: browsers

# Hyphenation
feature require('caniuse-db/features-json/css-hyphens'), (browsers) ->
  prefix 'hyphens',
          browsers: browsers

# Fullscreen selector
feature require('caniuse-db/features-json/fullscreen'), (browsers) ->
  prefix ':fullscreen',
          selector: true,
          browsers: browsers

# Tab size
feature require('caniuse-db/features-json/css3-tabsize'), (browsers) ->
  prefix 'tab-size',
          browsers: browsers

# Intrinsic & extrinsic sizing
feature require('caniuse-db/features-json/intrinsic-width'), (browsers) ->
  prefix 'max-content', 'min-content', 'fit-content', 'fill-available',
          props:  ['width',  'min-width',  'max-width',
                   'height', 'min-height', 'max-height']
          browsers: browsers

# Zoom and grab cursor
feature require('caniuse-db/features-json/css3-cursors-newer'), (browsers) ->
  prefix 'zoom-in', 'zoom-out',
          props:  ['cursor']
          browsers: browsers.concat ['chrome 3']

  prefix 'grab', 'grabbing',
          props:  ['cursor']
          browsers: browsers.concat ['ff 24', 'ff 25', 'ff 26']

# Sticky position
feature require('caniuse-db/features-json/css-sticky'), (browsers) ->
  prefix 'sticky',
          props:  ['position']
          browsers: browsers

# Pointer Events
feature require('caniuse-db/features-json/pointer'), (browsers) ->
  prefix 'touch-action',
          browsers: browsers

# Text decoration
textDecoration = require('caniuse-db/features-json/text-decoration')

feature textDecoration, (browsers) ->
  prefix 'text-decoration-style',
          browsers: browsers

feature textDecoration, full: true, (browsers) ->
  prefix 'text-decoration-line',
         'text-decoration-color',
          browsers: browsers

# Text Size Adjust
feature require('caniuse-db/features-json/text-size-adjust'), (browsers) ->
  prefix 'text-size-adjust',
          browsers: browsers
