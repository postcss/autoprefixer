/* eslint-disable max-len */

const unpackFeature = require('caniuse-lite').feature;

const browsersSort = (a, b) => {
      a = a.split(' ');
      b = b.split(' ');
      if (a[0] > b[0]) {
          return 1;
      } else if (a[0] < b[0]) {
          return -1;
          }
    return Math.sign(parseFloat(a[1]) - parseFloat(b[1]));
};

// Convert Can I Use data
const feature = function (data, opts, callback) {
    if (!callback) {
        [callback, opts] = [opts, {}];
    }

    const match = opts.match || /\sx($|\s)/;
    const need  = [];

    for (let browser in data.stats) {
        const versions = data.stats[browser];
        for (let version in versions) {
            const support = versions[version];
            if (support.match(match)) {
                need.push(browser + ' ' + version);
            }
        }
    }

    callback(need.sort(browsersSort));
};

// Add data for all properties
const result = {};

const prefix = function (names, data) {
    for (const name of names) {
        result[name] = Object.assign({}, data);
        }
};

const add = function (names, data) {
    for (const name of names) {
        result[name].browsers = result[name].browsers
            .concat(data.browsers)
            .sort(browsersSort);
    }
};

module.exports = result;

// Border Radius
feature(unpackFeature(require('caniuse-lite/data/features/border-radius.js')), browsers =>
    prefix([
        'border-radius', 'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-right-radius', 'border-bottom-left-radius'
    ], {
             mistakes: ['-khtml-', '-ms-', '-o-'],
             browsers,
             feature: 'border-radius'
    })
);

// Box Shadow
feature(unpackFeature(require('caniuse-lite/data/features/css-boxshadow.js')), browsers =>
    prefix(['box-shadow'], {
      mistakes: ['-khtml-'],
      browsers,
      feature: 'css-boxshadow'
    })
);

// Animation
feature(unpackFeature(require('caniuse-lite/data/features/css-animation.js')), browsers =>
    prefix([
        'animation', 'animation-name', 'animation-duration',
         'animation-delay', 'animation-direction', 'animation-fill-mode',
         'animation-iteration-count', 'animation-play-state',
        'animation-timing-function', '@keyframes'
    ], {
             mistakes: ['-khtml-', '-ms-'],
             browsers,
             feature: 'css-animation'
    })
);

// Transition
feature(unpackFeature(require('caniuse-lite/data/features/css-transitions.js')), browsers =>
    prefix([
        'transition', 'transition-property', 'transition-duration',
        'transition-delay', 'transition-timing-function'
    ], {
             mistakes: ['-khtml-', '-ms-'],
             browsers,
             feature: 'css-transitions'
    })
);

// Transform 2D
feature(unpackFeature(require('caniuse-lite/data/features/transforms2d.js')), browsers =>
    prefix(['transform', 'transform-origin'], {
      browsers,
      feature: 'transforms2d'
    })
);

// Transform 3D
const transforms3d = unpackFeature(require('caniuse-lite/data/features/transforms3d.js'));
feature(transforms3d, (browsers) => {
    prefix(['perspective', 'perspective-origin'], {
        browsers,
        feature: 'transforms3d'
    });
    return prefix(['transform-style'], {
        mistakes: ['-ms-', '-o-'],
        browsers,
        feature: 'transforms3d'
    });
});

feature(transforms3d, { match: /y\sx|y\s#2/ }, browsers =>
    prefix(['backface-visibility'], {
      mistakes: ['-ms-', '-o-'],
      browsers,
      feature: 'transforms3d'
    })
);

// Gradients
const gradients = unpackFeature(require('caniuse-lite/data/features/css-gradients.js'));

feature(gradients, { match: /y\sx/ }, browsers =>
    prefix([
        'linear-gradient', 'repeating-linear-gradient',
        'radial-gradient', 'repeating-radial-gradient'
    ], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
             mistakes: ['-ms-'],
             browsers,
             feature: 'css-gradients'
    })
);

