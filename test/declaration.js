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
            this.tabsize.otherPrefixes('black', '-moz-').should.be.false;
            this.tabsize.otherPrefixes('-moz-black', '-moz-').should.be.false;
            this.tabsize.otherPrefixes('-dev-black', '-moz-').should.be.false;
            this.tabsize.otherPrefixes('-ms-black',  '-moz-').should.be.true;
        });

    });

    describe('needCascade()', () => {

        after(function () {
            delete this.prefixes.options.cascade;
        });

        it('returns true by default', function () {
            const css = parse('a {\n  tab-size: 4 }');
            this.tabsize.needCascade(css.first.first).should.be.true;
        });

        it('return false is disabled', function () {
            this.prefixes.options.cascade = false;
            const css = parse('a {\n  tab-size: 4 }');
            this.tabsize.needCascade(css.first.first).should.be.false;
        });

        it('returns false on declarations in one line', function () {
            const css = parse('a { tab-size: 4 } a {\n  tab-size: 4 }');
            this.tabsize.needCascade(css.first.first).should.be.false;
            this.tabsize.needCascade(css.last.first).should.be.true;
        });
    });

    describe('maxPrefixed()', () => {

        it('returns max prefix length', function () {
            const decl     = parse('a { tab-size: 4 }').first.first;
            const prefixes = ['-webkit-', '-webkit- old', '-moz-'];
            this.tabsize.maxPrefixed(prefixes, decl).should.eql(8);
        });

    });

    describe('calcBefore()', () => {

        it('returns before with cascade', function () {
            const decl     = parse('a { tab-size: 4 }').first.first;
            const prefixes = ['-webkit-', '-moz- old', '-moz-'];
            this.tabsize.calcBefore(prefixes, decl, '-moz- old')
                .should.eql('    ');
        });

    });

    describe('restoreBefore()', () => {

        it('removes cascade', function () {
            const css  = parse('a {\n' +
                               '  -moz-tab-size: 4;\n' +
                               '       tab-size: 4 }');
            const decl = css.first.nodes[1];
            this.tabsize.restoreBefore(decl);
            decl.raws.before.should.eql('\n  ');
        });

    });

    describe('prefixed()', () => {

        it('returns prefixed property', function () {
            const css  = parse('a { tab-size: 2 }');
            const decl = css.first.first;
            this.tabsize.prefixed(decl.prop, '-moz-')
                .should.eql('-moz-tab-size');
        });

    });

    describe('normalize()', () => {

        it('returns property name by specification', function () {
            this.tabsize.normalize('tab-size').should.eql('tab-size');
        });

    });

    describe('process()', () => {

        it('adds prefixes', function () {
            const css = parse('a { -moz-tab-size: 2; tab-size: 2 }');
            this.tabsize.process(css.first.nodes[1]);
            css.toString().should.eql(
                'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }');
        });

        it('checks parents prefix', function () {
            const css = parse('::-moz-selection a { tab-size: 2 }');
            this.tabsize.process(css.first.first);
            css.toString().should.eql(
                '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }');
        });

        it('checks value for prefixes', function () {
            const css = parse('a { tab-size: -ms-calc(2) }');
            this.tabsize.process(css.first.first);
            css.toString().should.eql(
                'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }');
        });
    });

    describe('old()', () => {

        it('returns list of prefixeds', function () {
            this.tabsize.old('tab-size', '-moz-').should.eql(['-moz-tab-size']);
        });

    });

});
