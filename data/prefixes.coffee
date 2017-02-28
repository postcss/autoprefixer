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
          feature: 'border-radius'

# Box Shadow
feature require('caniuse-db/features-json/css-boxshadow.json'), (browsers) ->
  prefix 'box-shadow',
          mistakes: ['-khtml-']
          browsers: browsers
          feature: 'css-boxshadow'

# Animation
feature require('caniuse-db/features-json/css-animation.json'), (browsers) ->
  prefix 'animation', 'animation-name', 'animation-duration',
         'animation-delay', 'animation-direction', 'animation-fill-mode',
         'animation-iteration-count', 'animation-play-state',
         'animation-timing-function', '@keyframes',
          mistakes: ['-khtml-', '-ms-']
          browsers: browsers
          feature: 'css-animation'

# Transition
feature require('caniuse-db/features-json/css-transitions.json'), (browsers) ->
  prefix 'transition', 'transition-property', 'transition-duration',
         'transition-delay', 'transition-timing-function',
          mistakes: ['-khtml-', '-ms-']
          browsers: browsers
          feature: 'css-transitions'

# Transform 2D
feature require('caniuse-db/features-json/transforms2d.json'), (browsers) ->
  prefix 'transform', 'transform-origin',
          browsers: browsers
          feature: 'transforms2d'

# Transform 3D
transforms3d = require('caniuse-db/features-json/transforms3d.json')
feature transforms3d, (browsers) ->
  prefix 'perspective', 'perspective-origin',
          browsers: browsers
          feature: 'transforms3d'
  prefix 'transform-style',
          mistakes: ['-ms-', '-o-']
          browsers: browsers
          feature: 'transforms3d'

feature transforms3d, match: /y\sx|y\s#2/, (browsers) ->
  prefix 'backface-visibility',
          mistakes: ['-ms-', '-o-']
          browsers: browsers
          feature: 'transforms3d'

# Gradients
gradients = require('caniuse-db/features-json/css-gradients.json')

feature gradients, match: /y\sx/, (browsers) ->
  prefix 'linear-gradient', 'repeating-linear-gradient',
         'radial-gradient', 'repeating-radial-gradient',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          mistakes: ['-ms-']
          browsers: browsers
          feature: 'css-gradients'

feature gradients, match: /a\sx/, (browsers) ->
  browsers = browsers.map (i) -> if /op/.test(i) then i else "#{i} old"
  add 'linear-gradient', 'repeating-linear-gradient',
      'radial-gradient', 'repeating-radial-gradient',
       browsers: browsers
       feature: 'css-gradients'

# Box sizing
feature require('caniuse-db/features-json/css3-boxsizing.json'), (browsers) ->
  prefix 'box-sizing',
          browsers: browsers
          feature: 'css3-boxsizing'

# Filter Effects
feature require('caniuse-db/features-json/css-filters.json'), (browsers) ->
  prefix 'filter',
          browsers: browsers
          feature: 'css-filters'

# filter() function
filterFunction = require('caniuse-db/features-json/css-filter-function.json')

feature filterFunction, (browsers) ->
  prefix 'filter-function',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers
          feature: 'css-filter-function'

# Backdrop-filter
backdropFilter = require('caniuse-db/features-json/css-backdrop-filter.json')

feature backdropFilter, (browsers) ->
  prefix 'backdrop-filter',
          browsers: browsers
          feature: 'css-backdrop-filter'

# element() function
elementFunction = require('caniuse-db/features-json/css-element-function.json')

feature elementFunction, (browsers) ->
  prefix 'element',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers
          feature: 'css-element-function'

# Multicolumns
feature require('caniuse-db/features-json/multicolumn.json'), (browsers) ->
  prefix 'columns', 'column-width', 'column-gap',
         'column-rule', 'column-rule-color', 'column-rule-width',
          browsers: browsers
          feature: 'multicolumn'

  prefix 'column-count', 'column-rule-style', 'column-span', 'column-fill',
         'break-before', 'break-after', 'break-inside',
          browsers: browsers
          feature: 'multicolumn'

# User select
userSelectNone = require('caniuse-db/features-json/user-select-none.json')

