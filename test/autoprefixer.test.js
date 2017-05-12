const autoprefixer = require('../lib/autoprefixer');

const postcss = require('postcss');
const path    = require('path');
const fs      = require('fs');

const grider = autoprefixer({
    browsers: ['Chrome 25', 'Edge 12', 'IE 10'],
    cascade: false,
    grid: true
});

const cleaner = autoprefixer({
    browsers: []
});
const compiler = autoprefixer({
    browsers: ['Chrome 25', 'Opera 12']
});
const filterer = autoprefixer({
    browsers: ['Chrome 25', 'Safari 9', 'Firefox 39']
});
const borderer = autoprefixer({
    browsers: ['Safari 4', 'Firefox 3.6']
});
const cascader = autoprefixer({
    browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'],
    cascade:  true
});
const keyframer = autoprefixer({
    browsers: ['Chrome > 19', 'Opera 12']
});
const flexboxer = autoprefixer({
    browsers: ['Chrome > 19', 'Firefox 21', 'IE 10']
});
const without3d = autoprefixer({
    browsers: ['Opera 12', 'IE > 0']
});
const supporter = autoprefixer({
    browsers: ['Chrome 25', 'Chrome 28', 'IE > 0']
});
const uncascader = autoprefixer({
    browsers: ['Firefox 15']
});
const gradienter = autoprefixer({
    browsers: ['Chrome 25', 'Opera 12', 'Android 2.3']
});
const selectorer = autoprefixer({
    browsers: ['Chrome 25', 'Firefox > 17', 'IE 10']
});
const intrinsicer = autoprefixer({
    browsers: ['Chrome 25', 'Firefox 22', 'Safari 10']
});
const imagerender = autoprefixer({
    browsers: ['iOS 8', 'iOS 6.1', 'FF 22', 'IE 11']
});
const backgrounder = autoprefixer({
    browsers: ['Firefox 3.6', 'Android 2.3']
});
const resolutioner = autoprefixer({
    browsers: ['Safari 7', 'Opera 12']
});

function prefixer(name) {
    if (name === 'grid') {
        return grider;
    } else if (name === 'keyframes') {
        return keyframer;
    } else if (name === 'border-radius') {
        return borderer;
    } else if (name === 'vendor-hack' || name === 'value-hack') {
        return cleaner;
    } else if (name === 'mistakes') {
        return cleaner;
    } else if (name === 'gradient') {
        return gradienter;
    } else if (name === 'flexbox' || name === 'flex-rewrite') {
        return flexboxer;
    } else if (name === 'double') {
        return flexboxer;
    } else if (name === 'selectors' || name === 'placeholder') {
        return selectorer;
    } else if (name === 'intrinsic' || name === 'multicolumn') {
        return intrinsicer;
    } else if (name === 'cascade') {
        return cascader;
    } else if (name === '3d-transform') {
        return without3d;
    } else if (name === 'background-size') {
        return backgrounder;
    } else if (name === 'background-clip') {
        return cleaner;
    } else if (name === 'uncascade') {
        return uncascader;
    } else if (name === 'example') {
        return autoprefixer;
    } else if (name === 'viewport' || name === 'appearance') {
        return flexboxer;
    } else if (name === 'resolution') {
        return resolutioner;
    } else if (name === 'filter' || name === 'advanced-filter') {
        return filterer;
    } else if (name === 'element') {
        return filterer;
    } else if (name === 'image-rendering' || name === 'writing-mode') {
        return imagerender;
    } else if (name === 'logical') {
        return intrinsicer;
    } else if (name === 'supports') {
        return supporter;
    } else {
        return compiler;
    }
}

function read(name) {
    const file = path.join(__dirname, '/cases/' + name + '.css');
    return fs.readFileSync(file).toString();
}

function test(from, instance = prefixer(from)) {
    const input  = read(from);
    const output = read(from + '.out');
    const result = postcss([instance]).process(input);
    expect(result.warnings().length).toEqual(0);
    expect(result.css).toEqual(output);
}

