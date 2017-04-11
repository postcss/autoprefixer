const Value = require('../value');

class ImageSet extends Value {

    static names = ['image-set'];

    /**
     * Use non-standard name for WebKit and Firefox
     */
    replace(string, prefix) {
        if (prefix === '-webkit-') {
            return super.replace(string, prefix)
                .replace(/("[^"]+"|'[^']+')(\s+\d+\w)/gi, 'url($1)$2');
        } else {
            return super.replace(string, prefix);
        }
    }

}

module.exports = ImageSet;
