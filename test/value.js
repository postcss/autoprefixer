const OldValue = require('../lib/old-value');
const Value    = require('../lib//value');
const parse    = require('postcss/lib/parse');

const Prefixes = require('../lib/prefixes');
const prefixes = new Prefixes();

describe('Value', () => {

    beforeEach(function () {
        return this.calc = new Value('calc', ['-moz-', '-ms-']);
    });

    describe('.save()', () => {

        it('clones declaration', () => {
            const css   = parse('a { prop: v }');
            const width = css.first.first;

            width._autoprefixerValues = { '-ms-': '-ms-v' };
            Value.save(prefixes, width);

            return css.toString().should.eql('a { prop: -ms-v; prop: v }');
        });

        it('updates declaration with prefix', () => {
            const css   = parse('a { -ms-prop: v }');
            const width = css.first.first;

            width._autoprefixerValues = { '-ms-': '-ms-v' };
            Value.save(prefixes, width);

            return css.toString().should.eql('a { -ms-prop: -ms-v }');
        });

        it('ignores on another prefix property', () => {
            const css   = parse('a { -ms-prop: v; prop: v }');
            const width = css.first.last;

            width._autoprefixerValues = { '-ms-': '-ms-v' };
            Value.save(prefixes, width);

            return css.toString().should.eql('a { -ms-prop: v; prop: v }');
        });

        return it('ignores prefixes without changes', () => {
            const css   = parse('a { prop: v }');
            const width = css.first.first;

            width._autoprefixerValues = { '-ms-': 'v' };
            Value.save(prefixes, width);

            return css.toString().should.eql('a { prop: v }');
        });
    });

    describe('check()', () =>

    it('checks value in string', function () {
        const css = parse('a { 0: calc(1px + 1em); ' +
                      '1: 1px calc(1px + 1em); ' +
                      '2: (calc(1px + 1em)); ' +
                      '3: -ms-calc; ' +
                      '4: calced; }');

        this.calc.check(css.first.nodes[0]).should.be.true;
        this.calc.check(css.first.nodes[1]).should.be.true;
        this.calc.check(css.first.nodes[2]).should.be.true;

        this.calc.check(css.first.nodes[3]).should.be.false;
        return this.calc.check(css.first.nodes[4]).should.be.false;
    })
  );

    describe('old()', () =>

    it('check prefixed value', function () {
        return this.calc.old('-ms-').should.eql(new OldValue('calc', '-ms-calc'));
    })
  );

    describe('replace()', () =>

    it('adds prefix to value', function () {
        this.calc.replace('1px calc(1em)', '-ms-').should.eql('1px -ms-calc(1em)');
        return this.calc.replace('1px,calc(1em)', '-ms-').should.eql('1px,-ms-calc(1em)');
    })
  );

    return describe('process()', () => {

        it('adds prefixes', function () {
            const css   = parse('a { width: calc(1em) calc(1%) }');
            const width = css.first.first;

            this.calc.process(width);
            return width._autoprefixerValues.should.eql({
                '-moz-': '-moz-calc(1em) -moz-calc(1%)',
                '-ms-':   '-ms-calc(1em) -ms-calc(1%)'
            });
        });

        it('checks parents prefix', function () {
            const css   = parse('::-moz-fullscreen a { width: calc(1%) }');
            const width = css.first.first;

            this.calc.process(width);
            return width._autoprefixerValues.should.eql({
                '-moz-': '-moz-calc(1%)' });
        });

        return it('checks property prefix', function () {
            const css   = parse('a { -moz-width: calc(1%); -o-width: calc(1%) }');
            const decls = css.first.nodes;

            this.calc.process(decls[0]);
            decls[0]._autoprefixerValues.should.eql({
                '-moz-': '-moz-calc(1%)' });

            this.calc.process(decls[1]);
            return (decls[1]._autoprefixerValues === undefined).should.be.true;
        });
    });
});
