const flexSpec = require('./flex-spec');
const Declaration = require('../declaration');

class FlexDirection extends Declaration {

    static names = ['flex-direction', 'box-direction', 'box-orient'];

    /**
     * Return property name by final spec
     */
    normalize() {
        return 'flex-direction';
    }

    /**
     * Use two properties for 2009 spec
     */
    insert(decl, prefix, prefixes) {
        let spec;
        [spec, prefix] = flexSpec(prefix);
        if (spec !== 2009) {
            return super.insert(decl, prefix, prefixes);
        } else {
            const already = decl.parent.some(
                i => i.prop === prefix + 'box-orient' ||
                     i.prop === prefix + 'box-direction'
            );
            if (already) {
                return undefined;
            }

            const value = decl.value;
            const orient = value.indexOf('row') !== -1 ?
                'horizontal' :
                'vertical';
            const dir = value.indexOf('reverse') !== -1 ?
                'reverse' :
                'normal';

            let cloned = this.clone(decl);
            cloned.prop = prefix + 'box-orient';
            cloned.value = orient;
            if (this.needCascade(decl)) {
                cloned.raws.before = this.calcBefore(prefixes, decl, prefix);
            }
            decl.parent.insertBefore(decl, cloned);

            cloned = this.clone(decl);
            cloned.prop = prefix + 'box-direction';
            cloned.value = dir;
            if (this.needCascade(decl)) {
                cloned.raws.before = this.calcBefore(prefixes, decl, prefix);
            }
            return decl.parent.insertBefore(decl, cloned);
        }
    }

    /**
     * Clean two properties for 2009 spec
     */
    old(prop, prefix) {
        let spec;
        [spec, prefix] = flexSpec(prefix);
        if (spec === 2009) {
            return [prefix + 'box-orient', prefix + 'box-direction'];
        } else {
            return super.old(prop, prefix);
        }
    }

}

module.exports = FlexDirection;
