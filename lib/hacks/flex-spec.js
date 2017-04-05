// Return flexbox spec versions by prefix
module.exports = function (prefix) {
    const spec = (() => {
        if (prefix === '-webkit- 2009' || prefix === '-moz-') {
            return 2009;
        } else if (prefix === '-ms-') {
            return 2012;
        } else if (prefix === '-webkit-') {
            return 'final';
        }
    })();
    if (prefix === '-webkit- 2009') {
        prefix = '-webkit-';
    }

    return [spec, prefix];
};
