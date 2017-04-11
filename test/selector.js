const Selector = require('../lib/selector');
const parse    = require('postcss/lib/parse');

describe('Selector', () => {
    beforeEach(function () {
        return this.selector = new Selector('::selection', ['-moz-', '-ms-']);
    });

    describe('prefixed()', () =>

    it('adds prefix after non-letters symbols', function () {
        return this.selector.prefixed('-moz-').should.eql('::-moz-selection');
    })
  );

    describe('regexp()', () => {

        it('creates regexp for prefix', function () {
            const regexp = this.selector.regexp('-moz-');
            regexp.test('::-moz-selection').should.be.true;
            return regexp.test('::selection').should.be.false;
        });

        return it('creates regexp without prefix', function () {
            const regexp = this.selector.regexp();
            regexp.test('::-moz-selection').should.be.false;
            return regexp.test('::selection').should.be.true;
        });
    });

    describe('check()', () =>

    it('shecks rule selectors', function () {
        const css = parse('body .selection {}, :::selection {}, body ::selection {}');
        this.selector.check(css.nodes[0]).should.be.false;
        this.selector.check(css.nodes[1]).should.be.false;
        return this.selector.check(css.nodes[2]).should.be.true;
    })
  );

    describe('prefixeds()', () =>

    it('returns all avaiable prefixed selectors', function () {
        const css = parse('::selection {}');
        return this.selector.prefixeds(css.first).should.eql({
            '-webkit-': '::-webkit-selection',
            '-moz-':    '::-moz-selection',
            '-ms-':     '::-ms-selection',
            '-o-':      '::-o-selection' });
    })
  );

    describe('already()', () => {
        beforeEach(function () {
            const css        = parse('::selection {}');
            return this.prefixeds = this.selector.prefixeds(css.first);
        });

        it('returns false on first element', function () {
            const css = parse('::selection {}');
            return this.selector.already(css.first, this.prefixeds, '-moz-').should.be.false;
        });

        it('stops on another type', function () {
            const css = parse('::-moz-selection {} @keyframes anim {} ::selection {}');
            return this.selector.already(css.nodes[2], this.prefixeds, '-moz-').should.be.false;
        });

        it('stops on another selector', function () {
            const css = parse('::-moz-selection {} a {} ::selection {}');
            return this.selector.already(css.nodes[2], this.prefixeds, '-moz-').should.be.false;
        });

        return it('finds prefixed even if unknown prefix is between', function () {
            const css = parse('::-moz-selection {} ::-o-selection {} ::selection {}');
            return this.selector.already(css.nodes[2], this.prefixeds, '-moz-').should.be.true;
        });
    });

    describe('replace()', () =>

    it('should add prefix to selectors', function () {
        return this.selector.replace('body ::selection, input::selection, a', '-ms-')
        .should.eql('body ::-ms-selection, input::-ms-selection, a');
    })
  );

    describe('process()', () => {

        it('adds prefixes', function () {
            const css = parse('b ::-moz-selection{} b ::selection{}');
            this.selector.process(css.nodes[1]);
            return css.toString().should.eql(
        'b ::-moz-selection{} b ::-ms-selection{} b ::selection{}');
        });

        return it('checks parents prefix', function () {
            const css = parse('@-moz-page{ ::selection{} }');
            this.selector.process(css.first.first);
            return css.toString().should.eql(
        '@-moz-page{ ::-moz-selection{} ::selection{} }');
        });
    });

    return describe('old()', () =>

    it('returns object to find old selector', function () {
        const old = this.selector.old('-moz-');
        old.unprefixed.should.eql('::selection');
        return old.prefix.should.eql('-moz-');
    })
  );
});
