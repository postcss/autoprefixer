const Browsers = require('../lib/browsers');

const data = require('caniuse-lite').agents;
const path = require('path');

describe('.prefixes()', () => {

    it('returns prefixes by default data', () => {
        expect(Browsers.prefixes())
            .toEqual(['-webkit-', '-moz-', '-ms-', '-o-']);
    });

});

describe('.withPrefix()', () => {

    it('finds possible prefix', () => {
        expect(Browsers.withPrefix('1 -o-calc(1)')).toBeTruthy();
        expect(Browsers.withPrefix('1 calc(1)')).toBeFalsy();
    });

});

describe('parse()', () => {

    it('allows to select no browsers', () => {
        const browsers = new Browsers(data, []);
        expect(browsers.selected.length).toEqual(0);
    });

    it('selects by older version', () => {
        const browsers = new Browsers(data, ['ie < 7']);
        expect(browsers.selected).toEqual(['ie 6', 'ie 5.5']);
    });

    it('combines requirements', () => {
        const browsers = new Browsers(data, ['ie 10', 'ie < 6']);
        expect(browsers.selected).toEqual(['ie 10', 'ie 5.5']);
    });

    it('has aliases', () => {
        expect((new Browsers(data, ['fx 10'])).selected)
            .toEqual(['firefox 10']);
        expect((new Browsers(data, ['ff 10'])).selected)
            .toEqual(['firefox 10']);
    });

    it('ignores case', () => {
        expect((new Browsers(data, ['Firefox 10'])).selected)
            .toEqual(['firefox 10']);
    });

    it('uses browserslist config', () => {
        const css = path.join(__dirname, 'cases/config/test.css');
        expect((new Browsers(data, undefined, { from: css })).selected)
            .toEqual(['ie 10']);
    });
});

describe('prefix()', () => {

    it('returns browser prefix', () => {
        const browsers = new Browsers(data, ['chrome 30']);
        expect(browsers.prefix('chrome 30')).toEqual('-webkit-');
    });

    it('returns right prefix for Operas', () => {
        const browsers = new Browsers(data, ['last 1 opera version']);
        expect(browsers.prefix('opera 12')).toEqual('-o-');
        expect(browsers.prefix(browsers.selected[0])).toEqual('-webkit-');
        expect(browsers.prefix('op_mob 12')).toEqual('-o-');
        expect(browsers.prefix(browsers.selected[0])).toEqual('-webkit-');
    });

});

describe('isSelected()', () => {

    it('return true for selected browsers', () => {
        const browsers = new Browsers(data, ['chrome 30', 'chrome 31']);
        expect(browsers.isSelected('chrome 30')).toBeTruthy();
        expect(browsers.isSelected('ie 6')).toBeFalsy();
    });

});
