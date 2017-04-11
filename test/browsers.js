const Browsers = require('../lib/browsers');

const data = require('caniuse-lite').agents;
const path = require('path');

describe('Browsers', () => {

    describe('.prefixes()', () => {

        it('returns prefixes by default data', () => {
            Browsers.prefixes()
                .should.eql(['-webkit-', '-moz-', '-ms-', '-o-']);
        });

    });

    describe('.withPrefix()', () => {

        it('finds possible prefix', () => {
            Browsers.withPrefix('1 -o-calc(1)').should.be.true;
            Browsers.withPrefix('1 calc(1)').should.be.false;
        });

    });

    describe('parse()', () => {

        it('allows to select no browsers', () => {
            const browsers = new Browsers(data, []);
            browsers.selected.should.be.empty;
        });

        it('selects by older version', () => {
            const browsers = new Browsers(data, ['ie < 7']);
            browsers.selected.should.eql(['ie 6', 'ie 5.5']);
        });

        it('combines requirements', () => {
            const browsers = new Browsers(data, ['ie 10', 'ie < 6']);
            browsers.selected.should.eql(['ie 10', 'ie 5.5']);
        });

        it('has aliases', () => {
            (new Browsers(data, ['fx 10'])).selected.should.eql(['firefox 10']);
            (new Browsers(data, ['ff 10'])).selected.should.eql(['firefox 10']);
        });

        it('ignores case', () => {
            (new Browsers(data, ['Firefox 10'])).selected
                .should.eql(['firefox 10']);
        });

        it('uses browserslist config', () => {
            const css = path.join(__dirname, 'cases/config/test.css');
            (new Browsers(data, undefined, { from: css })).selected
                .should.eql(['ie 10']);
        });
    });

    describe('prefix()', () => {

        it('returns browser prefix', () => {
            const browsers = new Browsers(data, ['chrome 30']);
            browsers.prefix('chrome 30').should === '-webkit-';
        });

        it('returns right prefix for Operas', () => {
            const browsers = new Browsers(data, ['last 1 opera version']);
            browsers.prefix('opera 12').should.eql('-o-');
            browsers.prefix(browsers.selected[0]).should.eql('-webkit-');
            browsers.prefix('op_mob 12').should.eql('-o-');
            browsers.prefix(browsers.selected[0]).should.eql('-webkit-');
        });

    });

    describe('isSelected()', () => {

        it('return true for selected browsers', () => {
            const browsers = new Browsers(data, ['chrome 30', 'chrome 31']);
            browsers.isSelected('chrome 30').should.be.true;
            browsers.isSelected('ie 6').should.be.false;
        });

    });

});
