var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var GaussianElimination = require('..');
var bn = require('./bn');
GaussianElimination.defaultOptions.zero = bn(0);

describe('Events:', function() {
  'use strict';

  describe('.solve', function() {

    it('emits solveStart', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('solveStart', listener);
      gaussianElimination.solve([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(listener).to.have.been.calledOnce;
    });

    it('emits solveEnd', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('solveEnd', listener);
      gaussianElimination.solve([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(listener).to.have.been.calledOnce;
    });

    it('emits solveStart before solveEnd', function() {
      var gaussianElimination = new GaussianElimination();
      var startListener = sinon.spy(function() {
        expect(endListener).to.have.not.been.called;
      });
      var endListener = sinon.spy();
      gaussianElimination.on('solveStart', startListener);
      gaussianElimination.on('solveEnd', endListener);
      gaussianElimination.solve([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(startListener).to.have.been.calledOnce;
      expect(endListener).to.have.been.calledOnce;
    });

  });

  describe('.forwardElimination', function() {

    it('emits eliminationStart', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('eliminationStart', listener);
      gaussianElimination.forwardElimination([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(listener).to.have.been.calledOnce;
    });

    it('emits eliminationEnd', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('eliminationEnd', listener);
      gaussianElimination.forwardElimination([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(listener).to.have.been.calledOnce;
    });

    it('emits eliminationStart before eliminationEnd', function() {
      var gaussianElimination = new GaussianElimination();
      var startListener = sinon.spy(function() {
        expect(endListener).to.have.not.been.called;
      });
      var endListener = sinon.spy();
      gaussianElimination.on('eliminationStart', startListener);
      gaussianElimination.on('eliminationEnd', endListener);
      gaussianElimination.forwardElimination([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(startListener).to.have.been.calledOnce;
      expect(endListener).to.have.been.calledOnce;
    });

    it('emits eliminationReduceColumnStart for every pivot', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('eliminationReduceColumnStart', listener);
      gaussianElimination.forwardElimination([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(listener).to.have.been.calledOnce;
    });

    it('emits eliminationReduceColumnStart with the pivot and the index', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('eliminationReduceColumnStart', listener);
      gaussianElimination.forwardElimination([
        [bn(8), bn(6)],
        [bn(4), bn(2)]
      ], [bn(2), bn(1)]);

      expect(listener).to.have.been.calledWith({
        k: 0,
        pivot: bn(8)
      });
    });
  });

  describe('swapRows event', function() {

    it('is called when pivoting, with the index of the rows as the argument', function() {
      var gaussianElimination = new GaussianElimination();
      var listener = sinon.spy();
      gaussianElimination.on('swapRows', listener);
      gaussianElimination.forwardElimination([
        [bn(1), bn(2)],
        [bn(3), bn(4)]
      ], [bn(5), bn(6)]);

      expect(listener).to.have.been.calledWith({
        i: 0,
        j: 1
      });
    });

  });
});
