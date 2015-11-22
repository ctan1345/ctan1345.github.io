define(function(require) {
  var utils = require("./utils");

  var movement,
      communication;

  var time = 0;
  var timer;
  var subscribers = [];
  var pause = false;

  function _publish() {
    //if (time == 20) {
      //clearInterval(timer);
    //}
    if (!pause) {
      subscribers.forEach(function(callback) {
        callback(time);
      });
    }
  }

  return {
    subscribe: function(callback) {
      subscribers.push(callback);
    },
    start: function() {
      if (!timer) {
        timer = setInterval(function() {
          _publish();
          time += 1;
        }, 750);
      }
      pause = false;

    },
    stop: function() {
      pause = true;
    }
  }
});
