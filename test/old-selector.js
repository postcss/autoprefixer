const OldSelector = require('../lib/old-selector');
const Selector    = require('../lib/selector');
const parse       = require('postcss/lib/parse');

describe('OldSelector', () => {
    beforeEach(function () {
        const selector = new Selector('::selection', ['-moz-', '-ms-']);
        return this.old     = selector.old('-moz-');
    });

    describe('isHack()', () => {

        it('returns true on last rule', function () {
            const css = parse('::selection {} ::-moz-selection {}');
            return this.old.isHack(css.last).should.be.true;
        });

        it('stops on another type', function () {
            const css = parse('::-moz-selection {} @keyframes anim {} ::selection {}');
            return this.old.isHack(css.first).should.be.true;
        });

        it('stops on another selector', function () {
            const css = parse('::-moz-selection {} a {} ::selection {}');
            return this.old.isHack(css.first).should.be.true;
        });

        return it('finds unprefixed selector', function () {
            const css = parse('::-moz-selection {} ::-o-selection {} ::selection {}');
            return this.old.isHack(css.first).should.be.false;
        });
    });

    return describe('check()', () => {

        it('finds old selector', function () {
            const css = parse('body::-moz-selection {} body::selection {}');
            return this.old.check(css.first).should.be.true;
        });

        return it('finds right', function () {
            const css = parse('body:::-moz-selection {}');
            return this.old.check(css.first).should.be.false;
        });
    });
});