feature(gradients, { match: /a\sx/ }, browsers => {
    browsers = browsers.map((i) => {
        if (/op/.test(i)) {
            return i;
        } else {
            return `${i} old`;
        }
    });
    return add([
        'linear-gradient', 'repeating-linear-gradient',
        'radial-gradient', 'repeating-radial-gradient'
    ], {
          browsers,
          feature: 'css-gradients'
    });
});

// Box sizing
feature(unpackFeature(require('caniuse-lite/data/features/css3-boxsizing.js')), browsers =>
    prefix(['box-sizing'], {
      browsers,
      feature: 'css3-boxsizing'
    })
);

// Filter Effects
feature(unpackFeature(require('caniuse-lite/data/features/css-filters.js')), browsers =>
    prefix(['filter'], {
      browsers,
      feature: 'css-filters'
    })
);

// filter() function
const filterFunction = unpackFeature(require('caniuse-lite/data/features/css-filter-function.js'));

feature(filterFunction, browsers =>
    prefix(['filter-function'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
      browsers,
      feature: 'css-filter-function'
    })
);

// Backdrop-filter
const backdropFilter = unpackFeature(require('caniuse-lite/data/features/css-backdrop-filter.js'));

feature(backdropFilter, browsers =>
    prefix(['backdrop-filter'], {
      browsers,
      feature: 'css-backdrop-filter'
    })
);

// element() function
const elementFunction = unpackFeature(require('caniuse-lite/data/features/css-element-function.js'));

feature(elementFunction, browsers =>
    prefix(['element'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
      browsers,
      feature: 'css-element-function'
    })
);

// Multicolumns
feature(unpackFeature(require('caniuse-lite/data/features/multicolumn.js')), (browsers) => {
    prefix([
        'columns', 'column-width', 'column-gap',
        'column-rule', 'column-rule-color', 'column-rule-width'
    ], {
             browsers,
             feature: 'multicolumn'
    });

    return prefix([
        'column-count', 'column-rule-style', 'column-span', 'column-fill',
        'break-before', 'break-after', 'break-inside'
    ], {
             browsers,
             feature: 'multicolumn'
    });
});

// User select
const userSelectNone = unpackFeature(require('caniuse-lite/data/features/user-select-none.js'));

feature(userSelectNone, browsers =>
    prefix(['user-select'], {
      mistakes: ['-khtml-'],
      browsers,
      feature: 'user-select-none'
    })
);

// Flexible Box Layout
const flexbox = unpackFeature(require('caniuse-lite/data/features/flexbox.js'));

feature(flexbox, { match: /a\sx/ }, browsers => {
    browsers = browsers.map((i) => {
        if (/ie|firefox/.test(i)) {
            return i;
        } else {
            return `${i} 2009`;
        }
    });
    prefix(['display-flex', 'inline-flex'], {
        props:  ['display'],
        browsers,
        feature: 'flexbox'
    });
    prefix(['flex', 'flex-grow', 'flex-shrink', 'flex-basis'], {
        browsers,
        feature: 'flexbox'
    });
    prefix([
        'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
        'order', 'align-items', 'align-self', 'align-content'
    ], {
             browsers,
             feature: 'flexbox'
    });
});

feature(flexbox, { match: /y\sx/ }, browsers => {
    add(['display-flex', 'inline-flex'], {
        browsers,
        feature: 'flexbox'
    });
    add(['flex', 'flex-grow', 'flex-shrink', 'flex-basis'], {
        browsers,
        feature: 'flexbox'
    });
    add([
        'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
        'order', 'align-items', 'align-self', 'align-content'
    ], {
          browsers,
          feature: 'flexbox'
    });
});

// calc() unit
feature(unpackFeature(require('caniuse-lite/data/features/calc.js')), browsers =>
    prefix(['calc'], {
      props:  ['*'],
      browsers,
      feature: 'calc'
    })
);

// Background options
const bckgrndImgOpts = unpackFeature(require('caniuse-lite/data/features/background-img-opts.js'));

feature(bckgrndImgOpts, browsers =>
    prefix(['background-clip', 'background-origin', 'background-size'], {
      browsers,
      feature: 'background-img-opts'
    })
);

