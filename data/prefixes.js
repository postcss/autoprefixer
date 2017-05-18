const unpack = require('caniuse-lite').feature;

const browsersSort = (a, b) => {
    a = a.split(' ');
    b = b.split(' ');
    if (a[0] > b[0]) {
        return 1;
    } else if (a[0] < b[0]) {
        return -1;
    } else {
        return Math.sign(parseFloat(a[1]) - parseFloat(b[1]));
    }
};

// Convert Can I Use data
function f(data, opts, callback) {
    data = unpack(data);

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
}

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
f(require('caniuse-lite/data/features/border-radius.js'), browsers =>
    prefix([
        'border-radius', 'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-right-radius', 'border-bottom-left-radius'
    ], {
        mistakes: ['-khtml-', '-ms-', '-o-'],
        feature: 'border-radius',
        browsers
    })
);

// Box Shadow
f(require('caniuse-lite/data/features/css-boxshadow.js'), browsers =>
    prefix(['box-shadow'], {
        mistakes: ['-khtml-'],
        feature: 'css-boxshadow',
        browsers
    })
);

// Animation
f(require('caniuse-lite/data/features/css-animation.js'), browsers =>
    prefix([
        'animation', 'animation-name', 'animation-duration',
        'animation-delay', 'animation-direction', 'animation-fill-mode',
        'animation-iteration-count', 'animation-play-state',
        'animation-timing-function', '@keyframes'
    ], {
        mistakes: ['-khtml-', '-ms-'],
        feature: 'css-animation',
        browsers
    })
);

// Transition
f(require('caniuse-lite/data/features/css-transitions.js'), browsers =>
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
f(require('caniuse-lite/data/features/transforms2d.js'), browsers =>
    prefix(['transform', 'transform-origin'], {
        feature: 'transforms2d',
        browsers
    })
);

// Transform 3D
const transforms3d = require('caniuse-lite/data/features/transforms3d.js');

f(transforms3d, browsers => {
    prefix(['perspective', 'perspective-origin'], {
        feature: 'transforms3d',
        browsers
    });
    return prefix(['transform-style'], {
        mistakes: ['-ms-', '-o-'],
        browsers,
        feature: 'transforms3d'
    });
});

f(transforms3d, { match: /y\sx|y\s#2/ }, browsers =>
    prefix(['backface-visibility'], {
        mistakes: ['-ms-', '-o-'],
        feature: 'transforms3d',
        browsers
    })
);

// Gradients
const gradients = require('caniuse-lite/data/features/css-gradients.js');

f(gradients, { match: /y\sx/ }, browsers =>
    prefix([
        'linear-gradient', 'repeating-linear-gradient',
        'radial-gradient', 'repeating-radial-gradient'
    ], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
        mistakes: ['-ms-'],
        feature: 'css-gradients',
        browsers
    })
);

f(gradients, { match: /a\sx/ }, browsers => {
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
        feature: 'css-gradients',
        browsers
    });
});

// Box sizing
f(require('caniuse-lite/data/features/css3-boxsizing.js'), browsers =>
    prefix(['box-sizing'], {
        feature: 'css3-boxsizing',
        browsers
    })
);

// Filter Effects
f(require('caniuse-lite/data/features/css-filters.js'), browsers =>
    prefix(['filter'], {
        feature: 'css-filters',
        browsers
    })
);

// filter() function
f(require('caniuse-lite/data/features/css-filter-function.js'), browsers =>
    prefix(['filter-function'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
        feature: 'css-filter-function',
        browsers
    })
);

// Backdrop-filter
f(require('caniuse-lite/data/features/css-backdrop-filter.js'), browsers =>
    prefix(['backdrop-filter'], {
        feature: 'css-backdrop-filter',
        browsers
    })
);

// element() function
f(require('caniuse-lite/data/features/css-element-function.js'), browsers =>
    prefix(['element'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
        feature: 'css-element-function',
        browsers
    })
);

// Multicolumns
f(require('caniuse-lite/data/features/multicolumn.js'), browsers => {
    prefix([
        'columns', 'column-width', 'column-gap',
        'column-rule', 'column-rule-color', 'column-rule-width'
    ], {
        feature: 'multicolumn',
        browsers
    });

    prefix([
        'column-count', 'column-rule-style', 'column-span', 'column-fill',
        'break-before', 'break-after', 'break-inside'
    ], {
        feature: 'multicolumn',
        browsers
    });
});

// User select
f(require('caniuse-lite/data/features/user-select-none.js'), browsers =>
    prefix(['user-select'], {
        mistakes: ['-khtml-'],
        feature: 'user-select-none',
        browsers
    })
);

