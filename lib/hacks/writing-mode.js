const Declaration = require('../declaration');

class WritingMode extends Declaration {

    static names = ['writing-mode'];

    static msValues = {
        'horizontal-tb': 'lr-tb',
        'vertical-rl': 'tb-rl',
        'vertical-lr': 'tb-lr'
    };

    set(decl, prefix) {
        if (prefix === '-ms-') {
            decl.value = WritingMode.msValues[decl.value] || decl.value;
            return super.set(decl, prefix);
        } else {
            return super.set(decl, prefix);
        }
    }

}

module.exports = WritingMode;
