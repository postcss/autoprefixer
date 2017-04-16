const flexSpec = require('./flex-spec');
const Declaration = require('../declaration');

class FlexFlow extends Declaration {

    static names = ['flex-flow', 'box-direction', 'box-orient'];

    /**
     * Use two properties for 2009 spec
     */
    insert(decl, prefix, prefixes) {
        let spec;
        [spec, prefix] = flexSpec(prefix);
        if (spec !== 2009) {
            return super.insert(decl, prefix, prefixes);
        } else {
            const values = decl.value.split(/\s+/).filter(
                i => i !== 'wrap' && i !== 'nowrap' && 'wrap-reverse'
            );
            if (values.length === 0) {
                return undefined;
            }

            const already = decl.parent.some(
                i => i.prop === prefix + 'box-orient' ||
                     i.prop === prefix + 'box-direction'
            );
            if (already) {
                return undefined;
            }

            const value = values[0];
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

}

module.exports = FlexFlow;
