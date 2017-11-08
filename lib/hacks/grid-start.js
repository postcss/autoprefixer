const Declaration = require('../declaration');

class GridStart extends Declaration {

    static names = [
        'grid-row-start', 'grid-column-start', 'grid-row', 'grid-column',
        'grid-area'
    ];

    /**
     * Do not add prefix for unsupported value in IE
     */
    check(decl) {
        return decl.value.indexOf('/') === -1 ||
            decl.value.indexOf('span') !== -1;
    }

    /**
     * Return a final spec property
     */
    normalize(prop) {
        return prop.replace('-start', '');
    }

    /**
     * Change property name for IE
     */
    prefixed(prop, prefix) {
        if (prefix === '-ms-') {
            return prefix + prop.replace('-start', '');
        } else {
            return super.prefixed(prop, prefix);
        }
    }

    /**
     * Split one value to two
     */
    insert(decl, prefix, prefixes) {
        const parts = this.splitValue(decl, prefix);
        if (parts.length === 2) {
            decl.cloneBefore({
                prop: `-ms-${decl.prop}-span`,
                value: parts[1]
            });
        }
        if (decl.prop === 'grid-area') {
            const already = decl.parent.some(
                i => i.prop === '-ms-grid-row' ||
                    i.prop === '-ms-grid-column' ||
                    i.prop === '-ms-grid-row-span'
            );
            if (already) {
                return undefined;
            }
            this.gridAreaCheck(decl);
        }

        return super.insert(decl, prefix, prefixes);
    }

    checkGridAreaParts(gridAreaParts) {
        return gridAreaParts.length === 4 &&
            gridAreaParts[2].indexOf('span') !== -1 &&
            gridAreaParts[3].indexOf('span') !== -1;
    }

    gridAreaCheck(decl) {

        const gridAreaParts = decl.value.split('/');
        const gridAreaWithSpans = this.checkGridAreaParts(gridAreaParts);

        if (gridAreaWithSpans) {
            const msGridRow = gridAreaParts[0].trim();
            const msGridColumn = gridAreaParts[1].trim();
            const msGridRowSpan = gridAreaParts[2].split('span')[1].trim();

            decl.cloneBefore({
                prop: '-ms-grid-row',
                value: msGridRow
            });
            decl.cloneBefore({
                prop: '-ms-grid-column',
                value: msGridColumn
            });

            decl.cloneBefore({
                prop: '-ms-grid-row-span',
                value: msGridRowSpan
            });
        }
    }

    /**
     * Change value for combine property
     */
    set(decl, prefix) {
        const parts = this.splitValue(decl, prefix);
        if (parts.length === 2) {
            decl.value = parts[0];
        }
        const gridAreaParts = decl.value.split('/');
        const gridAreaWithSpans = this.checkGridAreaParts(gridAreaParts);
        if (gridAreaWithSpans) {
            decl.value = gridAreaParts[3].split('span')[1].trim();
            decl.prop = 'grid-column-span';
        }
        return super.set(decl, prefix);
    }

    /**
     * If property contains start and end
     */
    splitValue(decl, prefix) {
        if (prefix === '-ms-' && decl.prop.indexOf('-start') === -1) {
            const parts = decl.value.split(/\s*\/\s*span\s+/);
            if (parts.length === 2) {
                return parts;
            }
        }
        return false;
    }

}

module.exports = GridStart;
