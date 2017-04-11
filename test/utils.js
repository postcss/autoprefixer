const utils = require('../lib/utils');

describe('utils', () => {

    describe('.error()', () => {

        it('raises an error', () => ( () => utils.error('A')).should.throw('A'));

        return it('marks an error', () => {
            let error = null;
            try {
                utils.error('A');
            } catch (e) {
                error = e;
            }

            return error.autoprefixer.should.be.true;
        });
    });

    describe('.uniq()', () =>

    it('filters doubles in array', () => utils.uniq(['1', '1', '2', '3', '3']).should.eql(['1', '2', '3']))
);

    describe('.removeNote()', () =>

    it('removes note', () => {
        utils.removeNote('-webkit- note').should.eql('-webkit-');
        return utils.removeNote('-webkit-').should.eql('-webkit-');
    })
  );

    describe('.escapeRegexp()', () =>

    it('escapes RegExp symbols', () => {
        const string = utils.escapeRegexp('^[()\\]');
        return string.should.eql('\\^\\[\\(\\)\\\\\\]');
    })
  );

    describe('.regexp()', () => {

        it('generates RegExp that finds tokens in CSS values', () => {
            const regexp = utils.regexp('foo');
            const test   = string => string.match(regexp) !== null;

            test('foo').should.be.ok;
            test('Foo').should.be.ok;
            test('one, foo, two').should.be.ok;
            test('one(),foo(),two()').should.be.ok;

            'foo(), a, foo'.replace(regexp, '$1b$2').should.eql('bfoo(), a, bfoo');

            test('foob').should.be.false;
            test('(foo)').should.be.false;
            return test('-a-foo').should.be.false;
        });

        return it('escapes string if needed', () => {
            let regexp = utils.regexp('(a|b)');
            const test   = string => string.match(regexp) !== null;

            test('a').should.be.false;
            test('(a|b)').should.be.ok;

            regexp = utils.regexp('(a|b)', false);
            test('a').should.be.ok;
            return test('b').should.be.ok;
        });
    });

    return describe('.editList()', () => {

        it('does save without changes', () => {
            const list = utils.editList('a,\nb, c', (parsed, edit) => parsed);
            return list.should.eql('a,\nb, c');
        });

        it('changes list', () => {
            const list = utils.editList('a, b', (parsed, edit) => {
                parsed.should.eql(['a', 'b']);
                edit.should.eql([]);
                return ['1', '2'];
            });
            return list.should.eql('1, 2');
        });

        it('saves comma', () => {
            const list = utils.editList('a,\nb', (parsed, edit) => ['1', '2']);
            return list.should.eql('1,\n2');
        });

        return it('parse one value', () => {
            const list = utils.editList('1', (parsed, edit) => [parsed[0], '2']);
            return list.should.eql('1, 2');
        });
    });
});
