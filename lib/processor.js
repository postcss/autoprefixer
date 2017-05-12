const Value = require('./value');

const OLD_DIRECTION =
    /(^|[^-])(linear|radial)-gradient\(\s*(top|left|right|bottom)/i;

const SIZES = [
    'width', 'height', 'min-width', 'max-width',
    'min-height', 'max-height', 'inline-size',
    'min-inline-size', 'max-inline-size', 'block-size',
    'min-block-size', 'max-block-size'
];

class Processor {

    constructor(prefixes) {
        this.prefixes = prefixes;
    }

    /**
     * Add necessary prefixes
     */
    add(css, result) {
        // At-rules
        const resolution = this.prefixes.add['@resolution'];
        const keyframes = this.prefixes.add['@keyframes'];
        const viewport = this.prefixes.add['@viewport'];
        const supports = this.prefixes.add['@supports'];

        css.walkAtRules(rule => {
            if (rule.name === 'keyframes') {
                if (!this.disabled(rule)) {
                    return keyframes && keyframes.process(rule);
                }
            } else if (rule.name === 'viewport') {
                if (!this.disabled(rule)) {
                    return viewport && viewport.process(rule);
                }
            } else if (rule.name === 'supports') {
                if (this.prefixes.options.supports !== false &&
                    !this.disabled(rule)
                ) {
                    return supports.process(rule);
                }
            } else if (rule.name === 'media' &&
                rule.params.indexOf('-resolution') !== -1
            ) {
                if (!this.disabled(rule)) {
                    return resolution && resolution.process(rule);
                }
            }

            return undefined;
        });

        // Selectors
        css.walkRules(rule => {
            if (this.disabled(rule)) return undefined;

            return this.prefixes.add.selectors.map(selector => {
                return selector.process(rule, result);
            });
        });

        css.walkDecls(decl => {
            if (this.disabledDecl(decl)) return undefined;

            if (decl.prop === 'display' && decl.value === 'box') {
                result.warn(
                    'You should write display: flex by final spec ' +
                    'instead of display: box', { node: decl }
                );
                return undefined;
            }
            if (decl.value.indexOf('linear-gradient') !== -1) {
                if (OLD_DIRECTION.test(decl.value)) {
                    result.warn(
                        'Gradient has outdated direction syntax. ' +
                        'New syntax is like `to left` instead of `right`.',
                        { node: decl }
                    );
                }
            }
            if (decl.prop === 'text-emphasis-position') {
                if (decl.value === 'under' || decl.value === 'over') {
                    result.warn(
                        'You should use 2 values for text-emphasis-position ' +
                        'For example, `under left` instead of just `under`.',
                        { node: decl }
                    );
                }
            }

            if (SIZES.indexOf(decl.prop) !== -1) {
                if (decl.value.indexOf('fill-available') !== -1) {
                    result.warn(
                        'Replace fill-available to stretch, ' +
                        'because spec had been changed',
                        { node: decl }
                    );
                } else if (decl.value.indexOf('fill') !== -1) {
                    result.warn(
                       'Replace fill to stretch, because spec had been changed',
                        { node: decl }
                    );
                }
            }

            if (this.prefixes.options.flexbox !== false) {
                if (decl.prop === 'grid-row-end' &&
                    decl.value.indexOf('span') === -1
                ) {
                    result.warn(
                        'IE supports only grid-row-end with span. ' +
                        'You should add grid: false option to Autoprefixer ' +
                        'and use some JS grid polyfill for full spec support',
                        { node: decl }
                    );
                }
                if (decl.prop === 'grid-row') {
                    if (decl.value.indexOf('/') !== -1 &&
                        decl.value.indexOf('span') === -1
                    ) {
                        result.warn(
                        'IE supports only grid-row with / and span. ' +
                        'You should add grid: false option to Autoprefixer ' +
                        'and use some JS grid polyfill for full spec support',
                            { node: decl }
                        );
                    }
                }
            }

            let prefixer;

            if (decl.prop === 'transition' ||
                decl.prop === 'transition-property'
            ) {
                // Transition
                return this.prefixes.transition.add(decl, result);
            } else if (decl.prop === 'align-self') {
                // align-self flexbox or grid
                const display = this.displayType(decl);
                if (display !== 'grid' &&
                    this.prefixes.options.flexbox !== false
                ) {
                    prefixer = this.prefixes.add['align-self'];
                    if (prefixer && prefixer.prefixes) {
                        prefixer.process(decl);
                    }
                }
                if (display !== 'flex' &&
                    this.prefixes.options.grid !== false
                ) {
                    prefixer = this.prefixes.add['grid-row-align'];
                    if (prefixer && prefixer.prefixes) {
                        return prefixer.process(decl);
                    }
                }
            } else if (decl.prop === 'justify-self') {
                // justify-self flexbox or grid
                const display = this.displayType(decl);
                if (display !== 'flex' &&
                    this.prefixes.options.grid !== false
                ) {
                    prefixer = this.prefixes.add['grid-column-align'];
                    if (prefixer && prefixer.prefixes) {
                        return prefixer.process(decl);
                    }
                }

            } else {
                // Properties
                prefixer = this.prefixes.add[decl.prop];
                if (prefixer && prefixer.prefixes) {
                    return prefixer.process(decl);
                }
            }

            return undefined;
        });

        // Values
        return css.walkDecls(decl => {
            if (this.disabledValue(decl)) return;

            const unprefixed = this.prefixes.unprefixed(decl.prop);
            for (let value of this.prefixes.values('add', unprefixed)) {
                value.process(decl, result);
            }
            Value.save(this.prefixes, decl);
        });
    }

    /**
     * Remove unnecessary pefixes
     */
    remove(css) {
        // At-rules
        const resolution = this.prefixes.remove['@resolution'];

        css.walkAtRules((rule, i) => {
            if (this.prefixes.remove[`@${rule.name}`]) {
                if (!this.disabled(rule)) {
                    rule.parent.removeChild(i);
                }
            } else if (rule.name === 'media' &&
                rule.params.indexOf('-resolution') !== -1 &&
                resolution
            ) {
                resolution.clean(rule);
            }
        });

        // Selectors
        for (const checker of this.prefixes.remove.selectors) {
            css.walkRules((rule, i) => {
                if (checker.check(rule)) {
                    if (!this.disabled(rule)) {
                        rule.parent.removeChild(i);
                    }
                }
            });
        }

        return css.walkDecls((decl, i) => {
            if (this.disabled(decl)) return;

            const rule = decl.parent;
            let unprefixed = this.prefixes.unprefixed(decl.prop);

            // Transition
            if (decl.prop === 'transition' ||
                decl.prop === 'transition-property'
            ) {
                this.prefixes.transition.remove(decl);
            }

            // Properties
            if (this.prefixes.remove[decl.prop] &&
                this.prefixes.remove[decl.prop].remove
            ) {
                let notHack = this.prefixes.group(decl).down(other => {
                    return this.prefixes.normalize(other.prop) === unprefixed;
                });

                if (unprefixed === 'flex-flow') {
                    notHack = true;
                }

                if (notHack && !this.withHackValue(decl)) {
                    if (decl.raw('before').indexOf('\n') > -1) {
                        this.reduceSpaces(decl);
                    }
                    rule.removeChild(i);
                    return;
                }
            }

            // Values
            for (const checker of this.prefixes.values('remove', unprefixed)) {
                if (checker.check(decl.value)) {
                    unprefixed = checker.unprefixed;
                    const notHack = this.prefixes.group(decl).down(
                        other => other.value.indexOf(unprefixed) !== -1
                    );

                    if (notHack) {
                        rule.removeChild(i);
                        return;
                    } else if (checker.clean) {
                        checker.clean(decl);
                        return;
                    }
                }
            }
        });
    }

    /**
     * Some rare old values, which is not in standard
     */
    withHackValue(decl) {
        return decl.prop === '-webkit-background-clip' && decl.value === 'text';
    }

    /**
     * Check for grid/flexbox options.
     */
    disabledValue(node) {
        if (this.prefixes.options.grid === false && node.type === 'decl') {
            if (node.prop === 'display' && node.value.indexOf('grid') !== -1) {
                return true;
            }
        }
        if (this.prefixes.options.flexbox === false && node.type === 'decl') {
            if (node.prop === 'display' && node.value.indexOf('flex') !== -1) {
                return true;
            }
        }

        return this.disabled(node);
    }

    /**
     * Check for grid/flexbox options.
     */
    disabledDecl(node) {
        if (this.prefixes.options.grid === false && node.type === 'decl') {
            if (node.prop.indexOf('grid') !== -1 ||
                node.prop === 'justify-items'
            ) {
                return true;
            }
        }
        if (this.prefixes.options.flexbox === false && node.type === 'decl') {
            const other = [
                'order',
                'justify-content',
                'align-items',
                'align-content'
            ];
            if (node.prop.indexOf('flex') !== -1 ||
                other.indexOf(node.prop) !== -1
            ) {
                return true;
            }
        }

        return this.disabled(node);
    }

    /**
     * Check for control comment and global options
     */
    disabled(node) {
        if (node._autoprefixerDisabled !== undefined) {
            return node._autoprefixerDisabled;
        } else if (node.nodes) {
            let status = undefined;
            node.each(i => {
                if (i.type !== 'comment') {
                    return undefined;
                }
                if (/(!\s*)?autoprefixer:\s*off/i.test(i.text)) {
                    status = false;
                    return false;
                } else if (/(!\s*)?autoprefixer:\s*on/i.test(i.text)) {
                    status = true;
                    return false;
                }
                return undefined;
            });

            let result = false;
            if (status !== undefined) {
                result = !status;
            } else if (node.parent) {
                result = this.disabled(node.parent);
            }

            node._autoprefixerDisabled = result;
            return node._autoprefixerDisabled;

        } else if (node.parent) {
            node._autoprefixerDisabled = this.disabled(node.parent);
            return node._autoprefixerDisabled;

        } else {
            // unknown state
            return false;
        }
    }

    /**
     * Normalize spaces in cascade declaration group
     */
    reduceSpaces(decl) {
        let stop = false;
        this.prefixes.group(decl).up(() => {
            stop = true;
            return true;
        });
        if (stop) {
            return;
        }

        let parts = decl.raw('before').split('\n');
        const prevMin = parts[parts.length - 1].length;
        let diff = false;

        this.prefixes.group(decl).down(other => {
            parts = other.raw('before').split('\n');
            const last = parts.length - 1;

            if (parts[last].length > prevMin) {
                if (diff === false) {
                    diff = parts[last].length - prevMin;
                }

                parts[last] = parts[last].slice(0, -diff);
                other.raws.before = parts.join('\n');
            }
        });
    }

    /**
     * Is it flebox or grid rule
     */
    displayType(decl) {
        for (const i of decl.parent.nodes) {
            if (i.prop === 'display') {
                if (i.value.indexOf('flex') !== -1) {
                    return 'flex';
                } else if (i.value.indexOf('grid') !== -1) {
                    return 'grid';
                }
            }
        }
        return false;
    }

}

module.exports = Processor;
