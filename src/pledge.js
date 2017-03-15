'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
var $Promise = function (executor) {
  $Promise.prototype._state = 'pending';
  this._handlerGroups = [];
  this.then = this.then.bind(this);
  this.callHandler = this.callHandler.bind(this);
  this.catch = this.catch.bind(this);

  if (typeof executor == 'function') {
    executor(this._internalResolve.bind(this), this._internalReject.bind(this));
  }

}
$Promise.prototype._internalResolve = function (data) {

  if (this._state === 'pending') {

    this._state = 'fulfilled';
    this._value = data;
    this.callHandler();

  }
};

$Promise.prototype._internalReject = function (reason) {
  if (this._state === 'pending') {
    this._state = 'rejected';
    this._value = reason;
    this.callHandler();
  }
};
$Promise.prototype.then = function (successCb, errorCb) {
  if (typeof successCb != 'function') {
    successCb = null;
  }
  if (typeof errorCb != 'function') {
    errorCb = null;
  }
  var handler = { successCb: successCb, errorCb: errorCb, downstreamPromise: new $Promise };
  // handler.downstreamPromise = this.$Promise.then(function successCb(){
  //   return handler.downstreamPromise;
  // })
  // console.log(handler.downstreamPromise)
  this._handlerGroups.push(handler);
  this.callHandler();
  return handler.downstreamPromise;
};


//$Promise.prototype._handlerGroups = [];

$Promise.prototype.callHandler = function () {
  if (this._state === 'fulfilled') {
    if (this._handlerGroups.length) {
      this._handlerGroups.forEach(handler => {
        if (handler.successCb) {
          handler.successCb(this._value)
          // console.log('***', handler.successCb(this._value));
          // handler.downstreamPromise._state = 'fulfilled';
          // handler.downstreamPromise._value = value2;
           handler.downstreamPromise._internalResolve(this.value);
        }

        // handler.downstreamPromise._state = 'fulfilled';
        // handler.downstreamPromise._value = this._value;
        else {
          handler.downstreamPromise._state = 'fulfilled';
          handler.downstreamPromise._value = this._value;
        }
      })
      this._handlerGroups = [];
    }


  }

  if (this._state === 'rejected') {
    if (this._handlerGroups.length) {
      this._handlerGroups.forEach(handler => {
        if (handler.errorCb) {
          handler.errorCb(this._value)
        } else {
          handler.downstreamPromise._state = 'rejected';
          handler.downstreamPromise._value = this._value;
        }
      })
      this._handlerGroups = [];
    }
  }
}

$Promise.prototype.catch = function (func) {
  return this.then(null, func);
}



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = $Promise;

So in a Node-based project we could write things like this:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
