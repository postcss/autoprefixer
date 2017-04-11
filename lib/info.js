const browserslist = require('browserslist');

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

const names = {
    ie: 'IE',
    ie_mob: 'IE Mobile',
    ios_saf: 'iOS',
    op_mini: 'Opera Mini',
    op_mob: 'Opera Mobile',
    and_chr: 'Chrome for Android',
    and_ff: 'Firefox for Android',
    and_uc: 'UC for Android'
};

const prefix = function (name, prefixes) {
    let out = `  ${name}: `;
    out += prefixes.map(i => i.replace(/^-(.*)-$/g, '$1')).join(', ');
    out += '\n';
    return out;
};

module.exports = function (prefixes) {
    if (prefixes.browsers.selected.length === 0) {
        return 'No browsers selected';
    }

    const versions = {};
    for (const browser of prefixes.browsers.selected) {
        let [name, version] = browser.split(' ');

        name = names[name] || capitalize(name);
        if (versions[name]) {
            versions[name].push(version);
        } else {
            versions[name] = [version];
        }
    }

    let out = 'Browsers:\n';
    for (const browser in versions) {
        let list = versions[browser];
        list = list.sort((a, b) => parseFloat(b) - parseFloat(a));
        out += `  ${browser}: ${list.join(', ')}\n`;
    }

    const coverage = browserslist.coverage(prefixes.browsers.selected);
    const round = Math.round(coverage * 100) / 100.0;
    out += `\nThese browsers account for ${round}% of all users globally\n`;

    let atrules = '';
    for (const name in prefixes.add) {
        const data = prefixes.add[name];
        if (name[0] === '@' && data.prefixes) {
            atrules += prefix(name, data.prefixes);
        }
    }
    if (atrules !== '') {
        out += `\nAt-Rules:\n${atrules}`;
    }

    let selectors = '';
    for (const selector of prefixes.add.selectors) {
        if (selector.prefixes) {
            selectors += prefix(selector.name, selector.prefixes);
        }
    }
    if (selectors !== '') {
        out += `\nSelectors:\n${selectors}`;
    }

    let values = '';
    let props = '';
    for (const name in prefixes.add) {
        const data = prefixes.add[name];
        if (name[0] !== '@' && data.prefixes) {
            props += prefix(name, data.prefixes);
        }

        if (!data.values) {
            continue;
        }
        for (let value of data.values) {
            const string = prefix(value.name, value.prefixes);
            if (values.indexOf(string) === -1) {
                values += string;
            }
        }
    }

    if (props !== '') {
        out += `\nProperties:\n${props}`;
    }
    if (values !== '') {
        out += `\nValues:\n${values}`;
    }

    if (atrules === '' && selectors === '' && props === '' && values === '') {
        out += '\nAwesome! Your browsers don\'t require any vendor prefixes.' +
               '\nNow you can remove Autoprefixer from build steps.';
    }

    return out;
};
