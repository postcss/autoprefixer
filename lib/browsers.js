const browserslist = require('browserslist');

const utils = require('./utils');

class Browsers {

  // Return all prefixes for default browser data
    static prefixes() {
        if (this.prefixesCache) {
            return this.prefixesCache;
        }

        const data = require('caniuse-lite').agents;
        return this.prefixesCache = utils.uniq((() => {
            const result = [];
            for (let name in data) {
                const i = data[name];
                result.push(`-${i.prefix}-`);
            }
            return result;
        })())
                           .sort((a, b) => b.length - a.length);
    }

  // Check is value contain any possibe prefix
    static withPrefix(value) {
        if (!this.prefixesRegexp) {
            this.prefixesRegexp = new RegExp(`${ this.prefixes().join('|') }`);
        }

        return this.prefixesRegexp.test(value);
    }

    constructor(data, requirements, options, stats) {
        this.data = data;
        this.options = options;
        this.stats = stats;
        this.selected = this.parse(requirements);
    }

  // Return browsers selected by requirements
    parse(requirements) {
        return browserslist(requirements, {
            stats: this.stats,
            path:  this.options != null ? this.options.from : undefined,
            env:   this.options != null ? this.options.env : undefined
        }
    );
    }

  // Select major browsers versions by criteria
    browsers(criteria) {
        let selected = [];
        for (var browser in this.data) {
            const data = this.data[browser];
            const versions = criteria(data).map(version => `${browser} ${version}`);
            selected = selected.concat(versions);
        }
        return selected;
    }

  // Return prefix for selected browser
    prefix(browser) {
        let prefix;
        const [name, version] = Array.from(browser.split(' '));
        const data     = this.data[name];
        if (data.prefix_exceptions) {
            prefix   = data.prefix_exceptions[version];
        }
        if (!prefix) {
            ({ prefix } = data);
        }
        return `-${prefix}-`;
    }

  // Is browser is selected by requirements
    isSelected(browser) {
        return this.selected.indexOf(browser) !== -1;
    }
}

module.exports = Browsers;
