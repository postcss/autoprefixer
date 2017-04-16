const Declaration = require('../lib/declaration');
const Prefixes    = require('../lib/prefixes');
const parse       = require('postcss/lib/parse');

let prefixes, tabsize;
beforeEach(() => {
    prefixes = new Prefixes({ }, { });
    tabsize  = new Declaration('tab-size', ['-moz-', '-ms-'], prefixes);
});

describe('otherPrefixes()', () => {

    it('checks values for other prefixes', () => {
        expect(tabsize.otherPrefixes('black', '-moz-')).toBeFalsy();
        expect(tabsize.otherPrefixes('-moz-black', '-moz-')).toBeFalsy();
        expect(tabsize.otherPrefixes('-dev-black', '-moz-')).toBeFalsy();
        expect(tabsize.otherPrefixes('-ms-black',  '-moz-')).toBeTruthy();
    });

});

describe('needCascade()', () => {

    afterAll(() => {
        delete prefixes.options.cascade;
    });

    it('returns true by default', () => {
        const css = parse('a {\n  tab-size: 4 }');
        expect(tabsize.needCascade(css.first.first)).toBeTruthy();
    });

    it('return false is disabled', () => {
        prefixes.options.cascade = false;
        const css = parse('a {\n  tab-size: 4 }');
        expect(tabsize.needCascade(css.first.first)).toBeFalsy();
    });

    it('returns false on declarations in one line', () => {
        const css = parse('a { tab-size: 4 } a {\n  tab-size: 4 }');
        expect(tabsize.needCascade(css.first.first)).toBeFalsy();
        expect(tabsize.needCascade(css.last.first)).toBeTruthy();
    });
});

describe('maxPrefixed()', () => {

    it('returns max prefix length', () => {
        const decl = parse('a { tab-size: 4 }').first.first;
        const list = ['-webkit-', '-webkit- old', '-moz-'];
        expect(tabsize.maxPrefixed(list, decl)).toEqual(8);
    });

});

describe('calcBefore()', () => {

    it('returns before with cascade', () => {
        const decl = parse('a { tab-size: 4 }').first.first;
        const list = ['-webkit-', '-moz- old', '-moz-'];
        expect(tabsize.calcBefore(list, decl, '-moz- old')).toEqual('    ');
    });

});

describe('restoreBefore()', () => {

    it('removes cascade', () => {
        const css  = parse('a {\n' +
                           '  -moz-tab-size: 4;\n' +
                           '       tab-size: 4 }');
        const decl = css.first.nodes[1];
        tabsize.restoreBefore(decl);
        expect(decl.raws.before).toEqual('\n  ');
    });

});

describe('prefixed()', () => {

    it('returns prefixed property', () => {
        const css  = parse('a { tab-size: 2 }');
        const decl = css.first.first;
        expect(tabsize.prefixed(decl.prop, '-moz-')).toEqual('-moz-tab-size');
    });

});

describe('normalize()', () => {

    it('returns property name by specification', () => {
        expect(tabsize.normalize('tab-size')).toEqual('tab-size');
    });

});

describe('process()', () => {

    it('adds prefixes', () => {
        const css = parse('a { -moz-tab-size: 2; tab-size: 2 }');
        tabsize.process(css.first.nodes[1]);
        expect(css.toString()).toEqual(
            'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }');
    });

    it('checks parents prefix', () => {
        const css = parse('::-moz-selection a { tab-size: 2 }');
        tabsize.process(css.first.first);
        expect(css.toString()).toEqual(
            '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }');
    });

    it('checks value for prefixes', () => {
        const css = parse('a { tab-size: -ms-calc(2) }');
        tabsize.process(css.first.first);
        expect(css.toString()).toEqual(
            'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }');
    });
});

describe('old()', () => {

    it('returns list of prefixeds', () => {
        expect(tabsize.old('tab-size', '-moz-')).toEqual(['-moz-tab-size']);
    });

});
