define(function(require) {
  var utils = require("./utils");

  var movement,
      dims = {},
      filters = {},
      current = {};

  var format = d3.time.format("%Y-%m-%d %H:%M");

  var subscribers = {};

  function _publish() {
    _.forEach(subscribers, function(subscriber, _) {
      if (subscriber.active) {
        subscriber.callback(current["time"]);
      }
    });
  }

  return {
    get_movement: function() {
      return movement;
    },
    get_dimensions: function() {
      return dims;
    },
    get_filters: function() {
      return filters;
    },
    get_current_communication: function() {
      return current["time"];
    },
    set_current_communication: function(_) {
      current["time"] = _;
      _publish();
    },
    update_time_dimension: function() {
      function reduce_add(p, v) {
        p.push(v);
        return p;
      }

      function reduce_remove(p, v) {
        p.splice(p.indexOf(v), 1);
        return p;
      }

      function reduce_initial() {
        return [];
      }
      var g = dims["time"].group().reduce(reduce_add, reduce_remove, reduce_initial).all();
      g = g.filter(function(d) { return d.value.length > 0; });
      this.set_current_communication(g);
    },
    init: function(day, callback) {
      utils.load_movement_communication(day, function(_m, _c) {
        movement = _m;
        dims["time"] = _c.dimension(function(d) { return d.Timestamp; });
        filters["time"] = _c
            .dimension(function(d) { return d.Timestamp; });
        filters["sender"] = _c
            .dimension(function(d) { return d.from; });
        filters["receiver"] = _c
            .dimension(function(d) { return d.to; });
        callback();
      });
    },
    subscribe: function(name, callback) {
      if (subscribers[name]) {
        subscribers[name].active = true;
        return;
      }
      subscribers[name] = {
        callback: callback,
        active: true
      };
    },
    unsubscribe: function(name) {
      subscribers[name].active = false;
    },
    is_active: function(name) {
      return subscribers[name].active;
    }
  }
});
