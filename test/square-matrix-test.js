var chai = require('chai');
var expect = chai.expect;

var GaussianElimination = require('..');
var bn = require('./bn');
GaussianElimination.defaultOptions.zero = bn(0);


describe('For a square matrix', function() {
  'use strict';

  describe('.solve', function() {

    it('solves correctly a 2x2 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(1), bn(2)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(-4), bn(4.5)].toString());
    });

    it('solves correctly a 3x3 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(1), bn(2), bn(3)],
        [bn(4), bn(5), bn(6)],
        [bn(7), bn(8), bn(12)]
      ];
      var result = [bn(4), bn(7), bn(10)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(-2), bn(3), bn(0)].toString());
    });

    it('solves correctly a 3x3 matrix with a null vector result', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1), bn(2), bn(3)],
        [bn(4), bn(5), bn(6)],
        [bn(7), bn(8), bn(12)]
      ];
      var result = [bn(0), bn(0), bn(0)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(0), bn(0), bn(0)].toString());
    });

    it('returns a solution when there are infinite solutions', function() {
      var gaussianElimination = new GaussianElimination();
      var solution = gaussianElimination.solve([
        [bn(8), bn(6)],
        [bn(4), bn(3)]
      ], [bn(2), bn(1)]).solution;

      expect(solution.toString()).to.equal([bn(0.25), bn(0)].toString());
    });

    it('solves correctly a 2x2 matrix with a zero value in the result', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(2), bn(1)],
        [bn(0), bn(1)]
      ];
      var result = [bn(0), bn(1)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(-0.5), bn(1)].toString());
    });

    it('returns a solution when there are infinite solutions, ' +
        'where one pivot is zero with a non-zero result value', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1), bn(2), bn(0)],
        [bn(0), bn(0), bn(1)],
        [bn(0), bn(0), bn(2)]
      ];
      var result = [bn(1), bn(1), bn(2)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(1), bn(0), bn(1)].toString());
    });

  });

  describe('.forwardElimination', function() {

    it('reduces correctly a 2x2 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(1), bn(2)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];

      gaussianElimination.forwardElimination(matrix, result);

      var expectedMatrix = [
        [bn(1), bn(2)],
        [bn(0), bn(-2)]
      ];
      var expectedResult = [bn(5), bn(-9)];

      expect(matrix.toString()).to.equal(expectedMatrix.toString(), 'matrix');
      expect(result.toString()).to.equal(expectedResult.toString(), 'result');
    });

    it('reduces correctly a 3x3 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(1), bn(2), bn(3)],
        [bn(4), bn(5), bn(6)],
        [bn(7), bn(8), bn(12)]
      ];
      var result = [bn(4), bn(7), bn(10)];

      gaussianElimination.forwardElimination(matrix, result);

      var expectedMatrix = [
        [bn(1), bn(2), bn(3)],
        [bn(0), bn(-3), bn(-6)],
        [bn(0), bn(0), bn(3)]
      ];
      var expectedResult = [bn(4), bn(-9), bn(0)];

      expect(matrix.toString()).to.equal(expectedMatrix.toString(), 'matrix');
      expect(result.toString()).to.equal(expectedResult.toString(), 'result');
    });

  });
});
