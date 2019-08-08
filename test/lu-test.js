var chai = require('chai');
var expect = chai.expect;

var GaussianElimination = require('..');
var bn = require('./bn');
GaussianElimination.defaultOptions.zero = bn(0);


describe('LU decomposition', function() {
  'use strict';

  describe('.forwardElimination', function() {

    it('returns an LU matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none',
        lu: true
      });
      var matrix = [
        [bn(4), bn(3)],
        [bn(2), bn(1)]
      ];
      var result = [bn(6), bn(5)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[1][0].toString()).to.equal(bn(0.5).toString());
    });

  });

  describe('.solve', function() {

    it('solves correctly a 3x2 matrix', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none',
        lu: true
      });
      var matrix = [
        [bn(1), bn(2)],
        [bn(3), bn(4)],
        [bn(6), bn(8)]
      ];
      var result = [bn(5), bn(6), bn(12)];

      var solution = gaussianElimination.solve(matrix, result).solution;

      expect(solution.toString()).to.equal([bn(-4), bn(4.5)].toString());
    });

  });

});
