# Sort browsers
sort = (array) ->
  array.sort (a, b) ->
    a = a.split(' ')
    b = b.split(' ')
    if a[0] > b[0]
      1
    else if a[0] < b[0]
      -1
    else
      d = parseFloat(a[1]) - parseFloat(b[1])
      if d > 0
        1
      else if d < 0
        -1
      else
        0

# Convert Can I Use data
feature = (data, opts, callback) ->
  [callback, opts] = [opts, { }] unless callback

  match = opts.match || /\sx($|\s)/
  need  = []

  for browser, versions of data.stats
    for version, support of versions
      need.push(browser + ' ' + version) if support.match(match)

  callback(sort(need))

# Add data for all properties
result = { }

prefix = (names..., data) ->
  for name in names
    result[name] = { }
    for i of data
      result[name][i] = data[i]

add = (names..., data) ->
  for name in names
    result[name].browsers = sort(result[name].browsers.concat(data.browsers))

module.exports = result

# Border Radius
feature require('caniuse-db/features-json/border-radius.json'), (browsers) ->
  prefix 'border-radius', 'border-top-left-radius', 'border-top-right-radius',
         'border-bottom-right-radius', 'border-bottom-left-radius',
          mistakes: ['-khtml-', '-ms-', '-o-']
          browsers: browsers

# Box Shadow
feature require('caniuse-db/features-json/css-boxshadow.json'), (browsers) ->
  prefix 'box-shadow',
          mistakes: ['-khtml-']
          browsers: browsers

# Animation
feature require('caniuse-db/features-json/css-animation.json'), (browsers) ->
  prefix 'animation', 'animation-name', 'animation-duration',
         'animation-delay', 'animation-direction', 'animation-fill-mode',
         'animation-iteration-count', 'animation-play-state',
         'animation-timing-function', '@keyframes',
          mistakes: ['-khtml-', '-ms-']
          browsers: browsers

# Transition
feature require('caniuse-db/features-json/css-transitions.json'), (browsers) ->
  prefix 'transition', 'transition-property', 'transition-duration',
         'transition-delay', 'transition-timing-function',
          mistakes: ['-khtml-', '-ms-']
          browsers: browsers

# Transform 2D
feature require('caniuse-db/features-json/transforms2d.json'), (browsers) ->
  prefix 'transform', 'transform-origin',
          browsers: browsers

# Transform 3D
feature require('caniuse-db/features-json/transforms3d.json'), (browsers) ->
  prefix 'perspective', 'perspective-origin',
          browsers: browsers

  prefix 'transform-style', 'backface-visibility',
          mistakes: ['-ms-', '-o-']
          browsers: browsers

# Gradients
gradients = require('caniuse-db/features-json/css-gradients.json')

feature gradients, match: /y\sx/, (browsers) ->
  prefix 'linear-gradient', 'repeating-linear-gradient',
         'radial-gradient', 'repeating-radial-gradient',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          mistakes: ['-ms-']
          browsers: browsers

feature gradients, match: /a\sx/, (browsers) ->
  browsers = browsers.map (i) -> if /op/.test(i) then i else "#{i} old"
  add 'linear-gradient', 'repeating-linear-gradient',
      'radial-gradient', 'repeating-radial-gradient',
       browsers: browsers

# Box sizing
feature require('caniuse-db/features-json/css3-boxsizing.json'), (browsers) ->
  prefix 'box-sizing',
          browsers: browsers

# Filter Effects
feature require('caniuse-db/features-json/css-filters.json'), (browsers) ->
  prefix 'filter',
          browsers: browsers

# filter() function
filterFunction = require('caniuse-db/features-json/css-filter-function.json')

feature filterFunction, (browsers) ->
  prefix 'filter-function',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers

# Backdrop-filter
backdropFilter = require('caniuse-db/features-json/css-backdrop-filter.json')

feature backdropFilter, (browsers) ->
  prefix 'backdrop-filter',
          browsers: browsers

# element() function
elementFunction = require('caniuse-db/features-json/css-element-function.json')

feature elementFunction, (browsers) ->
  prefix 'element',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers

# Multicolumns
feature require('caniuse-db/features-json/multicolumn.json'), (browsers) ->
  prefix 'columns', 'column-width', 'column-gap',
         'column-rule', 'column-rule-color', 'column-rule-width',
          browsers: browsers

  prefix 'column-count', 'column-rule-style', 'column-span', 'column-fill',
         'break-before', 'break-after', 'break-inside',
          browsers: browsers

# User select
userSelectNone = require('caniuse-db/features-json/user-select-none.json')

feature userSelectNone, (browsers) ->
  prefix 'user-select',
          mistakes: ['-khtml-']
          browsers: browsers

# Flexible Box Layout
flexbox = require('caniuse-db/features-json/flexbox.json')

