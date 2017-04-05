const last = array => array[array.length - 1];

var brackets = {

  // Parse string to nodes tree
    parse(str) {
        let current = [''];
        const stack   = [current];

        for (let sym of str) {
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

  // Generate output string by nodes tree
    stringify(ast) {
        let result = '';
        for (let i of ast) {
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