const COMMONS = [
    'transition', 'values', 'keyframes', 'gradient', 'flex-rewrite',
    'flexbox', 'filter', 'border-image', 'border-radius', 'notes', 'selectors',
    'placeholder', 'fullscreen', 'intrinsic', 'mistakes', 'custom-prefix',
    'cascade', 'double', 'multicolumn', '3d-transform', 'background-size',
    'supports', 'viewport', 'resolution', 'logical', 'appearance',
    'advanced-filter', 'element', 'image-set', 'image-rendering',
    'mask-border', 'writing-mode', 'cross-fade', 'gradient-fix',
    'text-emphasis-position', 'grid'
];

it('throws on wrong options', () => {
    expect(() => {
        autoprefixer({ browser: ['chrome 25', 'opera 12'] });
    }).toThrowError(/browsers/);
});

it('sets options', () => {
    const opts = { browsers: ['chrome 25', 'opera 12'], cascade: false };
    expect(autoprefixer(opts).options).toEqual(opts);
});

it('has default browsers', () => {
    expect(autoprefixer.defaults.length).toBeDefined();
});

it('passes statistics to Browserslist', () => {
    const stats = {
        chrome: {
            10: 10,
            11: 40
        },
        ie: {
            10: 10,
            11: 40
        }
    };
    expect(autoprefixer({ browsers: '> 20% in my stats', stats }).info())
        .toMatch(/Browsers:\n\s\sChrome: 11\n\s\sIE: 11\n/);
});

it('prefixes values',                () => test('values'));
it('prefixes @keyframes',            () => test('keyframes'));
it('prefixes @viewport',             () => test('viewport'));
it('prefixes selectors',             () => test('selectors'));
it('prefixes resolution query',      () => test('resolution'));
it('removes common mistakes',        () => test('mistakes'));
it('reads notes for prefixes',       () => test('notes'));
it('keeps vendor-specific hacks',    () => test('vendor-hack'));
it('keeps values with vendor hacks', () => test('value-hack'));
it('works with comments',            () => test('comments'));
it('uses visual cascade',            () => test('cascade'));
it('works with properties near',     () => test('double'));
it('checks prefixed in hacks',       () => test('check-down'));
it('normalize cascade after remove', () => test('uncascade'));
it('prefix decls in @supports',      () => test('supports'));
it('saves declaration style',        () => test('style'));
it('uses control comments',          () => test('disabled'));
it('has actual example in docs',     () => test('example'));

it('prefixes transition', () => {
    const input  = read('transition');
    const output = read('transition.out');
    const result = postcss([prefixer('transition')]).process(input);

    expect(result.css).toEqual(output);
    expect(result.warnings().map(i => i.toString())).toEqual([
        'autoprefixer: <css input>:23:5: Replace transition-property ' +
        'to transition, because Autoprefixer could not support any cases ' +
        'of transition-property and other transition-*'
    ]);
});

it('works with broken transition', () => {
    const input  = 'a{transition:,,}';
    const output = 'a{-webkit-transition:;-o-transition:;transition:}';
    const result = postcss([prefixer('transition')]).process(input);
    expect(result.css).toEqual(output);
});

it('should ignore spaces inside values', () => {
    const css = read('trim');
    expect(postcss([flexboxer]).process(css).css).toEqual(css);
});

it('removes unnecessary prefixes', () => {
    const processor = postcss([cleaner]);
    for ( let type of COMMONS) {
        if (type === 'gradient-fix' ) continue;
        if (type === 'cascade' ) continue;
        if (type === 'mistakes' ) continue;
        if (type === 'flex-rewrite' ) continue;
        const input  = read(type + '.out');
        const output = read(type);
        expect(processor.process(input).css).toEqual(output);
    }
});

it('does not remove unnecessary prefixes on request', () => {
    for ( let type of ['transition', 'values', 'fullscreen']) {
        const keeper = autoprefixer({ browsers: [], remove: false });
        const css    = read(type + '.out');
        expect(postcss([keeper]).process(css).css).toEqual(css);
    }
});

it('does not add prefixes on request', () => {
    for ( let type of ['transition', 'values', 'fullscreen']) {
        const remover    = autoprefixer({ browsers: ['Opera 12'], add: false });
        const unprefixed = read(type);
        expect(postcss([remover]).process(unprefixed).css).toEqual(unprefixed);
    }
});

