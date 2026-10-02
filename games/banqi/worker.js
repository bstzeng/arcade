/* The UI sends only BanqiEngine.publicView(state), never its hidden layout. */
(function (root) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    var AI = require('./ai.js');
    module.exports = function (message) {
      var result = AI.chooseDetailed(message.observation, message.level, message.seed);
      return { id: message.id, action: result.action, stats: result.stats };
    };
    return;
  }
  root.importScripts('engine.js', 'ai.js');
  root.onmessage = function (event) {
    var message = event.data;
    try {
      var result = root.BanqiAI.chooseDetailed(message.observation, message.level, message.seed);
      root.postMessage({ id: message.id, action: result.action, stats: result.stats });
    } catch (error) {
      root.postMessage({ id: message.id, action: null, stats: null, error: error.message || String(error) });
    }
  };
})(typeof self !== 'undefined' ? self : globalThis);
