class OldSelector {
    constructor(selector, prefix1) {
        this.prefix = prefix1;
        this.prefixed = selector.prefixed(this.prefix);
        this.regexp   = selector.regexp(this.prefix);

        this.prefixeds = [];
        for (let prefix of selector.possible()) {
            this.prefixeds.push([selector.prefixed(prefix), selector.regexp(prefix)]);
        }

        this.unprefixed = selector.name;
        this.nameRegexp = selector.regexp();
    }

  // Is rule is hack without unprefixed version bottom
    isHack(rule) {
        let index = rule.parent.index(rule) + 1;
        const rules = rule.parent.nodes;

        while (index < rules.length) {
            const before = rules[index].selector;
            if (!before) {
                return true;
            }

            if (before.indexOf(this.unprefixed) !== -1 && before.match(this.nameRegexp)) {
                return false;
            }

            let some = false;
            for (let [string, regexp] of this.prefixeds) {
                if (before.indexOf(string) !== -1 && before.match(regexp)) {
                    some = true;
                    break;
                }
            }

            if (!some) {
                return true;
            }

            index += 1;
        }

        return true;
    }

  // Does rule contain unnecessayr prefixed selector
    check(rule) {
        if  (rule.selector.indexOf(this.prefixed) === -1) {
            return false;
        }
        if (!rule.selector.match(this.regexp)) {
            return false;
        }
        if  (this.isHack(rule)) {
            return false;
        }
        return true;
    }
}

module.exports = OldSelector;