// Flexible Box Layout
const flexbox = require('caniuse-lite/data/features/flexbox.js');
f(flexbox, { match: /a\sx/ }, browsers => {
    browsers = browsers.map((i) => {
        if (/ie|firefox/.test(i)) {
            return i;
        } else {
            return `${i} 2009`;
        }
    });
    prefix(['display-flex', 'inline-flex'], {
        props:  ['display'],
        feature: 'flexbox',
        browsers
    });
    prefix(['flex', 'flex-grow', 'flex-shrink', 'flex-basis'], {
        feature: 'flexbox',
        browsers
    });
    prefix([
        'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
        'order', 'align-items', 'align-self', 'align-content'
    ], {
        feature: 'flexbox',
        browsers
    });
});

f(flexbox, { match: /y\sx/ }, browsers => {
    add(['display-flex', 'inline-flex'], {
        feature: 'flexbox',
        browsers
    });
    add(['flex', 'flex-grow', 'flex-shrink', 'flex-basis'], {
        feature: 'flexbox',
        browsers
    });
    add([
        'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
        'order', 'align-items', 'align-self', 'align-content'
    ], {
        feature: 'flexbox',
        browsers
    });
});

// calc() unit
f(require('caniuse-lite/data/features/calc.js'), browsers =>
    prefix(['calc'], {
        props:  ['*'],
        feature: 'calc',
        browsers
    })
);

// Background options
f(require('caniuse-lite/data/features/background-img-opts.js'), browsers =>
    prefix(['background-clip', 'background-origin', 'background-size'], {
        feature: 'background-img-opts',
        browsers
    })
);

// Font feature settings
f(require('caniuse-lite/data/features/font-feature.js'), browsers =>
    prefix([
        'font-feature-settings', 'font-variant-ligatures',
        'font-language-override'
    ], {
        feature: 'font-feature',
        browsers
    })
);

// CSS font-kerning property
f(require('caniuse-lite/data/features/font-kerning.js'), browsers =>
    prefix(['font-kerning'], {
        feature: 'font-kerning',
        browsers
    })
);

// Border image
f(require('caniuse-lite/data/features/border-image.js'), browsers =>
    prefix(['border-image'], {
        feature: 'border-image',
        browsers
    })
);

// Selection selector
f(require('caniuse-lite/data/features/css-selection.js'), browsers =>
    prefix(['::selection'], {
        selector: true,
        feature: 'css-selection',
        browsers
    })
);

// Placeholder selector
f(require('caniuse-lite/data/features/css-placeholder.js'), browsers => {
    browsers = browsers.map((i) => {
        const [name, version] = i.split(' ');
        if (name === 'firefox' && parseFloat(version) <= 18) {
            return i + ' old';
        } else {
            return i;
        }
    });

    prefix(['::placeholder'], {
        selector: true,
        feature: 'css-placeholder',
        browsers
    });
});

// Hyphenation
f(require('caniuse-lite/data/features/css-hyphens.js'), browsers =>
    prefix(['hyphens'], {
        feature: 'css-hyphens',
        browsers
    })
);

// Fullscreen selector
const fullscreen = require('caniuse-lite/data/features/fullscreen.js');

f(fullscreen, browsers =>
    prefix([':fullscreen'], {
        selector: true,
        feature: 'fullscreen',
        browsers
    })
);

