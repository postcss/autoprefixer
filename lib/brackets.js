const last = array => array[array.length - 1];

const brackets = {

    /**
     * Parse string to nodes tree
     */
    parse(str) {
        let current = [''];
        const stack = [current];

        for (let i = 0; i < str.length; i++) {
            let sym = str[i];
            if (sym === '(') {
                current = [''];
                last(stack).push(current);
                stack.push(current);

            } else if (sym === ')') {
                stack.pop();
                current = last(stack);
                current.push('');

            } else {
                current[current.length - 1] += sym;
            }
        }

        return stack[0];
    },

    /**
     * Generate output string by nodes tree
     */
    stringify(ast) {
        let result = '';
        for (const i of ast) {
            if (typeof i === 'object') {
                result += `(${brackets.stringify(i)})`;
            } else {
                result += i;
            }
        }
        return result;
    }
};

module.exports = brackets;
