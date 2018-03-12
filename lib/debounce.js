"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @ Desc: runs a time-consuming operation, The operation may be called several times concurrently,
 * but within debounce, it will only be run once before it's finished.
 */
var Debounce = function () {
  function Debounce() {
    _classCallCheck(this, Debounce);

    this.queues = {};
  }

  /**
   * debounce
   * @param {String} key
   * @param {Function} fn
   */


  _createClass(Debounce, [{
    key: "debounce",
    value: function debounce(key, fn) {
      var _this = this;

      if (!(key in this.queues)) {
        this.queues[key] = [];
        return Promise.resolve(fn()).then(function (data) {
          process.nextTick(function () {
            _this.queues[key].forEach(function (deferred) {
              return deferred.resolve(data);
            });
            delete _this.queues[key];
          });
          return data;
        }).catch(function (err) {
          process.nextTick(function () {
            _this.queues[key].forEach(function (deferred) {
              return deferred.reject(err);
            });
            delete _this.queues[key];
          });
          return Promise.reject(err);
        });
      } else {
        return new Promise(function (resolve, reject) {
          _this.queues[key].push({
            resolve: resolve,
            reject: reject
          });
        });
      }
    }
  }]);

  return Debounce;
}();

exports.default = Debounce;