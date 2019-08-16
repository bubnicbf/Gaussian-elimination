/*!
 * na-gaussian-elimination
 * @see https://github.com/tfoxy/na-gaussian-elimination
 * @version 0.0.4
 * @author Tomás Fox <tomas.c.fox@gmail.com>
 * @license MIT
 */

/*global define*/

/**
 * Operations needed:
 * sub, times, div, isZero, abs, cmp
 */
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.GaussianElimination = factory();
  }
}(this, function() {
  'use strict';

  var SolutionError = createError('SolutionError');
  var OptionsError = createError('OptionsError');

  GaussianElimination.defaultOptions = {
    zero: 0,
    pivoting: 'partial',
    lu: false
  };
  GaussianElimination.SolutionError = SolutionError;
  GaussianElimination.OptionsError = OptionsError;

  GaussianElimination.setEventEmitter = setEventEmitter;

  GaussianElimination.setEventEmitter(getEventEmitter());

  return GaussianElimination;

  ////////////////

  function GaussianElimination(options) {
    options = options || {};

    this.setPivoting(getOption('pivoting', options));

    this.setLuFlag(getOption('lu', options));

    this.setZero(getOption('zero', options));
  }

  function setEventEmitter(EventEmitter) {
    GaussianElimination.prototype = Object.create(EventEmitter.prototype);
    GaussianElimination.prototype.constructor = GaussianElimination;

    GaussianElimination.prototype.solve = solve;
    GaussianElimination.prototype._solve = _solve;
    GaussianElimination.prototype.forwardElimination = forwardElimination;
    GaussianElimination.prototype._forwardElimination = _forwardElimination;
    GaussianElimination.prototype.backSubstitution = backSubstitution;
    GaussianElimination.prototype._backSubstitution = _backSubstitution;
    GaussianElimination.prototype.setPivoting = setPivoting;
    GaussianElimination.prototype.setLuFlag = setLuFlag;
    GaussianElimination.prototype.setZero = setZero;
  }

  function getEventEmitter() {
    var EventEmitter = {
      prototype: {
        on: function() {
          throw new Error('An EventEmitter library needs to be set using' +
              ' GaussianElimination.setEventEmitter(EventEmitter) method.' +
              ' The /on/ function cannot be used otherwise');
        },
        emit: function(eventName, param) {
          if (eventName === 'error') {
            throw param;
          }
        }
      }
    };

    if (typeof module === 'object' && module.exports) {
      try {
        EventEmitter = require('events').EventEmitter;
      } catch (err) {
        // noop
      }
    }

    return EventEmitter;
  }

  function getOption(name, options) {
    return name in options ?
        options[name] :
        GaussianElimination.defaultOptions[name];
  }

  function createError(name) {
    function CustomError(message) {
      this.message = message;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }

    CustomError.prototype = Object.create(Error.prototype);
    CustomError.prototype.constructor = CustomError;
    CustomError.prototype.name = name;

    return CustomError;
  }

  function valueFn(value) {
    return value;
  }

  function setPivoting(pivotingType) {
    switch (pivotingType) {
      case 'partial':
        this._pivoting = partialPivoting.bind(this);
        break;
      case 'scaled':
        this._pivoting = scaledPivoting.bind(this);
        break;
      case 'none':
        this._pivoting = nonePivoting.bind(this);
        break;
      case 'avoid zero':
        this._pivoting = avoidZeroPivoting.bind(this);
        break;
      case 'complete':
        this._pivoting = completePivoting.bind(this);
        break;
      default:
        throw new OptionsError('Unknown pivoting method: ' + pivotingType);
    }
    this._pivotingType = pivotingType;
  }

  function setLuFlag(luFlag) {
    if (luFlag) {
      this._getLowerMatrixValue = valueFn;
    } else {
      this._getLowerMatrixValue = getZero.bind(this);
    }
  }

  function getZero() {
    return this._zero;
  }

  function setZero(zero) {
    this._zero = zero;
  }


  function solve(matrix, result) {
    try {
      return this._solve(matrix, result);
    } catch (err) {
      this.emit('error', err);
      return null;
    }
  }

  function _solve(matrix, result) {
    this.emit('solveStart', {matrix: matrix, result: result});

    var system = this._forwardElimination(matrix, result);

    var solutionSystem = this._backSubstitution(matrix, result);

    system.transformationVector.forEach(function(transf, i) {
      swapArrayPlaces(result, i, transf);
      swapArrayPlaces(system.transformationVector, i, transf);
    });

    this.emit('solveEnd', solutionSystem);

    return solutionSystem;
  }


  function forwardElimination(matrix, result) {
    try {
      return this._forwardElimination(matrix, result);
    } catch (err) {
      this.emit('error', err);
      return null;
    }
  }

  function _forwardElimination(matrix, result) {
    var m = matrix.length;
    var n = matrix[0].length;
    var end = Math.min(m, n);
    var type = 'forward';

    var transformationVector = this._pivotingType === 'complete' ?
        matrix[0].map(function(v, i) {
          return i;
        }) : [];

    var system = {
      matrix: matrix,
      result: result,
      transformationVector: transformationVector
    };
    var eventArg = {
      type: type,
      system: system
    };

    this.emit('eliminationStart', eventArg);

    for (var k = 0; k < end - 1; k++) {
      this._pivoting(system, k);

      var pivot = matrix[k][k];

      if (pivot.isZero()) {
        continue;
      }

      var reduceColumnProps = {
        k: k,
        pivot: pivot
      };

      this.emit('eliminationReduceColumnStart', reduceColumnProps);

      for (var i = k + 1; i < m; i++) {
        var row = matrix[i];
        var mIK = row[k].div(pivot);
        var reduceRowProps = {
          i: i,
          k: k,
          m: mIK,
          pivot: pivot
        };
        var product;

        this.emit('eliminationReduceRowStart', reduceRowProps);

        row[k] = this._getLowerMatrixValue(mIK);

        for (var j = k + 1; j < n; j++) {
          product = mIK.times(matrix[k][j]);
          row[j] = row[j].sub(product);
        }

        product = mIK.times(result[k]);
        result[i] = result[i].sub(product);

        this.emit('eliminationReduceRowEnd', reduceRowProps);
      }

      this.emit('eliminationReduceColumnEnd', reduceColumnProps);
    }

    reorderRows(matrix, result, end);

    this.emit('eliminationEnd', eventArg);

    return system;
  }


  function backSubstitution(matrix, result) {
    try {
      return this._backSubstitution(matrix, result);
    } catch (err) {
      this.emit('error', err);
      return null;
    }
  }

  function _backSubstitution(matrix, result) {
    var rowLength = matrix[0].length;
    var m = matrix.length;
    var n = m - Math.max(m - rowLength, 0);
    var type = 'back';
    var i, j, row, rowValue, resultValue;

    this.emit('substitutionStart', {
      type: type,
      system: {
        matrix: matrix,
        result: result
      }
    });

    var system = {
      matrix: matrix,
      solution: result,
      infiniteSolutions: false
    };

    for (i = n - 1; i >= 0; i--) {
      row = matrix[i];
      resultValue = result[i];
      rowValue = row[i];

      this.emit('substitutionOperationStart', {
        i: i
      });

      // Get solution value and store it in result[i]
      if (resultValue.isZero() && rowValue.isZero()) {
        result[i] = resultValue;
        system.infiniteSolutions = true;
      } else {
        for (j = i + 1; j < row.length; j++) {
          var product = row[j].times(result[j]);
          resultValue = resultValue.sub(product);
        }
        if (rowValue.isZero()) {
          if (resultValue.isZero()) {
            result[i] = resultValue;
          } else {
            throw new SolutionError('There is no solution for the system' +
                ' (a number multiplied by zero cannot be non-zero)');
          }
        } else {
          result[i] = resultValue = resultValue.div(rowValue);
        }
      }

      this.emit('substitutionOperationEnd', {
        i: i,
        value: resultValue
      });
    }

    if (rowLength > 0) {
      var lastSolution = result[n - 1];

      for (i = n; i < m; i++) {
        rowValue = matrix[i][rowLength - 1];
        resultValue = result[i];

        if (rowValue.isZero()) {
          if (resultValue.isZero()) {
            continue;
          } else {
            throw new SolutionError('There is no solution for the system' +
                ' (a number multiplied by zero cannot be non-zero)');
          }
        }

        var solutionValue = resultValue.div(rowValue);
        if (solutionValue.cmp(lastSolution) !== 0) {
          throw new SolutionError('There is no solution for the system');
        }
      }

      result.splice(n, Math.max(m - n, 0));
    }

    this.emit('substitutionEnd', {
      type: type,
      system: system
    });

    return system;
  }


  /**
   * all-zeroes rows must go to the end of the rows
   */
  function reorderRows(matrix, result, n) {
    if (n > 0) {
      var m = matrix.length - 1;
      var j = n - 1;
      for (var i = j; i < m; ++i) {
        if (matrix[i][j].isZero()) {
          swapArrayPlaces(matrix, i, m);
          swapArrayPlaces(result, i, m);
          m -= 1;
        }
      }
    }
  }

  function nonePivoting(system, i) {
    var pivot = system.matrix[i][i];
    if (pivot.isZero()) {
      throw new SolutionError('Pivot ' + i + ' is zero');
    }
  }

  function avoidZeroPivoting(system, i) {
    var pivot = system.matrix[i][i];
    if (pivot.isZero()) {
      partialPivoting.call(this, system, i);
    }
  }

  function partialPivoting(system, i) {
    var maxValueIndex = getMaxAbsValueIndexOfColumn(system.matrix, i);
    swapRows.call(this, system, i, maxValueIndex);
  }

  function scaledPivoting(system, i) {
    var maxValueIndex = getBestScaledRowIndex(system.matrix, i);
    swapRows.call(this, system, i, maxValueIndex);
  }

  function completePivoting(system, i) {
    var maxValueIndexes = getMaxAbsValueIndexOfMatrix(system.matrix, i);
    swapRows.call(this, system, i, maxValueIndexes.i);
    swapColumns.call(this, system, i, maxValueIndexes.j);
  }

  function getMaxAbsValueIndexOfColumn(matrix, i) {
    var maxValue = matrix[i][i].abs();
    var maxValueIndex = i;

    for (var k = i + 1; k < matrix.length; k++) {
      var value = matrix[k][i].abs();

      if (value.cmp(maxValue) > 0) {
        maxValue = value;
        maxValueIndex = k;
      }
    }

    return maxValueIndex;
  }

  function getBestScaledRowIndex(matrix, i) {
    var maxValue = getScaledValue(matrix[i], i);
    var maxValueIndex = i;

    for (var k = i + 1; k < matrix.length; k++) {
      var value = getScaledValue(matrix[k], i);

      if (value.cmp(maxValue) > 0) {
        maxValue = value;
        maxValueIndex = k;
      }
    }

    return maxValueIndex;
  }

  function getScaledValue(row, i) {
    var maxAbsValue = getMaxAbsValueOfRow(row, i);
    var value = row[i].abs();

    if (maxAbsValue.isZero()) {
      return maxAbsValue;
    } else {
      return value.div(maxAbsValue);
    }
  }

  function getMaxAbsValueOfRow(row, i) {
    var maxValue = row[i].abs();

    for (var j = i + 1; j < row.length; j++) {
      var value = row[j].abs();

      if (value.cmp(maxValue) > 0) {
        maxValue = value;
      }
    }

    return maxValue;
  }

  function getMaxAbsValueIndexOfMatrix(matrix, k) {
    var m = matrix.length, n = matrix[0].length;
    var maxValue = matrix[k][k].abs();
    var maxValueIndexes = {i: k, j: k};
    var i, j = k, value;

    for (i = k + 1; i < m; i++) {
      value = matrix[i][j].abs();

      if (value.cmp(maxValue) > 0) {
        maxValue = value;
        maxValueIndexes = {i: i, j: j};
      }
    }

    for (i = k; i < m; i++) {
      for (j = k + 1; j < n; j++) {
        value = matrix[i][j].abs();

        if (value.cmp(maxValue) > 0) {
          maxValue = value;
          maxValueIndexes = {i: i, j: j};
        }
      }
    }

    return maxValueIndexes;
  }

  function swapRows(system, i, j) {
    if (i !== j) {
      swapArrayPlaces(system.matrix, i, j);

      swapArrayPlaces(system.result, i, j);

      this.emit('swapRows', {
        i: i,
        j: j
      });
    }
  }

  function swapColumns(system, i, j) {
    if (i !== j) {
      system.matrix.forEach(function(row) {
        swapArrayPlaces(row, i, j);
      });

      swapArrayPlaces(system.transformationVector, i, j);

      this.emit('swapColumns', {
        i: i,
        j: j,
        transformationVector: system.transformationVector
      });
    }
  }

  function swapArrayPlaces(array, i, j) {
    var aux = array[i];
    array[i] = array[j];
    array[j] = aux;
  }

}));