feature userSelectNone, (browsers) ->
  prefix 'user-select',
          mistakes: ['-khtml-']
          browsers: browsers
          feature: 'user-select-none'

# Flexible Box Layout
flexbox = require('caniuse-db/features-json/flexbox.json')

feature flexbox, match: /a\sx/, (browsers) ->
  browsers = browsers.map (i) -> if /ie|firefox/.test(i) then i else "#{i} 2009"
  prefix 'display-flex', 'inline-flex',
          props:  ['display']
          browsers: browsers
          feature: 'flexbox'
  prefix 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
          browsers: browsers
          feature: 'flexbox'
  prefix 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
         'order', 'align-items', 'align-self', 'align-content',
          browsers: browsers
          feature: 'flexbox'

feature flexbox, match: /y\sx/, (browsers) ->
  add 'display-flex', 'inline-flex',
       browsers: browsers
       feature: 'flexbox'
  add 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
       browsers: browsers
       feature: 'flexbox'
  add 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
      'order', 'align-items', 'align-self', 'align-content',
       browsers: browsers
       feature: 'flexbox'

# calc() unit
feature require('caniuse-db/features-json/calc.json'), (browsers) ->
  prefix 'calc',
          props:  ['*']
          browsers: browsers
          feature: 'calc'

# Background options
bckgrndImgOpts = require('caniuse-db/features-json/background-img-opts.json')

feature bckgrndImgOpts, (browsers) ->
  prefix 'background-clip', 'background-origin', 'background-size',
          browsers: browsers
          feature: 'background-img-opts'

# Font feature settings
feature require('caniuse-db/features-json/font-feature.json'), (browsers) ->
  prefix 'font-feature-settings', 'font-variant-ligatures',
         'font-language-override',
          browsers: browsers
          feature: 'font-feature'

# CSS font-kerning property
feature require('caniuse-db/features-json/font-kerning.json'), (browsers) ->
  prefix 'font-kerning',
          browsers: browsers
          feature: 'font-kerning'

# Border image
feature require('caniuse-db/features-json/border-image.json'), (browsers) ->
  prefix 'border-image',
          browsers: browsers
          feature: 'border-image'

# Selection selector
feature require('caniuse-db/features-json/css-selection.json'), (browsers) ->
  prefix '::selection',
          selector: true,
          browsers: browsers
          feature: 'css-selection'

# Placeholder selector
feature require('caniuse-db/features-json/css-placeholder.json'), (browsers) ->
  browsers = browsers.map (i) ->
    [name, version] = i.split(' ')
    if name == 'firefox' and parseFloat(version) <= 18 then i + ' old' else i

  prefix '::placeholder',
          selector: true,
          browsers: browsers
          feature: 'css-placeholder'

# Hyphenation
feature require('caniuse-db/features-json/css-hyphens.json'), (browsers) ->
  prefix 'hyphens',
          browsers: browsers
          feature: 'css-hyphens'

# Fullscreen selector
fullscreen = require('caniuse-db/features-json/fullscreen.json')

feature fullscreen, (browsers) ->
  prefix ':fullscreen',
          selector: true,
          browsers: browsers
          feature: 'fullscreen'

