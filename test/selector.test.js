const Selector = require('../lib/selector');
const parse    = require('postcss/lib/parse');

describe('Selector', () => {

    beforeEach(function () {
        this.selector = new Selector('::selection', ['-moz-', '-ms-']);
    });

    describe('prefixed()', () => {

        it('adds prefix after non-letters symbols', function () {
            expect(this.selector.prefixed('-moz-')).toEqual('::-moz-selection');
        });

    });

    describe('regexp()', () => {

        it('creates regexp for prefix', function () {
            const regexp = this.selector.regexp('-moz-');
            expect(regexp.test('::-moz-selection')).toBeTruthy();
            expect(regexp.test('::selection')).toBeFalsy();
        });

        it('creates regexp without prefix', function () {
            const regexp = this.selector.regexp();
            expect(regexp.test('::-moz-selection')).toBeFalsy();
            expect(regexp.test('::selection')).toBeTruthy();
        });
    });

    describe('check()', () => {

        it('shecks rule selectors', function () {
            const css = parse('body .selection {}, ' +
                ':::selection {}, body ::selection {}');
            expect(this.selector.check(css.nodes[0])).toBeFalsy();
            expect(this.selector.check(css.nodes[1])).toBeFalsy();
            expect(this.selector.check(css.nodes[2])).toBeTruthy();
        });

    });

    describe('prefixeds()', () => {

        it('returns all avaiable prefixed selectors', function () {
            const css = parse('::selection {}');
            expect(this.selector.prefixeds(css.first)).toEqual({
                '-webkit-': '::-webkit-selection',
                '-moz-':    '::-moz-selection',
                '-ms-':     '::-ms-selection',
                '-o-':      '::-o-selection' });
        });

    });

    describe('already()', () => {

        beforeEach(function () {
            const css = parse('::selection {}');
            this.prefixeds = this.selector.prefixeds(css.first);
        });

        it('returns false on first element', function () {
            const css = parse('::selection {}');
            expect(this.selector.already(css.first, this.prefixeds, '-moz-'))
                .toBeFalsy();
        });

        it('stops on another type', function () {
            const css = parse('::-moz-selection {} ' +
                '@keyframes anim {} ::selection {}');
            expect(this.selector.already(css.nodes[2], this.prefixeds, '-moz-'))
                .toBeFalsy();
        });

        it('stops on another selector', function () {
            const css = parse('::-moz-selection {} a {} ::selection {}');
            expect(this.selector.already(css.nodes[2], this.prefixeds, '-moz-'))
                .toBeFalsy();
        });

        it('finds prefixed even if unknown prefix is between', function () {
            const css = parse('::-moz-selection {} ' +
                '::-o-selection {} ::selection {}');
            expect(this.selector.already(css.nodes[2], this.prefixeds, '-moz-'))
                .toBeTruthy();
        });
    });

    describe('replace()', () => {

        it('adds prefix to selectors', function () {
            expect(this.selector
                .replace('body ::selection, input::selection, a', '-ms-')
            ).toEqual('body ::-ms-selection, input::-ms-selection, a');
        });

    });

    describe('process()', () => {

        it('adds prefixes', function () {
            const css = parse('b ::-moz-selection{} b ::selection{}');
            this.selector.process(css.nodes[1]);
            expect(css.toString()).toEqual(
                'b ::-moz-selection{} b ::-ms-selection{} b ::selection{}');
        });

        it('checks parents prefix', function () {
            const css = parse('@-moz-page{ ::selection{} }');
            this.selector.process(css.first.first);
            expect(css.toString()).toEqual(
                '@-moz-page{ ::-moz-selection{} ::selection{} }');
        });

    });

    describe('old()', () => {

        it('returns object to find old selector', function () {
            const old = this.selector.old('-moz-');
            expect(old.unprefixed).toEqual('::selection');
            expect(old.prefix).toEqual('-moz-');
        });

    });

});
