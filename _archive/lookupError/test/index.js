/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
//chai.use(require('chai-things')); // breaks .to.have.all.keys
chai.use(require('chai-arrays'));


describe('shelling', function () {

  before('before', function () {
  });

  beforeEach('beforeEach', function () {

  });

  afterEach('afterEach', function () {

  });

  after('after', function () {

  });

  describe('lookupError', function () {
    let lookupError;
    before('before', function () {
      lookupError = require('../lib/lookupError');
    });

    it('is a function', function () {
      assert(typeof lookupError === 'function', 'Expect function');
    });

    it('handles common errors', function () {
      const result = lookupError('EACCES');
      expect(result).to.be.an('object');
      expect(result).to.include.all.keys('short', 'long');
    });

    it('handles linux errors', function () {
      const result = lookupError('EACCES');
      expect(result).to.be.an('object');
      expect(result).to.include.all.keys('short');
    });

    it('handles unknown errors', function () {
      const result = lookupError('__non__existent__');
      expect(result).to.be.an('object');
      expect(result).to.include.all.keys('short', 'long', 'notFound');
      expect(result).to.include({ notFound: true });
    });

  });


});
