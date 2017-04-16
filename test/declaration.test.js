const Declaration = require('../lib/declaration');
const Prefixes    = require('../lib/prefixes');
const parse       = require('postcss/lib/parse');

describe('Declaration', () => {

    beforeEach(function () {
        this.prefixes = new Prefixes({ }, { });
        this.tabsize  = new Declaration(
            'tab-size', ['-moz-', '-ms-'], this.prefixes);
    });

    describe('otherPrefixes()', () => {

        it('checks values for other prefixes', function () {
            expect(this.tabsize.otherPrefixes('black', '-moz-'))
                .toBeFalsy();
            expect(this.tabsize.otherPrefixes('-moz-black', '-moz-'))
                .toBeFalsy();
            expect(this.tabsize.otherPrefixes('-dev-black', '-moz-'))
                .toBeFalsy();
            expect(this.tabsize.otherPrefixes('-ms-black',  '-moz-'))
                .toBeTruthy();
        });

    });

    describe('needCascade()', () => {

        afterAll(function () {
            delete this.prefixes.options.cascade;
        });

        it('returns true by default', function () {
            const css = parse('a {\n  tab-size: 4 }');
            expect(this.tabsize.needCascade(css.first.first)).toBeTruthy();
        });

        it('return false is disabled', function () {
            this.prefixes.options.cascade = false;
            const css = parse('a {\n  tab-size: 4 }');
            expect(this.tabsize.needCascade(css.first.first)).toBeFalsy();
        });

        it('returns false on declarations in one line', function () {
            const css = parse('a { tab-size: 4 } a {\n  tab-size: 4 }');
            expect(this.tabsize.needCascade(css.first.first)).toBeFalsy();
            expect(this.tabsize.needCascade(css.last.first)).toBeTruthy();
        });
    });

    describe('maxPrefixed()', () => {

        it('returns max prefix length', function () {
            const decl     = parse('a { tab-size: 4 }').first.first;
            const prefixes = ['-webkit-', '-webkit- old', '-moz-'];
            expect(this.tabsize.maxPrefixed(prefixes, decl)).toEqual(8);
        });

    });

    describe('calcBefore()', () => {

        it('returns before with cascade', function () {
            const decl     = parse('a { tab-size: 4 }').first.first;
            const prefixes = ['-webkit-', '-moz- old', '-moz-'];
            expect(this.tabsize.calcBefore(prefixes, decl, '-moz- old'))
                .toEqual('    ');
        });

    });

    describe('restoreBefore()', () => {

        it('removes cascade', function () {
            const css  = parse('a {\n' +
                               '  -moz-tab-size: 4;\n' +
                               '       tab-size: 4 }');
            const decl = css.first.nodes[1];
            this.tabsize.restoreBefore(decl);
            expect(decl.raws.before).toEqual('\n  ');
        });

    });

    describe('prefixed()', () => {

        it('returns prefixed property', function () {
            const css  = parse('a { tab-size: 2 }');
            const decl = css.first.first;
            expect(this.tabsize.prefixed(decl.prop, '-moz-'))
                .toEqual('-moz-tab-size');
        });

    });

    describe('normalize()', () => {

        it('returns property name by specification', function () {
            expect(this.tabsize.normalize('tab-size')).toEqual('tab-size');
        });

    });

    describe('process()', () => {

        it('adds prefixes', function () {
            const css = parse('a { -moz-tab-size: 2; tab-size: 2 }');
            this.tabsize.process(css.first.nodes[1]);
            expect(css.toString()).toEqual(
                'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }');
        });

        it('checks parents prefix', function () {
            const css = parse('::-moz-selection a { tab-size: 2 }');
            this.tabsize.process(css.first.first);
            expect(css.toString()).toEqual(
                '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }');
        });

        it('checks value for prefixes', function () {
            const css = parse('a { tab-size: -ms-calc(2) }');
            this.tabsize.process(css.first.first);
            expect(css.toString()).toEqual(
                'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }');
        });
    });

    describe('old()', () => {

        it('returns list of prefixeds', function () {
            expect(this.tabsize.old('tab-size', '-moz-'))
                .toEqual(['-moz-tab-size']);
        });

    });

});
