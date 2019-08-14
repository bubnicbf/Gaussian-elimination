var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var GaussianElimination = require('..');
var bn = require('./bn');
GaussianElimination.defaultOptions.zero = bn(0);


describe('Pivoting:', function() {
  'use strict';

  describe('none', function() {

    it('throws error when pivot is zero', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(0), bn(2)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];

      var fn = gaussianElimination.forwardElimination.bind(gaussianElimination, matrix, result);

      expect(fn).to.throw(GaussianElimination.SolutionError);
    });

    it('emits error when pivot is zero', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(0), bn(2)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];

      var listener = sinon.spy();
      gaussianElimination.on('error', listener);
      gaussianElimination.solve(matrix, result);

      expect(listener).to.have.been.calledOnce;
    });

    it('returns null while solving and listening to error event when pivot is zero', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'none'
      });
      var matrix = [
        [bn(0), bn(2)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];

      gaussianElimination.on('error', function() {});
      var system = gaussianElimination.solve(matrix, result);

      expect(system).to.be.null;
    });

  });

  describe('partial', function() {

    it('swaps rows in the matrix and result', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'partial'
      });
      var matrix = [
        [bn(1), bn(2)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];
      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[0].toString()).to.equal([bn(3), bn(4)].toString(), 'matrix[0]');
      expect(result[0].toString()).to.equal(bn(6).toString(), 'result[0]');
    });

    it('skips the column if it is filled with zeros', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'partial'
      });
      var matrix = [
        [bn(0), bn(1)],
        [bn(0), bn(2)]
      ];
      var result = [bn(2), bn(4)];

      var matrixString = matrix.toString();

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrixString).to.equal(matrix.toString(), 'matrix');
    });

  });

  describe('scaled', function() {

    it('avoids division by zero', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'scaled'
      });
      var matrix = [
        [bn(0), bn(0)],
        [bn(3), bn(4)]
      ];
      var result = [bn(0), bn(6)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[0].toString()).to.equal([bn(3), bn(4)].toString(), 'matrix[0]');
      expect(result[0].toString()).to.equal(bn(6).toString(), 'result[0]');
    });

    it('chooses the best scaled row (no swap)', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'scaled'
      });
      var matrix = [
        [bn(3), bn(4)],
        [bn(5), bn(10)]
      ];
      var result = [bn(6), bn(5)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[0].toString()).to.equal([bn(3), bn(4)].toString(), 'matrix[0]');
      expect(result[0].toString()).to.equal(bn(6).toString(), 'result[0]');
    });

    it('chooses the best scaled row (swaps rows)', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'scaled'
      });
      var matrix = [
        [bn(10), bn(100)],
        [bn(3), bn(4)]
      ];
      var result = [bn(5), bn(6)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[0].toString()).to.equal([bn(3), bn(4)].toString(), 'matrix[0]');
      expect(result[0].toString()).to.equal(bn(6).toString(), 'result[0]');
    });

  });

  describe('complete', function() {

    it('swaps columns and the transformation vector', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'complete'
      });
      var matrix = [
        [bn(3), bn(4)],
        [bn(1), bn(2)]
      ];
      var result = [bn(6), bn(5)];

      var listener = sinon.spy(function(eventArg) {
        expect(eventArg.system.transformationVector).to.deep.equal([1, 0], 'transformationVector');
      });

      gaussianElimination.on('eliminationEnd', listener);

      gaussianElimination.forwardElimination(matrix, result);

      expect(listener).to.have.been.calledOnce;
      expect(matrix[0].toString()).to.equal([bn(4), bn(3)].toString(), 'matrix[0]');
    });

    it('returns the solution in the correct order when calling solve', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'complete'
      });
      var matrix = [
        [bn(3), bn(4)],
        [bn(1), bn(2)]
      ];
      var result = [bn(6), bn(5)];

      var solution = gaussianElimination.solve(matrix, result).solution;

      expect(solution.toString()).to.equal([bn(-4), bn(4.5)].toString());
    });

    it('prefers to swap rows instead of columns', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'complete'
      });
      var matrix = [
        [bn(3), bn(4)],
        [bn(4), bn(2)]
      ];
      var result = [bn(6), bn(5)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[0].toString()).to.equal([bn(4), bn(2)].toString());
    });

    it('prefers to swap columns without swapping rows', function() {
      var gaussianElimination = new GaussianElimination({
        pivoting: 'complete'
      });
      var matrix = [
        [bn(6), bn(4), bn(7)],
        [bn(3), bn(7), bn(1)],
        [bn(5), bn(2), bn(7)]
      ];
      var result = [bn(6), bn(5), bn(4)];

      gaussianElimination.forwardElimination(matrix, result);

      expect(matrix[0].toString()).to.equal([bn(7), bn(4), bn(6)].toString(), 'matrix[0]');
      expect(result[0].toString()).to.equal(bn(6).toString(), 'result[0]');
    });

  });

});