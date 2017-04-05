const Prefixer = require('./prefixer');

class AtRule extends Prefixer {

  // Clone and add prefixes for at-rule
    add(rule, prefix) {
        const prefixed = prefix + rule.name;

        const already = rule.parent.some(i => i.name === prefixed && i.params === rule.params);
        if (already) {
            return;
        }

        const cloned = this.clone(rule, { name: prefixed });
        return rule.parent.insertBefore(rule, cloned);
    }

  // Clone node with prefixes
    process(node) {
        const parent = this.parentPrefix(node);

        return (() => {
            const result = [];
            for (let prefix of this.prefixes) {
                if (parent && parent !== prefix) {
                    continue;
                }
                result.push(this.add(node, prefix));
            }
            return result;
        })();
    }
}

module.exports = AtRule;
