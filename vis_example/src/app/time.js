define(function(require) {
  var d3 = require("d3");
  var parse = d3.time.format("%Y-%m-%d %H:%M").parse;
  return {
    Time: function(hour, minute) {
      return {
        hour: hour,
        minute: minute
      };
    },
    parseTimestamp: function(timestamp) {
      var t = parse(timestamp);

      return {
        hour: t.getHours(),
        minute: t.getMinutes()
      };
    },
    toString: function(time_obj) {
      return time_obj.hour + ":" +
        (time_obj.minute < 10 ? '0' + time_obj.minute : time_obj.minute);
    }
  }
});