// Font feature settings
feature(unpackFeature(require('caniuse-lite/data/features/font-feature.js')), browsers =>
    prefix([
        'font-feature-settings', 'font-variant-ligatures',
        'font-language-override'
    ], {
             browsers,
             feature: 'font-feature'
    })
);

// CSS font-kerning property
feature(unpackFeature(require('caniuse-lite/data/features/font-kerning.js')), browsers =>
    prefix(['font-kerning'], {
      browsers,
      feature: 'font-kerning'
    })
);

// Border image
feature(unpackFeature(require('caniuse-lite/data/features/border-image.js')), browsers =>
    prefix(['border-image'], {
      browsers,
      feature: 'border-image'
    })
);

// Selection selector
feature(unpackFeature(require('caniuse-lite/data/features/css-selection.js')), browsers =>
    prefix(['::selection'], {
      selector: true,
      browsers,
      feature: 'css-selection'
    })
);

// Placeholder selector
feature(unpackFeature(require('caniuse-lite/data/features/css-placeholder.js')), (browsers) => {
    browsers = browsers.map((i) => {
        const [name, version] = i.split(' ');
        if (name === 'firefox' && parseFloat(version) <= 18) {
            return i + ' old';
        } else {
            return i;
        }
    });

    return prefix(['::placeholder'], {
        selector: true,
        browsers,
        feature: 'css-placeholder'
    });
});

// Hyphenation
feature(unpackFeature(require('caniuse-lite/data/features/css-hyphens.js')), browsers =>
    prefix(['hyphens'], {
      browsers,
      feature: 'css-hyphens'
    })
);

// Fullscreen selector
const fullscreen = unpackFeature(require('caniuse-lite/data/features/fullscreen.js'));

feature(fullscreen, browsers =>
    prefix([':fullscreen'], {
      selector: true,
      browsers,
      feature: 'fullscreen'
    })
);

