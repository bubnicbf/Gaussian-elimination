(function() {
  'use strict';

  var BigNumber = require('bignumber.js');

  function bn(number) {
    return new BigNumber(number);
  }

  module.exports = bn;
})();
