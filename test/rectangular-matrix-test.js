var chai = require('chai');
var expect = chai.expect;

var GaussianElimination = require('..');
var bn = require('./bn');
GaussianElimination.defaultOptions.zero = bn(0);


describe('For a rectangular matrix', function() {
  'use strict';

  describe('.solve', function() {

    it('solves correctly a 2x1 matrix', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1)],
        [bn(2)]
      ];
      var result = [bn(3), bn(6)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(3)].toString());
    });

    it('solves correctly a 2x1 matrix where solution can only be zero', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1)],
        [bn(2)]
      ];
      var result = [bn(0), bn(0)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(0)].toString());
    });

    it('solves correctly a 2x1 matrix where solution is established by first value', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1)],
        [bn(0)]
      ];
      var result = [bn(1), bn(0)];
      var solution = gaussianElimination.solve(matrix, result).solution;
      expect(solution.toString()).to.equal([bn(1)].toString());
    });

    it('throws error if a 2x1 matrix does not have a solution' +
        ' (must be zero and non-zero at the same time)', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1)],
        [bn(2)]
      ];
      var result = [bn(1), bn(0)];
      var fn = gaussianElimination.solve.bind(gaussianElimination, matrix, result);
      expect(fn).to.throw(GaussianElimination.SolutionError);
    });

    it('throws error if a 2x1 matrix does not have a solution' +
        ' (result of any number multiplied by zero cannot be non-zero)', function() {
      var gaussianElimination = new GaussianElimination();
      var matrix = [
        [bn(1)],
        [bn(0)]
      ];
      var result = [bn(1), bn(2)];
      var fn = gaussianElimination.solve.bind(gaussianElimination, matrix, result);
      expect(fn).to.throw(GaussianElimination.SolutionError);
    });

    it('solves correctly a 3x2 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(2), bn(3)],
        [bn(4), bn(6)],
        [bn(8), bn(8)]
      ];
      var result = [bn(1), bn(2), bn(3)];

      var expectedSolution = [bn(0.125), bn(0.25)];

      var solution = gaussianElimination.solve(matrix, result).solution;

      expect(solution.toString()).to.equal(expectedSolution.toString());
    });

    it('throws error if a 3x2 matrix does not have a solution' +
        ' (result of any number multiplied by zero cannot be non-zero)', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(2), bn(3)],
        [bn(4), bn(6)],
        [bn(8), bn(8)]
      ];
      var result = [bn(1), bn(2), bn(3)];

      var expectedSolution = [bn(0.125), bn(0.25)];

      var solution = gaussianElimination.solve(matrix, result).solution;

      expect(solution.toString()).to.equal(expectedSolution.toString());
    });

  });

  describe('.forwardElimination', function() {

    it('reduces correctly a 3x2 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(2), bn(3)],
        [bn(4), bn(8)],
        [bn(6), bn(7)]
      ];
      var result = [bn(5), bn(16), bn(19)];

      var expectedMatrix = [
        [bn(2), bn(3)],
        [bn(0), bn(2)],
        [bn(0), bn(-2)]
      ];
      var expectedResult = [bn(5), bn(6), bn(4)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix.toString()).to.equal(expectedMatrix.toString(), 'matrix');
      expect(result.toString()).to.equal(expectedResult.toString(), 'result');
    });

    it('moves an all-zeroes row to the end', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(6), bn(3)],
        [bn(6), bn(3)],
        [bn(3), bn(4)]
      ];
      var result = [bn(4), bn(4), bn(6)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[2].toString()).to.equal([bn(0), bn(0)].toString());
    });

  });

});
