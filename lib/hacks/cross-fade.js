const Value = require('../value');
const list = require('postcss/lib/list');

class CrossFade extends Value {

    static names = ['cross-fade'];

    replace(string, prefix) {
        return list.space(string)
            .map(value => {
                if (value.slice(0, +this.name.length + 1) !== this.name + '(') {
                    return value;
                }

                const close = value.lastIndexOf(')');
                const after = value.slice(close + 1);
                let args = value.slice(this.name.length + 1, close);

                if (prefix === '-webkit-') {
                    const match = args.match(/\d*.?\d+%?/);
                    if (match) {
                        args = args.slice(match[0].length).trim();
                        args += `, ${match[0]}`;
                    } else {
                        args += ', 0.5';
                    }
                }
                return prefix + this.name + '(' + args + ')' + after;
            }).join(' ');
    }

}

module.exports = CrossFade;
