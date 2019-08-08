var chai = require('chai');
var expect = chai.expect;

var GaussianElimination = require('..');
var bn = require('./bn');
GaussianElimination.defaultOptions.zero = bn(0);


describe('GaussianElimination', function() {
  'use strict';

  it('is a function', function() {
    expect(GaussianElimination).to.be.a('function');
  });

  describe('instance', function() {

    it('is an object', function() {
      var gaussianElimination = new GaussianElimination();
      expect(gaussianElimination).to.be.an('object');
    });

    it('is an instance of GaussianElimination', function() {
      var gaussianElimination = new GaussianElimination();
      expect(gaussianElimination).to.be.an.instanceOf(GaussianElimination);
    });

    describe('.solve', function() {

      it('returns an empty array if matrix and result are empty', function() {
        var gaussianElimination = new GaussianElimination();
        var solution = gaussianElimination.solve([[]], []).solution;
        expect(solution).to.have.length(0);
      });

      it('returns [b/a] if matrix is [[a]] and result is [b]', function() {
        var gaussianElimination = new GaussianElimination();
        var matrix = [[bn(4)]];
        var result = [bn(24)];
        var solution = gaussianElimination.solve(matrix, result).solution;
        expect(solution.toString()).to.equal([bn(6)].toString());
      });

    });

    describe('.forwardElimination', function() {

      it('does not reduce a 1x1 matrix', function() {
        var gaussianElimination = new GaussianElimination();
        var matrix = [[bn(12)]];
        var result = [bn(4)];

        gaussianElimination.forwardElimination(matrix, result);

        expect(matrix.toString()).to.equal([[bn(12)]].toString(), 'matrix');
        expect(result.toString()).to.equal([bn(4)].toString(), 'result');
      });

      it('swap rows when using partial pivoting', function() {
        var gaussianElimination = new GaussianElimination({
          pivoting: 'partial'
        });
        var matrix = [
          [bn(1), bn(2)],
          [bn(3), bn(4)]
        ];
        var result = [bn(2), bn(1)];

        gaussianElimination.forwardElimination(matrix, result);

        expect(matrix[0].toString()).to.equal([bn(3), bn(4)].toString(), 'firstRow');
      });


      // TODO The matrix B does not have the same number of rows as matrix A.
    });


  });

});
