const list = require('postcss/lib/list');

const Value = require('../value');

class ImageSet extends Value {
    static initClass() {
        this.names = ['image-set'];
    }

  // Use non-standard name for WebKit and Firefox
    replace(string, prefix) {
        if (prefix === '-webkit-') {
            return super.replace(...arguments).replace(/("[^"]+"|'[^']+')(\s+\d+\w)/gi, 'url($1)$2');
        } else {
            return super.replace(...arguments);
        }
    }
}
ImageSet.initClass();

module.exports = ImageSet;