feature flexbox, match: /a\sx/, (browsers) ->
  browsers = browsers.map (i) -> if /ie|firefox/.test(i) then i else "#{i} 2009"
  prefix 'display-flex', 'inline-flex',
          props:  ['display']
          browsers: browsers
  prefix 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
          browsers: browsers
  prefix 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
         'order', 'align-items', 'align-self', 'align-content',
          browsers: browsers

feature flexbox, match: /y\sx/, (browsers) ->
  add 'display-flex', 'inline-flex',
       browsers: browsers
  add 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
       browsers: browsers
  add 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
      'order', 'align-items', 'align-self', 'align-content',
       browsers: browsers

# calc() unit
feature require('caniuse-db/features-json/calc.json'), (browsers) ->
  prefix 'calc',
          props:  ['*']
          browsers: browsers

# Background options
bckgrndImgOpts = require('caniuse-db/features-json/background-img-opts.json')

feature bckgrndImgOpts, (browsers) ->
  prefix 'background-clip', 'background-origin', 'background-size',
          browsers: browsers

# Font feature settings
feature require('caniuse-db/features-json/font-feature.json'), (browsers) ->
  prefix 'font-feature-settings', 'font-variant-ligatures',
         'font-language-override','font-kerning',
          browsers: browsers

# Border image
feature require('caniuse-db/features-json/border-image.json'), (browsers) ->
  prefix 'border-image',
          browsers: browsers

# Selection selector
feature require('caniuse-db/features-json/css-selection.json'), (browsers) ->
  prefix '::selection',
          selector: true,
          browsers: browsers

# Placeholder selector
feature require('caniuse-db/features-json/css-placeholder.json'), (browsers) ->
  browsers = browsers.map (i) ->
    [name, version] = i.split(' ')
    if name == 'firefox' and parseFloat(version) <= 18 then i + ' old' else i

  prefix '::placeholder',
          selector: true,
          browsers: browsers

# Hyphenation
feature require('caniuse-db/features-json/css-hyphens.json'), (browsers) ->
  prefix 'hyphens',
          browsers: browsers

# Fullscreen selector
fullscreen = require('caniuse-db/features-json/fullscreen.json')

feature fullscreen, (browsers) ->
  prefix ':fullscreen',
          selector: true,
          browsers: browsers

