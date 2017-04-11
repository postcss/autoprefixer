const Prefixer = require('../lib/prefixer');
const parse    = require('postcss/lib/parse');

describe('Prefixer', () => {

    beforeEach(function () {
        this.prefix = new Prefixer();
        this.css = parse('@-ms-keyframes a { to { } } ' +
                         ':-moz-full-screen { } a { } ' +
                         '@-dev-keyframes s { to { } }');
    });

    describe('.hack()', () => {

        it('registers hacks for subclasses', () => {
            class A extends Prefixer {}
            class Hack extends A {
                static names = ['a', 'b'];
            }

            A.hack(Hack);

            A.hacks.should.eql({ a: Hack, b: Hack });
            (Prefixer.hacks === undefined).should.be.true;
        });

    });

    describe('.load()', () => {

        it('loads hacks', () => {
            class A extends Prefixer {
                klass = 'a';
            }

            class Hack extends A {
                klass = 'hack';
            }

            A.hacks = { hacked: Hack };

            A.load('hacked').klass.should.eql('hack');
            A.load('a').klass.should.eql('a');
        });

    });

    describe('.clone()', () => {

        it('cleans custom properties', function () {
            const rule = this.css.first.first;
            rule._autoprefixerPrefix = '-ms-';
            rule._autoprefixerValues = { '-ms-': 1 };

            const cloned = Prefixer.clone(rule, { selector: 'from' });
            cloned.selector.should.eql('from');

            (cloned._autoprefixerPrefix === undefined).should.be.true;
            (cloned._autoprefixerValues === undefined).should.be.true;
        });

        it('fixed declaration between', () => {
            const css = parse('a { color : black }');
            const cloned = Prefixer.clone(css.first.first);
            cloned.raws.between.should.eql(' : ');
        });
    });

    describe('parentPrefix', () => {

        it('works with root node', function () {
            this.prefix.parentPrefix(this.css).should.be.false;
        });

        it('finds in at-rules', function () {
            this.prefix.parentPrefix(this.css.first).should.eql('-ms-');
        });

        it('finds in selectors', function () {
            this.prefix.parentPrefix(this.css.nodes[1]).should.eql('-moz-');
        });

        it('finds in parents', function () {
            this.prefix.parentPrefix(this.css.first.first).should.eql('-ms-');
            this.prefix.parentPrefix(this.css.nodes[2]).should.be.false;
        });

        it('caches prefix', function () {
            this.prefix.parentPrefix(this.css.first);
            this.css.first._autoprefixerPrefix.should.eql('-ms-');

            this.css.first._autoprefixerPrefix = false;
            this.prefix.parentPrefix(this.css.first).should.be.false;
        });

        it('finds only browsers prefixes', function () {
            this.prefix.parentPrefix(this.css.nodes[2]).should.be.false;
        });

        it('works with selector contained --', function () {
            const css = parse(':--a { color: black }');
            this.prefix.parentPrefix(css.first.first).should.be.false;
        });
    });
});
