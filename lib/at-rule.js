const Prefixer = require('./prefixer');

class AtRule extends Prefixer {

    /**
     * Clone and add prefixes for at-rule
     */
    add(rule, prefix) {
        const prefixed = prefix + rule.name;

        const already = rule.parent.some(
            i => i.name === prefixed && i.params === rule.params
        );
        if (already) {
            return undefined;
        }

        const cloned = this.clone(rule, { name: prefixed });
        return rule.parent.insertBefore(rule, cloned);
    }

    /**
     * Clone node with prefixes
     */
    process(node) {
        const parent = this.parentPrefix(node);

        for (const prefix of this.prefixes) {
            if (!parent || parent === prefix) {
                this.add(node, prefix);
            }
        }
    }

}

module.exports = AtRule;