feature fullscreen, match: /x(\s#2|$)/, (browsers) ->
  prefix '::backdrop',
          selector: true,
          browsers: browsers

# Tab size
feature require('caniuse-db/features-json/css3-tabsize.json'), (browsers) ->
  prefix 'tab-size',
          browsers: browsers

# Intrinsic & extrinsic sizing
feature require('caniuse-db/features-json/intrinsic-width.json'), (browsers) ->
  prefix 'max-content', 'min-content', 'fit-content', 'fill', 'fill-available',
          props:  ['width',  'min-width',  'max-width',
                   'height', 'min-height', 'max-height',
                   'inline-size', 'min-inline-size', 'max-inline-size',
                   'block-size',  'min-block-size',  'max-block-size']
          browsers: browsers

# Zoom cursors
cursorsNewer = require('caniuse-db/features-json/css3-cursors-newer.json')

feature cursorsNewer, (browsers) ->
  prefix 'zoom-in', 'zoom-out',
          props:  ['cursor']
          browsers: browsers

# Grab cursors
cursorsGrab = require('caniuse-db/features-json/css3-cursors-grab.json')
feature cursorsGrab, (browsers) ->
  prefix 'grab', 'grabbing',
          props:  ['cursor']
          browsers: browsers

# Sticky position
feature require('caniuse-db/features-json/css-sticky.json'), (browsers) ->
  prefix 'sticky',
          props:  ['position']
          browsers: browsers

# Pointer Events
feature require('caniuse-db/features-json/pointer.json'), (browsers) ->
  prefix 'touch-action',
          browsers: browsers

# Text decoration
feature require('caniuse-db/features-json/text-decoration.json'), (browsers) ->
  prefix 'text-decoration-style',
         'text-decoration-line',
         'text-decoration-color',
          browsers: browsers

# Text Size Adjust
textSizeAdjust = require('caniuse-db/features-json/text-size-adjust.json')

feature textSizeAdjust, (browsers) ->
  prefix 'text-size-adjust',
          browsers: browsers

# CSS Masks
feature require('caniuse-db/features-json/css-masks.json'), (browsers) ->
  prefix 'mask-clip', 'mask-composite', 'mask-image',
         'mask-origin', 'mask-repeat', 'mask-border-repeat',
         'mask-border-source',
          browsers: browsers
  prefix 'clip-path', 'mask', 'mask-position', 'mask-size',
         'mask-border', 'mask-border-outset', 'mask-border-width',
         'mask-border-slice',
          browsers: browsers

# Fragmented Borders and Backgrounds
boxdecorbreak = require('caniuse-db/features-json/css-boxdecorationbreak.json')

feature boxdecorbreak, (browsers) ->
  prefix 'box-decoration-break',
          browsers: browsers

# CSS3 object-fit/object-position
feature require('caniuse-db/features-json/object-fit.json'), (browsers) ->
  prefix 'object-fit',
         'object-position',
          browsers: browsers

# CSS Shapes
feature require('caniuse-db/features-json/css-shapes.json'), (browsers) ->
  prefix 'shape-margin',
         'shape-outside',
         'shape-image-threshold',
          browsers: browsers

# CSS3 text-overflow
feature require('caniuse-db/features-json/text-overflow.json'), (browsers) ->
  prefix 'text-overflow',
          browsers: browsers

# CSS3 text-emphasis
feature require('caniuse-db/features-json/text-emphasis.json'), (browsers) ->
  prefix 'text-emphasis',
          browsers: browsers

# Viewport at-rule
devdaptation = require('caniuse-db/features-json/css-deviceadaptation.json')
feature devdaptation, (browsers) ->
  prefix '@viewport',
          browsers: browsers

# Resolution Media Queries
resolution = require('caniuse-db/features-json/css-media-resolution.json')

feature resolution, match: /( x($| )|a #3)/, (browsers) ->
  prefix '@resolution',
          browsers: browsers

# CSS text-align-last
textAlignLast = require('caniuse-db/features-json/css-text-align-last.json')

feature textAlignLast, (browsers) ->
  prefix 'text-align-last',
          browsers: browsers

# Crisp Edges Image Rendering Algorithm
crispedges = require('caniuse-db/features-json/css-crisp-edges.json')

feature crispedges, match: /y x|a x #1/, (browsers) ->
  prefix 'pixelated',
          props:  ['image-rendering']
          browsers: browsers

feature crispedges, match: /a x #2/, (browsers) ->
  prefix 'image-rendering',
          browsers: browsers

# Logical Properties
logicalProps = require('caniuse-db/features-json/css-logical-props.json')

feature logicalProps, (browsers) ->
  prefix 'border-inline-start',  'border-inline-end',
         'margin-inline-start',  'margin-inline-end',
         'padding-inline-start', 'padding-inline-end',
          browsers: browsers

feature logicalProps, match: /x\s#2/, (browsers) ->
  prefix 'border-block-start',  'border-block-end',
         'margin-block-start',  'margin-block-end',
         'padding-block-start', 'padding-block-end',
          browsers: browsers

# CSS appearance
feature require('caniuse-db/features-json/css-appearance.json'), (browsers) ->
  prefix 'appearance',
          browsers: browsers

# CSS Scroll snap points
feature require('caniuse-db/features-json/css-snappoints.json'), (browsers) ->
  prefix 'scroll-snap-type',
         'scroll-snap-coordinate',
         'scroll-snap-destination',
         'scroll-snap-points-x', 'scroll-snap-points-y',
          browsers: browsers

# CSS Regions
feature require('caniuse-db/features-json/css-regions.json'), (browsers) ->
  prefix 'flow-into', 'flow-from',
         'region-fragment',
          browsers: browsers

# CSS image-set
feature require('caniuse-db/features-json/css-image-set.json'), (browsers) ->
  prefix 'image-set',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers

# Writing Mode
writingMode = require('caniuse-db/features-json/css-writing-mode.json')
feature writingMode, match: /a|x/, (browsers) ->
  prefix 'writing-mode',
          browsers: browsers

# Cross-Fade Function
feature require('caniuse-db/features-json/css-cross-fade.json'), (browsers) ->
  prefix 'cross-fade',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers

# Read Only selector
readOnly = require('caniuse-db/features-json/css-read-only-write.json')
feature readOnly, (browsers) ->
  prefix ':read-only', ':read-write',
          selector: true,
          browsers: browsers

# Text Emphasize
feature require('caniuse-db/features-json/text-emphasis.json'), (browsers) ->
  prefix 'text-emphasis', 'text-emphasis-position',
         'text-emphasis-style', 'text-emphasis-color',
          browsers: browsers

# CSS Grid Layout
grid = require('caniuse-db/features-json/css-grid.json')
feature grid, (browsers) ->
  prefix 'display-grid', 'inline-grid',
          props:  ['display']
          browsers: browsers
  prefix 'grid-template-columns', 'grid-template-rows',
         'grid-row-start', 'grid-column-start',
         'grid-row-end', 'grid-column-end',
         'grid-row', 'grid-column',
          browsers: browsers

feature grid, match: /y x/, (browsers) ->
  prefix 'grid-template-areas', 'grid-template',
         'grid-auto-columns', 'grid-auto-rows',
         'grid-auto-flow', 'grid', 'grid-area',
         'grid-row-gap', 'grid-column-gap', 'grid-gap',
          browsers: browsers

feature grid, match: /a x/, (browsers) ->
  prefix 'justify-items', 'grid-row-align',
          browsers: browsers

# CSS text-spacing
textSpacing = require('caniuse-db/features-json/css-text-spacing.json')

feature textSpacing, (browsers) ->
  prefix 'text-spacing',
          browsers: browsers
