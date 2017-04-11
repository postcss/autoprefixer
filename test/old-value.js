const OldValue = require('../lib/old-value');

describe('OldValue', () =>

  describe('.check()', () => {

      it('checks value in string', () => {
          const old = new OldValue('calc', '-o-calc');
          old.check('1px -o-calc(1px)').should.be.true;
          return old.check('1px calc(1px)').should.be.false;
      });

      return it('allows custom checks', () => {
          const old = new OldValue('calc', '-o-calc', 'calc', /calc/);
          return old.check('1px calc(1px)').should.be.true;
      });
  })
);