f(fullscreen, { match: /x(\s#2|$)/ }, browsers =>
    prefix(['::backdrop'], {
        selector: true,
        feature: 'fullscreen',
        browsers
    })
);

// Tab size
f(require('caniuse-lite/data/features/css3-tabsize.js'), browsers =>
    prefix(['tab-size'], {
        feature: 'css3-tabsize',
        browsers
    })
);

// Intrinsic & extrinsic sizing
f(require('caniuse-lite/data/features/intrinsic-width.js'), browsers =>
    prefix([
        'max-content', 'min-content', 'fit-content',
        'fill', 'fill-available', 'stretch'
    ], {
        props: [
            'width', 'min-width', 'max-width',
            'height', 'min-height', 'max-height',
            'inline-size', 'min-inline-size', 'max-inline-size',
            'block-size', 'min-block-size', 'max-block-size',
            'grid', 'grid-template',
            'grid-template-rows', 'grid-template-columns',
            'grid-auto-columns', 'grid-auto-rows'
        ],
        feature: 'intrinsic-width',
        browsers
    })
);

// Zoom cursors
f(require('caniuse-lite/data/features/css3-cursors-newer.js'), browsers =>
    prefix(['zoom-in', 'zoom-out'], {
        props:  ['cursor'],
        feature: 'css3-cursors-newer',
        browsers
    })
);

// Grab cursors
f(require('caniuse-lite/data/features/css3-cursors-grab.js'), browsers =>
    prefix(['grab', 'grabbing'], {
        props:  ['cursor'],
        feature: 'css3-cursors-grab',
        browsers
    })
);

// Sticky position
f(require('caniuse-lite/data/features/css-sticky.js'), browsers =>
    prefix(['sticky'], {
        props:  ['position'],
        feature: 'css-sticky',
        browsers
    })
);

// Pointer Events
f(require('caniuse-lite/data/features/pointer.js'), browsers =>
    prefix(['touch-action'], {
        feature: 'pointer',
        browsers
    })
);

// Text decoration
const decoration = require('caniuse-lite/data/features/text-decoration.js');

f(decoration, browsers =>
    prefix([
        'text-decoration-style',
        'text-decoration-color',
        'text-decoration-line'
    ], {
        feature: 'text-decoration',
        browsers
    })
);

f(decoration, { match: /x.*#[23]/ }, browsers =>
    prefix(['text-decoration-skip'], {
        feature: 'text-decoration',
        browsers
    })
);

// Text Size Adjust
f(require('caniuse-lite/data/features/text-size-adjust.js'), browsers =>
    prefix(['text-size-adjust'], {
        feature: 'text-size-adjust',
        browsers
    })
);

// CSS Masks
f(require('caniuse-lite/data/features/css-masks.js'), browsers => {
    prefix([
        'mask-clip', 'mask-composite', 'mask-image',
        'mask-origin', 'mask-repeat', 'mask-border-repeat',
        'mask-border-source'
    ], {
        feature: 'css-masks',
        browsers
    });
    prefix([
        'mask', 'mask-position', 'mask-size',
        'mask-border', 'mask-border-outset', 'mask-border-width',
        'mask-border-slice'
    ], {
        feature: 'css-masks',
        browsers
    });
});

// CSS clip-path property
f(require('caniuse-lite/data/features/css-clip-path.js'), browsers =>
    prefix(['clip-path'], {
        feature: 'css-clip-path',
        browsers
    })
);

// Fragmented Borders and Backgrounds
f(require('caniuse-lite/data/features/css-boxdecorationbreak.js'), browsers =>
    prefix(['box-decoration-break'], {
        feature: 'css-boxdecorationbreak',
        browsers
    })
);

// CSS3 object-fit/object-position
f(require('caniuse-lite/data/features/object-fit.js'), browsers =>
    prefix(['object-fit', 'object-position'], {
        feature: 'object-fit',
        browsers
    })
);

// CSS Shapes
f(require('caniuse-lite/data/features/css-shapes.js'), browsers =>
    prefix(['shape-margin', 'shape-outside', 'shape-image-threshold'], {
        feature: 'css-shapes',
        browsers
    })
);

// CSS3 text-overflow
f(require('caniuse-lite/data/features/text-overflow.js'), browsers =>
    prefix(['text-overflow'], {
        feature: 'text-overflow',
        browsers
    })
);

// Viewport at-rule
f(require('caniuse-lite/data/features/css-deviceadaptation.js'), browsers =>
    prefix(['@viewport'], {
        feature: 'css-deviceadaptation',
        browsers
    })
);

// Resolution Media Queries
const resolut = require('caniuse-lite/data/features/css-media-resolution.js');
f(resolut, { match: /( x($| )|a #3)/ }, browsers =>
    prefix(['@resolution'], {
        feature: 'css-media-resolution',
        browsers
    })
);

// CSS text-align-last
f(require('caniuse-lite/data/features/css-text-align-last.js'), browsers =>
    prefix(['text-align-last'], {
        feature: 'css-text-align-last',
        browsers
    })
);

// Crisp Edges Image Rendering Algorithm
const crispedges = require('caniuse-lite/data/features/css-crisp-edges.js');

f(crispedges, { match: /y x|a x #1/ }, browsers =>
    prefix(['pixelated'], {
        props:  ['image-rendering'],
        feature: 'css-crisp-edges',
        browsers
    })
);

f(crispedges, { match: /a x #2/ }, browsers =>
    prefix(['image-rendering'], {
        feature: 'css-crisp-edges',
        browsers
    })
);

// Logical Properties
const logicalProps = require('caniuse-lite/data/features/css-logical-props.js');

f(logicalProps, browsers =>
    prefix([
        'border-inline-start', 'border-inline-end',
        'margin-inline-start',  'margin-inline-end',
        'padding-inline-start', 'padding-inline-end'
    ], {
        feature: 'css-logical-props',
        browsers
    })
);

f(logicalProps, { match: /x\s#2/ }, browsers =>
    prefix([
        'border-block-start', 'border-block-end',
        'margin-block-start',  'margin-block-end',
        'padding-block-start', 'padding-block-end'
    ], {
        feature: 'css-logical-props',
        browsers
    })
);

// CSS appearance
const appearance = require('caniuse-lite/data/features/css-appearance.js');
f(appearance, { match: /#2|x/ }, browsers =>
    prefix(['appearance'], {
        feature: 'css-appearance',
        browsers
    })
);

// CSS Scroll snap points
f(require('caniuse-lite/data/features/css-snappoints.js'), browsers =>
    prefix([
        'scroll-snap-type',
        'scroll-snap-coordinate',
        'scroll-snap-destination',
        'scroll-snap-points-x', 'scroll-snap-points-y'
    ], {
        feature: 'css-snappoints',
        browsers
    })
);

// CSS Regions
f(require('caniuse-lite/data/features/css-regions.js'), browsers =>
    prefix([
        'flow-into', 'flow-from',
        'region-fragment'
    ], {
        feature: 'css-regions',
        browsers
    })
);

// CSS image-set
f(require('caniuse-lite/data/features/css-image-set.js'), browsers =>
    prefix(['image-set'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
        feature: 'css-image-set',
        browsers
    })
);

// Writing Mode
const writingMode = require('caniuse-lite/data/features/css-writing-mode.js');
f(writingMode, { match: /a|x/ }, browsers =>
    prefix(['writing-mode'], {
        feature: 'css-writing-mode',
        browsers
    })
);

// Cross-Fade Function
f(require('caniuse-lite/data/features/css-cross-fade.js'), browsers =>
    prefix(['cross-fade'], {
        props: [
            'background', 'background-image', 'border-image', 'mask',
            'list-style', 'list-style-image', 'content', 'mask-image'
        ],
        feature: 'css-cross-fade',
        browsers
    })
);

// Read Only selector
f(require('caniuse-lite/data/features/css-read-only-write.js'), browsers =>
    prefix([':read-only', ':read-write'], {
        selector: true,
        feature: 'css-read-only-write',
        browsers
    })
);

// Text Emphasize
f(require('caniuse-lite/data/features/text-emphasis.js'), browsers =>
    prefix([
        'text-emphasis', 'text-emphasis-position',
        'text-emphasis-style', 'text-emphasis-color'
    ], {
        feature: 'text-emphasis',
        browsers
    })
);

// CSS Grid Layout
const grid = require('caniuse-lite/data/features/css-grid.js');

f(grid, browsers => {
    prefix(['display-grid', 'inline-grid'], {
        props:  ['display'],
        feature: 'css-grid',
        browsers
    });
    prefix([
        'grid-template-columns', 'grid-template-rows',
        'grid-row-start', 'grid-column-start',
        'grid-row-end', 'grid-column-end',
        'grid-row', 'grid-column'
    ], {
        feature: 'css-grid',
        browsers
    });
});

f(grid, { match: /a x/ }, browsers =>
    prefix(['grid-column-align', 'grid-row-align'], {
        feature: 'css-grid',
        browsers
    })
);

// CSS text-spacing
f(require('caniuse-lite/data/features/css-text-spacing.js'), browsers =>
    prefix(['text-spacing'], {
        feature: 'css-text-spacing',
        browsers
    })
);

// :any-link selector
f(require('caniuse-lite/data/features/css-any-link.js'), browsers =>
    prefix([':any-link'], {
        selector: true,
        feature: 'css-any-link',
        browsers
    })
);

// unicode-bidi
const bidi = require('caniuse-lite/data/features/css-unicode-bidi.js');

f(bidi, browsers =>
    prefix(['isolate'], {
        props:  ['unicode-bidi'],
        feature: 'css-unicode-bidi',
        browsers
    })
);

f(bidi, { match: /y x|a x #2/ }, browsers =>
    prefix(['plaintext'], {
        props:  ['unicode-bidi'],
        feature: 'css-unicode-bidi',
        browsers
    })
);

f(bidi, { match: /y x/ }, browsers =>
    prefix(['isolate-override'], {
        props:  ['unicode-bidi'],
        feature: 'css-unicode-bidi',
        browsers
    })
);
