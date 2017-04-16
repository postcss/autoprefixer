const Selector = require('../lib/selector');
const parse    = require('postcss/lib/parse');

const selector = new Selector('::selection', ['-moz-', '-ms-']);
const old = selector.old('-moz-');

describe('isHack()', () => {

    it('returns true on last rule', () => {
        const css = parse('::selection {} ::-moz-selection {}');
        expect(old.isHack(css.last)).toBeTruthy();
    });

    it('stops on another type', () => {
        const css = parse('::-moz-selection {} ' +
                          '@keyframes anim {} ::selection {}');
        expect(old.isHack(css.first)).toBeTruthy();
    });

    it('stops on another selector', () => {
        const css = parse('::-moz-selection {} a {} ::selection {}');
        expect(old.isHack(css.first)).toBeTruthy();
    });

    it('finds unprefixed selector', () => {
        const css = parse('::-moz-selection {} ' +
                          '::-o-selection {} ::selection {}');
        expect(old.isHack(css.first)).toBeFalsy();
    });

});

describe('check()', () => {

    it('finds old selector', () => {
        const css = parse('body::-moz-selection {} body::selection {}');
        expect(old.check(css.first)).toBeTruthy();
    });

    it('finds right', () => {
        const css = parse('body:::-moz-selection {}');
        expect(old.check(css.first)).toBeFalsy();
    });

});
