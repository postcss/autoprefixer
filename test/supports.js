const Prefixes = require('../lib/prefixes');
const Browsers = require('../lib/browsers');
const Supports = require('../lib/supports');
const brackets = require('../lib/brackets');

const data = {
    browsers: {
        firefox: {
            prefix:   'moz',
            versions: ['firefox 22']
        }
    },
    prefixes: {
        a: {
            browsers: ['firefox 22']
        },
        b: {
            browsers: ['firefox 22'],
            props: 'c'
        }
    }
};

describe('Supports', () => {

    before(function () {
        const browsers  = new Browsers(data.browsers, [
            'firefox 22', 'firefox 21'
        ]);
        const prefixes  = new Prefixes(data.prefixes, browsers);
        this.supports = new Supports(Prefixes, prefixes);
    });

    describe('parse()', () => {

        it('splits property name and value', function () {
            this.supports.parse('color:black').should.eql(['color', 'black']);
        });

        it('cleans spaces', function () {
            this.supports.parse(' color : black ')
                .should.eql(['color', 'black']);
        });

        it('parses everything', function () {
            this.supports.parse('color').should.eql(['color', '']);
        });

    });

    describe('virtual()', () => {

        it('returns virtual rule', function () {
            const decl = this.supports.virtual('color: black');
            decl.type.should.eql('rule');
            decl.toString().should.eql('a{color: black}');
        });

        it('works with broken CSS', function () {
            const decl = this.supports.virtual('color black');
            decl.type.should.eql('rule');
        });

    });

    describe('prefixed()', () => {

        it('returns decls with prefixed property', function () {
            const decls = this.supports.prefixed('a: one');

            decls.length.should.eql(2);
            decls[0].toString().should.eql('-moz-a: one');
            decls[1].toString().should.eql('a: one');
        });

        it('returns decls with prefixed value', function () {
            const decls = this.supports.prefixed('c: b');

            decls.length.should.eql(2);
            decls[0].toString().should.eql('c: -moz-b');
            decls[1].toString().should.eql('c: b');
        });

    });

    describe('normalize()', () => {

        it('reduces empty string', function () {
            this.supports.normalize([['', ['a'], '']]).should.eql([[['a']]]);
        });

        it('reduces declaration to string', function () {
            this.supports.normalize(['a: b', ['1']]).should.eql(['a: b(1)']);
        });

        it('reduces wrapped declaration to string', function () {
            this.supports.normalize(['', ['a: b', ['1']], ''])
                .should.eql([['a: b(1)']]);
        });
    });

    describe('remove()', () => {

        before(function () {
            this.rm = function (str) {
                const ast = this.supports.normalize(brackets.parse(str));
                return brackets.stringify(this.supports.remove(ast, str));
            };
        });

        it('remove prefixed properties', function () {
            this.rm('(-moz-a: 1) or (a: 1)').should.eql('(a: 1)');
        });

        it('remove prefixed properties inside', function () {
            this.rm('(((-moz-a: 1) or (a: 1)))').should.eql('(((a: 1)))');
        });

        it('remove prefixed values', function () {
            this.rm('(c: -moz-b) or (c: -b-)').should.eql('(c: -b-)');
        });

        it('keeps and-conditions', function () {
            this.rm('(-moz-a: 1) and (a: 1)')
                .should.eql('(-moz-a: 1) and (a: 1)');
        });

        it('keeps not-conditions', function () {
            this.rm('not (-moz-a: 1) or (a: 1)')
                .should.eql('not (-moz-a: 1) or (a: 1)');
        });

        return it('keeps hacks', function () {
            this.rm('(-moz-a: 1) or (b: 2)')
                .should.eql('(-moz-a: 1) or (b: 2)');
        });

    });

    describe('prefixer()', () => {

        it('uses only browsers with @supports support', function () {
            this.supports.prefixer().browsers.selected
                .should.eql(['firefox 22']);
        });

    });

    describe('cleanBrackets()', () => {

        before(function () {
            this.clean = function (str) {
                const ast = this.supports.normalize(brackets.parse(str));
                return brackets.stringify(this.supports.cleanBrackets(ast));
            };
        });

        it('normalize brackets', function () {
            this.clean('((a: 1))').should.eql('(a: 1)');
        });

        it('normalize brackets recursively', function () {
            this.clean('(((a: 1) or ((b: 2))))')
                .should.eql('((a: 1) or (b: 2))');
        });

    });

    describe('process()', () => {

        it('adds params with prefixed value', function () {
            const rule = { params: '(c: b)' };
            this.supports.process(rule);
            rule.params.should.eql('((c: -moz-b) or (c: b))');
        });

        it('adds params with prefixed function', function () {
            const rule = { params: '(c: b(1))' };
            this.supports.process(rule);
            rule.params.should.eql('((c: -moz-b(1)) or (c: b(1)))');
        });

        it('replaces params with prefixed property', function () {
            const rule = { params: '(color black) and not (a: 1)' };
            this.supports.process(rule);
            rule.params
                .should.eql('(color black) and not ((-moz-a: 1) or (a: 1))');
        });

    });

});