it('prevents doubling prefixes', () => {
    for ( let type of COMMONS) {
        const processor = postcss([prefixer(type)]);
        const input  = read(type);
        const output = read(type + '.out');
        expect(processor.process(processor.process(input)).css).toEqual(output);
    }
});

it('parses difficult files', () => {
    const input  = read('syntax');
    const result = postcss([cleaner]).process(input);
    expect(result.css).toEqual(input);
});

it('marks parsing errors', () => {
    expect(() => {
        postcss([cleaner]).process('a {').css;
    }).toThrowError('<css input>:1:1: Unclosed block');
});

it('shows file name in parse error', () => {
    expect(() => {
        postcss([cleaner]).process('a {', { from: 'a.css' }).css;
    }).toThrowError(/a.css:1:1: /);
});

it('uses browserslist config', () => {
    const from   = path.join(__dirname, 'cases/config/test.css');
    const input  = read('config/test');
    const output = read('config/test.out');
    const processor = postcss([autoprefixer]);
    expect(processor.process(input, { from }).css).toEqual(output);
});

it('sets browserslist environment', () => {
    const from      = path.join(__dirname, 'cases/config/test.css');
    const input     = read('config/test');
    const output    = read('config/test.production');
    const processor = postcss([autoprefixer({ env: 'production' })]);
    expect(processor.process(input, { from }).css).toEqual(output);
});

it('works without source in nodes', () => {
    const root = postcss.root();
    root.append({ selector: 'a' });
    root.first.append({ prop: 'display', value: 'flex' });
    compiler(root);
    expect(root.toString()).toEqual(
      'a {\n    display: -webkit-flex;\n    display: flex\n}');
});

it('takes values from other PostCSS plugins', () => {
    const plugin = root => {
        root.walkDecls(i => {
            i.value = 'calc(0)';
        });
    };
    const result = postcss([plugin, compiler]).process('a{width:0/**/0}');
    expect(result.css).toEqual('a{width:-webkit-calc(0);width:calc(0)}');
});

it('has option to disable @supports support', () => {
    const css      = '@supports (cursor: grab) {}';
    const instance = autoprefixer({ browsers: ['Chrome 28'], supports: false });
    const result   = postcss([instance]).process(css);
    expect(result.css).toEqual(css);
});

it('has disabled grid options by default', () => {
    const ap = autoprefixer({ browsers: ['Edge 12', 'IE 10'] });
    const input  = read('grid');
    const output = read('grid.disabled');
    const result = postcss([ap]).process(input);
    expect(result.css).toEqual(output);
});

it('has option to disable flexbox support', () => {
    const css      = read('flexbox');
    const instance = autoprefixer({ browsers: ['IE 10'], flexbox: false });
    const result   = postcss([instance]).process(css);
    expect(result.css).toEqual(css);
});

it('has option to disable 2009 flexbox support', () => {
    const ap = autoprefixer({ browsers: ['Chrome > 19'], flexbox: 'no-2009' });
    const css    = 'a{flex:1}';
    const result = postcss([ap]).process(css);
    expect(result.css).toEqual('a{-webkit-flex:1;flex:1}');
});

it('returns inspect string', () => {
    expect(autoprefixer({ browsers: ['chrome 25'] }).info())
        .toMatch(/Browsers:\s+Chrome: 25/);
});

it('uses browserslist config in inspect', () => {
    const from = path.join(__dirname, 'cases/config');
    expect(autoprefixer().info({ from })).toMatch(/Browsers:\s+IE: 10/);
});

