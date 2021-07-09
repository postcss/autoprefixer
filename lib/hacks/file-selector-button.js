let Selector = require('../selector')

class FileSelectorButton extends Selector {
  /**
   * Return different selectors depend on prefix
   */
  prefixed(prefix) {
    if (prefix === '-webkit-') {
      return '::-webkit-file-upload-button'
    }
    return `::file-selector-button`
  }
}

FileSelectorButton.names = ['::file-selector-button']

module.exports = FileSelectorButton
