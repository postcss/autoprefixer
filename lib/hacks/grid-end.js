const Declaration = require('../declaration');

class GridEnd extends Declaration {

    static names = [
        'grid-row-end', 'grid-column-end'
    ];

    /**
     * Change repeating syntax for IE
     */
    insert(decl, prefix, prefixes, result) {
        if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes);

        const clonedDecl = this.clone(decl);

        const startProp = decl.prop.replace(/end$/, 'start');
        const spanProp = prefix + decl.prop.replace(/end$/, 'span');

        if (decl.parent.some(i => i.prop === spanProp)) {
            return undefined;
        }

        clonedDecl.prop = spanProp;

        if (decl.value.includes('span')) {
            clonedDecl.value = decl.value.replace(/span\s/i, '');
        } else {
            let startDecl;
            decl.parent.walkDecls(startProp, d => {
                startDecl = d;
            });
            if (startDecl) {
                const value = Number(decl.value) - Number(startDecl.value) + '';
                clonedDecl.value = value;
            } else {
                decl.warn(
                    result,
                    `Can not prefix ${decl.prop} (${startProp} is not found)`
                );
            }
        }

        decl.cloneBefore(clonedDecl);

        return undefined;
    }

}

module.exports = GridEnd;
