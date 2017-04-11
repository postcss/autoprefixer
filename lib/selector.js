const OldSelector = require('./old-selector');
const Prefixer = require('./prefixer');
const Browsers = require('./browsers');
const utils = require('./utils');

class Selector extends Prefixer {

    constructor(name, prefixes, all) {
        super(name, prefixes, all);
        this.regexpCache = {};
    }

    /**
     * Is rule selectors need to be prefixed
     */
    check(rule) {
        if (rule.selector.indexOf(this.name) !== -1) {
            return !!rule.selector.match(this.regexp());
        } else {
            return false;
        }
    }

    /**
     * Return prefixed version of selector
     */
    prefixed(prefix) {
        return this.name.replace(/^([^\w]*)/, `$1${prefix}`);
    }

    /**
     * Lazy loadRegExp for name
     */
    regexp(prefix) {
        if (this.regexpCache[prefix]) {
            return this.regexpCache[prefix];
        }

        const name = prefix ? this.prefixed(prefix) : this.name;
        this.regexpCache[prefix] =
            new RegExp(`(^|[^:"'=])${utils.escapeRegexp(name)}`, 'gi');
        return this.regexpCache[prefix];
    }

    /**
     * All possible prefixes
     */
    possible() {
        return Browsers.prefixes();
    }

    /**
     * Return all possible selector prefixes
     */
    prefixeds(rule) {
        if (rule._autoprefixerPrefixeds) {
            return rule._autoprefixerPrefixeds;
        }

        const prefixeds = {};
        for (const prefix of this.possible()) {
            prefixeds[prefix] = this.replace(rule.selector, prefix);
        }

        rule._autoprefixerPrefixeds = prefixeds;
        return rule._autoprefixerPrefixeds;
    }

    /**
     * Is rule already prefixed before
     */
    already(rule, prefixeds, prefix) {
        let index = rule.parent.index(rule) - 1;

        while (index >= 0) {
            const before = rule.parent.nodes[index];

            if (before.type !== 'rule') {
                return false;
            }

            let some = false;
            for (let key in prefixeds) {
                const prefixed = prefixeds[key];
                if (before.selector === prefixed) {
                    if (prefix === key) {
                        return true;
                    } else {
                        some = true;
                        break;
                    }
                }
            }
            if (!some) {
                return false;
            }

            index -= 1;
        }

        return false;
    }

    /**
     * Replace selectors by prefixed one
     */
    replace(selector, prefix) {
        return selector.replace(this.regexp(), `$1${this.prefixed(prefix)}`);
    }

    /**
     * Clone and add prefixes for at-rule
     */
    add(rule, prefix) {
        const prefixeds = this.prefixeds(rule);

        if (this.already(rule, prefixeds, prefix)) {
            return;
        }

        const cloned = this.clone(rule, { selector: prefixeds[prefix] });
        rule.parent.insertBefore(rule, cloned);
    }

    /**
     * Return function to fast find prefixed selector
     */
    old(prefix) {
        return new OldSelector(this, prefix);
    }

}

module.exports = Selector;
