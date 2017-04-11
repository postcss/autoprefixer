const Prefixer = require('./prefixer');
const utils = require('./utils');

const n2f = require('num2fraction');

const regexp = /(min|max)-resolution\s*:\s*\d*\.?\d+(dppx|dpi)/gi;
const split = /(min|max)-resolution(\s*:\s*)(\d*\.?\d+)(dppx|dpi)/i;

class Resolution extends Prefixer {

    /**
     * Return prefixed query name
     */
    prefixName(prefix, name) {
        const newName = prefix === '-moz-' ?
            name + '--moz-device-pixel-ratio' :
            prefix + name + '-device-pixel-ratio';
        return newName;
    }

    /**
     * Return prefixed query
     */
    prefixQuery(prefix, name, colon, value, units) {
        if (units === 'dpi') {
            value = Number(value / 96);
        }
        if (prefix === '-o-') {
            value = n2f(value);
        }
        return this.prefixName(prefix, name) + colon + value;
    }

    /**
     * Remove prefixed queries
     */
    clean(rule) {
        if (!this.bad) {
            this.bad = [];
            for (const prefix of this.prefixes) {
                this.bad.push(this.prefixName(prefix, 'min'));
                this.bad.push(this.prefixName(prefix, 'max'));
            }
        }

        rule.params = utils.editList(rule.params, queries => {
            return queries.filter(
                query => this.bad.every(i => query.indexOf(i) === -1)
            );
        });
    }

    /**
     * Add prefixed queries
     */
    process(rule) {
        const parent = this.parentPrefix(rule);
        const prefixes = parent ? [parent] : this.prefixes;

        rule.params = utils.editList(rule.params, (origin, prefixed) => {
            for (let query of origin) {
                if (query.indexOf('min-resolution') === -1 &&
                    query.indexOf('max-resolution') === -1) {
                    prefixed.push(query);
                    continue;
                }

                for (const prefix of prefixes) {
                    if (prefix === '-moz-' &&
                        rule.params.indexOf('dpi') !== -1
                    ) {
                        continue;
                    } else {
                        const processed = query.replace(regexp, str => {
                            const parts = str.match(split);
                            return this.prefixQuery(
                                prefix,
                                parts[1],
                                parts[2],
                                parts[3],
                                parts[4]
                            );
                        });
                        prefixed.push(processed);
                    }
                }
                prefixed.push(query);
            }

            return utils.uniq(prefixed);
        });
    }

}

module.exports = Resolution;