describe('hacks', () => {

    it('ignores prefix IE filter',      () => test('filter'));
    it('changes border image syntax',   () => test('border-image'));
    it('supports old Mozilla prefixes', () => test('border-radius'));
    it('supports all flexbox syntaxes', () => test('flexbox'));
    it('supports map flexbox props',    () => test('flex-rewrite'));
    it('supports all fullscreens',      () => test('fullscreen'));
    it('supports custom prefixes',      () => test('custom-prefix'));
    it('fixes break properties',        () => test('multicolumn'));
    it('ignores some 3D transforms',    () => test('3d-transform'));
    it('supports background-size',      () => test('background-size'));
    it('supports background-clip',      () => test('background-clip'));
    it('supports logical properties',   () => test('logical'));
    it('supports appearance',           () => test('appearance'));
    it('supports all placeholders',     () => test('placeholder'));
    it('supports image-rendering',      () => test('image-rendering'));
    it('supports border-box mask',      () => test('mask-border'));
    it('supports image-set()',          () => test('image-set'));
    it('supports writing-mode',         () => test('writing-mode'));
    it('supports cross-fade()',         () => test('cross-fade'));
    it('supports grid layout',          () => test('grid'));

    it('supports appearance for IE', () => {
        const instance = autoprefixer({ browsers: 'Edge 15' });
        const result   = postcss([instance]).process('a { appearance: none }');
        expect(result.css).toEqual(
            'a { -webkit-appearance: none; appearance: none }');
    });

    it('changes angle in gradient', () => {
        const input  = read('gradient');
        const output = read('gradient.out');
        const result = postcss([prefixer('gradient')]).process(input);

        expect(result.css).toEqual(output);
        expect(result.warnings().map(i => i.toString())).toEqual([
            'autoprefixer: <css input>:38:5: Gradient has outdated direction ' +
            'syntax. New syntax is like `to left` instead of `right`.'
        ]);
    });

    it('warns on old flexbox display', () => {
        const result = postcss([flexboxer]).process('a{ display: box; }');
        expect(result.css).toEqual('a{ display: box; }');
        expect(result.warnings().map(i => i.toString())).toEqual([
            'autoprefixer: <css input>:1:4: You should write display: flex ' +
            'by final spec instead of display: box'
        ]);
    });

    it('warns on unsupported grid features', () => {
        const css      = read('nogrid');
        const instance = autoprefixer({ browsers: ['IE 10'], grid: true });
        const result   = postcss([instance]).process(css);
        expect(result.warnings().map(i => i.toString())).toEqual([
            'autoprefixer: <css input>:2:5: IE supports only grid-row-end ' +
            'with span. You should add grid: false option to Autoprefixer ' +
            'and use some JS grid polyfill for full spec support',
            'autoprefixer: <css input>:3:5: IE supports only grid-row ' +
            'with / and span. You should add grid: false option to ' +
            'Autoprefixer and use some JS grid polyfill for full spec support'
        ]);
    });

    it('does not warns on unsupported grid on disabled grid', () => {
        const css      = read('nogrid');
        const instance = autoprefixer({ browsers: ['IE 10'], flexbox: false });
        const result   = postcss([instance]).process(css);
        expect(result.warnings().length).toEqual(0);
    });

    it('supports intrinsic sizing', () => {
        const input  = read('intrinsic');
        const output = read('intrinsic.out');
        const result = postcss([prefixer('intrinsic')]).process(input);

        expect(result.css).toEqual(output);
        expect(result.warnings().map(i => i.toString())).toEqual([
            'autoprefixer: <css input>:15:5: Replace fill to stretch, ' +
            'because spec had been changed',
            'autoprefixer: <css input>:19:5: Replace fill-available ' +
            'to stretch, because spec had been changed'
        ]);
    });

    it('supports text-emphasis', () => {
        const input    = read('text-emphasis-position');
        const output   = read('text-emphasis-position.out');
        const instance = prefixer('text-emphasis-position');
        const result   = postcss([instance]).process(input);

        expect(result.css).toEqual(output);
        expect(result.warnings().map(i => i.toString())).toEqual([
            'autoprefixer: <css input>:14:5: You should use 2 values ' +
            'for text-emphasis-position For example, `under left` ' +
            'instead of just `under`.'
        ]);
    });

    it('ignores values for CSS3PIE props', () => {
        const css = read('pie');
        expect(postcss([compiler]).process(css).css).toEqual(css);
    });

    it('add prefix for backface-visibility for Safari 9', () => {
        const input = 'a{ ' +
                      'backface-visibility: hidden; ' +
                      'transform-style: preserve-3d }';
        const ap = autoprefixer({ browsers: ['Safari 9'], flexbox: false });
        expect(postcss([ap]).process(input).css).toEqual(
            'a{ ' +
            '-webkit-backface-visibility: hidden; ' +
            'backface-visibility: hidden; ' +
            'transform-style: preserve-3d }'
        );
    });

});
