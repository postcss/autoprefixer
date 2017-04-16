const Selector = require('../lib/selector');
const parse    = require('postcss/lib/parse');

describe('OldSelector', () => {

    beforeEach(function () {
        const selector = new Selector('::selection', ['-moz-', '-ms-']);
        this.old = selector.old('-moz-');
    });

    describe('isHack()', () => {

        it('returns true on last rule', function () {
            const css = parse('::selection {} ::-moz-selection {}');
            expect(this.old.isHack(css.last)).toBeTruthy();
        });

        it('stops on another type', function () {
            const css = parse('::-moz-selection {} ' +
                '@keyframes anim {} ::selection {}');
            expect(this.old.isHack(css.first)).toBeTruthy();
        });

        it('stops on another selector', function () {
            const css = parse('::-moz-selection {} a {} ::selection {}');
            expect(this.old.isHack(css.first)).toBeTruthy();
        });

        it('finds unprefixed selector', function () {
            const css = parse('::-moz-selection {} ' +
                '::-o-selection {} ::selection {}');
            expect(this.old.isHack(css.first)).toBeFalsy();
        });

    });

    describe('check()', () => {

        it('finds old selector', function () {
            const css = parse('body::-moz-selection {} body::selection {}');
            expect(this.old.check(css.first)).toBeTruthy();
        });

        it('finds right', function () {
            const css = parse('body:::-moz-selection {}');
            expect(this.old.check(css.first)).toBeFalsy();
        });

    });

});
