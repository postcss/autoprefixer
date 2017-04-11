const AtRule = require('../lib/at-rule');
const parse  = require('postcss/lib/parse');

describe('AtRule', () =>
  describe('process()', () =>

    it('adds prefixes', () => {
        const keyframes = new AtRule('@keyframes', ['-moz-', '-ms-']);

        const css = parse('@-moz-keyframes b {} @-ms-keyframes a {} @keyframes a {}');
        keyframes.process(css.last);
        return css.toString().should.eql('@-moz-keyframes b {} ' +
                                '@-ms-keyframes a {} ' +
                                '@-moz-keyframes a {} ' +
                                '@keyframes a {}');
    })
  )
);