feature fullscreen, match: /x(\s#2|$)/, (browsers) ->
  prefix '::backdrop',
          selector: true,
          browsers: browsers
          feature: 'fullscreen'

# Tab size
feature require('caniuse-db/features-json/css3-tabsize.json'), (browsers) ->
  prefix 'tab-size',
          browsers: browsers
          feature: 'css3-tabsize'

# Intrinsic & extrinsic sizing
feature require('caniuse-db/features-json/intrinsic-width.json'), (browsers) ->
  prefix 'max-content', 'min-content', 'fit-content',
         'fill', 'fill-available', 'stretch',
          props:  ['width',  'min-width',  'max-width',
                   'height', 'min-height', 'max-height',
                   'inline-size', 'min-inline-size', 'max-inline-size',
                   'block-size',  'min-block-size',  'max-block-size']
          browsers: browsers
          feature: 'intrinsic-width'

# Zoom cursors
cursorsNewer = require('caniuse-db/features-json/css3-cursors-newer.json')

feature cursorsNewer, (browsers) ->
  prefix 'zoom-in', 'zoom-out',
          props:  ['cursor']
          browsers: browsers
          feature: 'css3-cursors-newer'

# Grab cursors
cursorsGrab = require('caniuse-db/features-json/css3-cursors-grab.json')
feature cursorsGrab, (browsers) ->
  prefix 'grab', 'grabbing',
          props:  ['cursor']
          browsers: browsers
          feature: 'css3-cursors-grab'

# Sticky position
feature require('caniuse-db/features-json/css-sticky.json'), (browsers) ->
  prefix 'sticky',
          props:  ['position']
          browsers: browsers
          feature: 'css-sticky'

# Pointer Events
feature require('caniuse-db/features-json/pointer.json'), (browsers) ->
  prefix 'touch-action',
          browsers: browsers
          feature: 'pointer'

# Text decoration
decoration = require('caniuse-db/features-json/text-decoration.json')

feature decoration, (browsers) ->
  prefix 'text-decoration-style',
         'text-decoration-color',
         'text-decoration-line',
          browsers: browsers
          feature: 'text-decoration'

feature decoration, match: /x.*#[23]/, (browsers) ->
  prefix 'text-decoration-skip',
          browsers: browsers
          feature: 'text-decoration'

# Text Size Adjust
textSizeAdjust = require('caniuse-db/features-json/text-size-adjust.json')

feature textSizeAdjust, (browsers) ->
  prefix 'text-size-adjust',
          browsers: browsers
          feature: 'text-size-adjust'

# CSS Masks
feature require('caniuse-db/features-json/css-masks.json'), (browsers) ->
  prefix 'mask-clip', 'mask-composite', 'mask-image',
         'mask-origin', 'mask-repeat', 'mask-border-repeat',
         'mask-border-source',
          browsers: browsers
          feature: 'css-masks'
  prefix 'mask', 'mask-position', 'mask-size',
         'mask-border', 'mask-border-outset', 'mask-border-width',
         'mask-border-slice',
          browsers: browsers
          feature: 'css-masks'

# CSS clip-path property
feature require('caniuse-db/features-json/css-clip-path.json'), (browsers) ->
  prefix 'clip-path',
          browsers: browsers
          feature: 'css-clip-path'

# Fragmented Borders and Backgrounds
boxdecorbreak = require('caniuse-db/features-json/css-boxdecorationbreak.json')

feature boxdecorbreak, (browsers) ->
  prefix 'box-decoration-break',
          browsers: browsers
          feature: 'css-boxdecorationbreak'

# CSS3 object-fit/object-position
feature require('caniuse-db/features-json/object-fit.json'), (browsers) ->
  prefix 'object-fit',
         'object-position',
          browsers: browsers
          feature: 'object-fit'

# CSS Shapes
feature require('caniuse-db/features-json/css-shapes.json'), (browsers) ->
  prefix 'shape-margin',
         'shape-outside',
         'shape-image-threshold',
          browsers: browsers
          feature: 'css-shapes'

# CSS3 text-overflow
feature require('caniuse-db/features-json/text-overflow.json'), (browsers) ->
  prefix 'text-overflow',
          browsers: browsers
          feature: 'text-overflow'

# Viewport at-rule
devdaptation = require('caniuse-db/features-json/css-deviceadaptation.json')
feature devdaptation, (browsers) ->
  prefix '@viewport',
          browsers: browsers
          feature: 'css-deviceadaptation'

# Resolution Media Queries
resolution = require('caniuse-db/features-json/css-media-resolution.json')

feature resolution, match: /( x($| )|a #3)/, (browsers) ->
  prefix '@resolution',
          browsers: browsers
          feature: 'css-media-resolution'

# CSS text-align-last
textAlignLast = require('caniuse-db/features-json/css-text-align-last.json')

feature textAlignLast, (browsers) ->
  prefix 'text-align-last',
          browsers: browsers
          feature: 'css-text-align-last'

# Crisp Edges Image Rendering Algorithm
crispedges = require('caniuse-db/features-json/css-crisp-edges.json')

feature crispedges, match: /y x|a x #1/, (browsers) ->
  prefix 'pixelated',
          props:  ['image-rendering']
          browsers: browsers
          feature: 'css-crisp-edges'

feature crispedges, match: /a x #2/, (browsers) ->
  prefix 'image-rendering',
          browsers: browsers
          feature: 'css-crisp-edges'

# Logical Properties
logicalProps = require('caniuse-db/features-json/css-logical-props.json')

feature logicalProps, (browsers) ->
  prefix 'border-inline-start',  'border-inline-end',
         'margin-inline-start',  'margin-inline-end',
         'padding-inline-start', 'padding-inline-end',
          browsers: browsers
          feature: 'css-logical-props'

feature logicalProps, match: /x\s#2/, (browsers) ->
  prefix 'border-block-start',  'border-block-end',
         'margin-block-start',  'margin-block-end',
         'padding-block-start', 'padding-block-end',
          browsers: browsers
          feature: 'css-logical-props'

# CSS appearance
feature require('caniuse-db/features-json/css-appearance.json'), (browsers) ->
  prefix 'appearance',
          browsers: browsers
          feature: 'css-appearance'

# CSS Scroll snap points
feature require('caniuse-db/features-json/css-snappoints.json'), (browsers) ->
  prefix 'scroll-snap-type',
         'scroll-snap-coordinate',
         'scroll-snap-destination',
         'scroll-snap-points-x', 'scroll-snap-points-y',
          browsers: browsers
          feature: 'css-snappoints'

# CSS Regions
feature require('caniuse-db/features-json/css-regions.json'), (browsers) ->
  prefix 'flow-into', 'flow-from',
         'region-fragment',
          browsers: browsers
          feature: 'css-regions'

# CSS image-set
feature require('caniuse-db/features-json/css-image-set.json'), (browsers) ->
  prefix 'image-set',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers
          feature: 'css-image-set'

# Writing Mode
writingMode = require('caniuse-db/features-json/css-writing-mode.json')
feature writingMode, match: /a|x/, (browsers) ->
  prefix 'writing-mode',
          browsers: browsers
          feature: 'css-writing-mode'

# Cross-Fade Function
feature require('caniuse-db/features-json/css-cross-fade.json'), (browsers) ->
  prefix 'cross-fade',
          props: ['background', 'background-image', 'border-image', 'mask',
                  'list-style', 'list-style-image', 'content', 'mask-image']
          browsers: browsers
          feature: 'css-cross-fade'

# Read Only selector
readOnly = require('caniuse-db/features-json/css-read-only-write.json')
feature readOnly, (browsers) ->
  prefix ':read-only', ':read-write',
          selector: true,
          browsers: browsers
          feature: 'css-read-only-write'

# Text Emphasize
feature require('caniuse-db/features-json/text-emphasis.json'), (browsers) ->
  prefix 'text-emphasis', 'text-emphasis-position',
         'text-emphasis-style', 'text-emphasis-color',
          browsers: browsers
          feature: 'text-emphasis'

# CSS Grid Layout
grid = require('caniuse-db/features-json/css-grid.json')
feature grid, (browsers) ->
  prefix 'display-grid', 'inline-grid',
          props:  ['display']
          browsers: browsers
          feature: 'css-grid'
  prefix 'grid-template-columns', 'grid-template-rows',
         'grid-row-start', 'grid-column-start',
         'grid-row-end', 'grid-column-end',
         'grid-row', 'grid-column',
          browsers: browsers
          feature: 'css-grid'

feature grid, match: /a x/, (browsers) ->
  prefix 'justify-items', 'grid-row-align',
          browsers: browsers
          feature: 'css-grid'

# CSS text-spacing
textSpacing = require('caniuse-db/features-json/css-text-spacing.json')

feature textSpacing, (browsers) ->
  prefix 'text-spacing',
          browsers: browsers
          feature: 'css-text-spacing'

# :any-link selector
feature require('caniuse-db/features-json/css-any-link.json'), (browsers) ->
  prefix ':any-link',
          selector: true,
          browsers: browsers
          feature: 'css-any-link'