feature(fullscreen, { match: /x(\s#2|$)/ }, browsers =>
    prefix(['::backdrop'], {
      selector: true,
      browsers,
      feature: 'fullscreen'
    })
);

// Tab size
feature(unpackFeature(require('caniuse-lite/data/features/css3-tabsize.js')), browsers =>
    prefix(['tab-size'], {
      browsers,
      feature: 'css3-tabsize'
    })
);

// Intrinsic & extrinsic sizing
feature(unpackFeature(require('caniuse-lite/data/features/intrinsic-width.js')), browsers =>
    prefix([
        'max-content', 'min-content', 'fit-content',
        'fill', 'fill-available', 'stretch'
    ], {
        props: [
            'width', 'min-width', 'max-width',
                 'height', 'min-height', 'max-height',
                 'inline-size', 'min-inline-size', 'max-inline-size',
            'block-size', 'min-block-size', 'max-block-size'
        ],
             browsers,
             feature: 'intrinsic-width'
    })
);

// Zoom cursors
const cursorsNewer = unpackFeature(require('caniuse-lite/data/features/css3-cursors-newer.js'));

feature(cursorsNewer, browsers =>
    prefix(['zoom-in', 'zoom-out'], {
      props:  ['cursor'],
      browsers,
      feature: 'css3-cursors-newer'
    })
);

// Grab cursors
const cursorsGrab = unpackFeature(require('caniuse-lite/data/features/css3-cursors-grab.js'));
feature(cursorsGrab, browsers =>
    prefix(['grab', 'grabbing'], {
      props:  ['cursor'],
      browsers,
      feature: 'css3-cursors-grab'
    })
);

// Sticky position
feature(unpackFeature(require('caniuse-lite/data/features/css-sticky.js')), browsers =>
    prefix(['sticky'], {
      props:  ['position'],
      browsers,
      feature: 'css-sticky'
    })
);

// Pointer Events
feature(unpackFeature(require('caniuse-lite/data/features/pointer.js')), browsers =>
    prefix(['touch-action'], {
      browsers,
      feature: 'pointer'
    })
);

// Text decoration
const decoration = unpackFeature(require('caniuse-lite/data/features/text-decoration.js'));

feature(decoration, browsers =>
    prefix([
        'text-decoration-style',
         'text-decoration-color',
        'text-decoration-line'
    ], {
             browsers,
             feature: 'text-decoration'
    })
);

feature(decoration, { match: /x.*#[23]/ }, browsers =>
    prefix(['text-decoration-skip'], {
      browsers,
      feature: 'text-decoration'
    })
);

// Text Size Adjust
const textSizeAdjust = unpackFeature(require('caniuse-lite/data/features/text-size-adjust.js'));

feature(textSizeAdjust, browsers =>
    prefix(['text-size-adjust'], {
      browsers,
      feature: 'text-size-adjust'
    })
);

// CSS Masks
feature(unpackFeature(require('caniuse-lite/data/features/css-masks.js')), (browsers) => {
    prefix([
        'mask-clip', 'mask-composite', 'mask-image',
         'mask-origin', 'mask-repeat', 'mask-border-repeat',
        'mask-border-source'
    ], {
             browsers,
             feature: 'css-masks'
    });
    return prefix([
        'mask', 'mask-position', 'mask-size',
         'mask-border', 'mask-border-outset', 'mask-border-width',
        'mask-border-slice'
    ], {
             browsers,
             feature: 'css-masks'
    });
});

// CSS clip-path property
feature(unpackFeature(require('caniuse-lite/data/features/css-clip-path.js')), browsers =>
    prefix(['clip-path'], {
      browsers,
      feature: 'css-clip-path'
    })
);

// Fragmented Borders and Backgrounds
const boxdecorbreak = unpackFeature(require('caniuse-lite/data/features/css-boxdecorationbreak.js'));

feature(boxdecorbreak, browsers =>
    prefix(['box-decoration-break'], {
      browsers,
      feature: 'css-boxdecorationbreak'
    })
);

// CSS3 object-fit/object-position
feature(unpackFeature(require('caniuse-lite/data/features/object-fit.js')), browsers =>
    prefix(['object-fit', 'object-position'], {
             browsers,
             feature: 'object-fit'
    })
);

// CSS Shapes
feature(unpackFeature(require('caniuse-lite/data/features/css-shapes.js')), browsers =>
    prefix([
        'shape-margin',
         'shape-outside',
        'shape-image-threshold'
    ], {
             browsers,
             feature: 'css-shapes'
    })
);

// CSS3 text-overflow
feature(unpackFeature(require('caniuse-lite/data/features/text-overflow.js')), browsers =>
    prefix(['text-overflow'], {
      browsers,
      feature: 'text-overflow'
    })
);

// Viewport at-rule
const devdaptation = unpackFeature(require('caniuse-lite/data/features/css-deviceadaptation.js'));
feature(devdaptation, browsers =>
    prefix(['@viewport'], {
      browsers,
      feature: 'css-deviceadaptation'
    })
);

// Resolution Media Queries
const resolution = unpackFeature(require('caniuse-lite/data/features/css-media-resolution.js'));

feature(resolution, { match: /( x($| )|a #3)/ }, browsers =>
    prefix(['@resolution'], {
      browsers,
      feature: 'css-media-resolution'
    })
);

// CSS text-align-last
const textAlignLast = unpackFeature(require('caniuse-lite/data/features/css-text-align-last.js'));

feature(textAlignLast, browsers =>
    prefix(['text-align-last'], {
      browsers,
      feature: 'css-text-align-last'
    })
);

// Crisp Edges Image Rendering Algorithm
const crispedges = unpackFeature(require('caniuse-lite/data/features/css-crisp-edges.js'));

feature(crispedges, { match: /y x|a x #1/ }, browsers =>
    prefix(['pixelated'], {
      props:  ['image-rendering'],
      browsers,
      feature: 'css-crisp-edges'
    })
);

feature(crispedges, { match: /a x #2/ }, browsers =>
    prefix(['image-rendering'], {
      browsers,
      feature: 'css-crisp-edges'
    })
);

// Logical Properties
const logicalProps = unpackFeature(require('caniuse-lite/data/features/css-logical-props.js'));

feature(logicalProps, browsers =>
    prefix([
        'border-inline-start', 'border-inline-end',
         'margin-inline-start',  'margin-inline-end',
        'padding-inline-start', 'padding-inline-end'
    ], {
             browsers,
             feature: 'css-logical-props'
    })
);

feature(logicalProps, { match: /x\s#2/ }, browsers =>
    prefix([
        'border-block-start', 'border-block-end',
         'margin-block-start',  'margin-block-end',
        'padding-block-start', 'padding-block-end'
    ], {
             browsers,
             feature: 'css-logical-props'
    })
);

// CSS appearance
feature(unpackFeature(require('caniuse-lite/data/features/css-appearance.js')), browsers =>
    prefix(['appearance'], {
      browsers,
      feature: 'css-appearance'
    })
);

// CSS Scroll snap points
feature(unpackFeature(require('caniuse-lite/data/features/css-snappoints.js')), browsers =>
    prefix([
        'scroll-snap-type',
         'scroll-snap-coordinate',
         'scroll-snap-destination',
        'scroll-snap-points-x', 'scroll-snap-points-y'
    ], {
             browsers,
             feature: 'css-snappoints'
    })
);

// CSS Regions
feature(unpackFeature(require('caniuse-lite/data/features/css-regions.js')), browsers =>
    prefix([
        'flow-into', 'flow-from',
        'region-fragment'
    ], {
             browsers,
             feature: 'css-regions'
    })
);

// CSS image-set
feature(unpackFeature(require('caniuse-lite/data/features/css-image-set.js')), browsers =>
    prefix(['image-set'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
      browsers,
      feature: 'css-image-set'
    })
);

// Writing Mode
const writingMode = unpackFeature(require('caniuse-lite/data/features/css-writing-mode.js'));
feature(writingMode, { match: /a|x/ }, browsers =>
    prefix(['writing-mode'], {
      browsers,
      feature: 'css-writing-mode'
    })
);

// Cross-Fade Function
feature(unpackFeature(require('caniuse-lite/data/features/css-cross-fade.js')), browsers =>
    prefix(['cross-fade'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
      browsers,
      feature: 'css-cross-fade'
    })
);

// Read Only selector
const readOnly = unpackFeature(require('caniuse-lite/data/features/css-read-only-write.js'));
feature(readOnly, browsers =>
    prefix([':read-only', ':read-write'], {
      selector: true,
      browsers,
      feature: 'css-read-only-write'
    })
);

// Text Emphasize
feature(unpackFeature(require('caniuse-lite/data/features/text-emphasis.js')), browsers =>
    prefix([
        'text-emphasis', 'text-emphasis-position',
        'text-emphasis-style', 'text-emphasis-color'
    ], {
             browsers,
             feature: 'text-emphasis'
    })
);

// CSS Grid Layout
const grid = unpackFeature(require('caniuse-lite/data/features/css-grid.js'));
feature(grid, (browsers) => {
    prefix(['display-grid', 'inline-grid'], {
        props:  ['display'],
        browsers,
        feature: 'css-grid'
    });
    return prefix([
        'grid-template-columns', 'grid-template-rows',
         'grid-row-start', 'grid-column-start',
         'grid-row-end', 'grid-column-end',
        'grid-row', 'grid-column'
    ], {
             browsers,
             feature: 'css-grid'
    });
});

feature(grid, { match: /a x/ }, browsers =>
    prefix(['justify-items', 'grid-row-align'], {
      browsers,
      feature: 'css-grid'
    })
);

// CSS text-spacing
const textSpacing = unpackFeature(require('caniuse-lite/data/features/css-text-spacing.js'));

feature(textSpacing, browsers =>
    prefix(['text-spacing'], {
      browsers,
      feature: 'css-text-spacing'
    })
);

// :any-link selector
feature(unpackFeature(require('caniuse-lite/data/features/css-any-link.js')), browsers =>
    prefix([':any-link'], {
      selector: true,
      browsers,
      feature: 'css-any-link'
    })
);
