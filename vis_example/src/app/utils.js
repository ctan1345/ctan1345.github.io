define(function(require) {
  var d3 = require("d3");
  var _ = require("lodash");
  var crossfilter = require("crossfilter");

  var parse = d3.time.format("%Y-%m-%d %H:%M").parse;

  var communication = {},
      movement = {},
      location_map = {};
  var last_time;

  var location_cache = {};
  var communication_group_by_timestamp = null;
      movement_group_by_id = null;

  /* Use regex to extract the hour and minute component from timestamp */
  function _get_time(timestamp) {
    try {
    var match = /(\d{4})-(\d)-(\d{2}) (\d{2}):(\d{2})/.exec(timestamp);
    return {
      hour: parseInt(match[4]),
      minute: parseInt(match[5])
    };
    } catch (e) {
      console.log(timestamp);
    }
  }

  /* Calculate the difference between timestamps
   * Args:
   *    - a: time object (smaller value)
   *    - b: time object (larger value)
   * Returns:
   *    - int: the difference between a and b
   */
  function _time_diff(a, b) {
    var hdiff = a.hour - b.hour,
        mdiff = a.minute - b.minute;


    return -(hdiff * 60 + mdiff);
  }

  function _compare_time(a, b) {
    if (a.hour == b.hour) {
      return a.minute == b.mintue ? 0 :
                a.minute < b.minute ? -1 : 1;
    }

    return a.hour < b.hour ? -1 : 1;
  }

  return {
    load_communication: function(day, callback) {
      day = day.slice(0, 3).toLowerCase()
      if (communication[day])
        return callback(communication[day]);

      d3.csv("../../data/comm-data-" + _.capitalize(day) + ".csv", function(data) {
        // Convert data to minute precision
        // Remove people without movement location
        //_.remove(data, function(d) {
          //return d.from == '839736' || d.to == '839736' ||
              //d.from == '1278894' || d.to == '1278894' ||
              //d.to == 'external';
        //});
        data.forEach(function(d, i) {
          d.index = i;
          d.Timestamp = parse(d.Timestamp.substring(0, 15));
        });

        communication = crossfilter(data);
        callback(communication);
      });
    },

    load_movement: function(day, callback) {
      day = day.slice(0, 3).toLowerCase()
      if (movement[day])
        return callback(movement[day]);

      var path = "../../data/park-movement-" + _.capitalize(day) + "-reduced.csv";
      d3.csv(path, function(data) {
        // Convert data to minute precision
        data.forEach(function(d, i) {
          d.index = i;
          d.Timestamp = parse(d.Timestamp.substring(0, 15));
        });

        movement = data;
        callback(data);
      });
    },
    load_movement_communication: function(day, callback) {
      this.load_movement(day, function(movement) {
        this.load_communication(day, function(communication) {
          callback(movement, communication);
        });
      }.bind(this));
    },
    communication_group_by_timestamp: function(c) {
      if (communication_group_by_timestamp) {
        return communication_group_by_timestamp
      }
      communication_group_by_timestamp = d3.nest()
          .key(function(d) { return d.Timestamp; })
          .map(c, d3.map);

      return communication_group_by_timestamp;
    },
    movement_group_by_id: function() {
      if (movement_group_by_id) {
        return movement_group_by_id
      }
      movement_group_by_id = d3.nest()
          .key(function(d) { return d.id; })
          .map(movement, d3.map);


      delete movement_group_by_id._['undefined'];
      return movement_group_by_id;
    },

    /* This function convert a given array of timestamps to timesteps
     * Timesteps are monotonically increasing where first timestamp has timestep = 0
     * The distance between each timestamps is respected
     * Args:
     *   - timestamps: an array of timestamps ordered in increasing order
     * Return:
     *   - map: a mapping between timestamps and corresponding timestep value
     */
    to_timesteps: function(timestamps) {
      var map = {};
      var prev = timestamps.shift();
      var sum = 0;

      map[sum] = prev;
      prev = _get_time(prev);

      timestamps.forEach(function(t) {
        var time = _get_time(t);
        sum += _time_diff(prev, time);

        map[sum] = t;
        prev = time;
      });

      return map;
    },

    /* Calculate the location of all users given a Date object
     * The function updates the location map and returns it
     *
     * Args:
     *   - time: a Date object
     * Return:
     *   - location_map: a mapping between location of all users and times
     */
    update_location_map: _.memoize(function(time) {
      if (!movement_group_by_id) {
        this.movement_group_by_id();
      }
      var map = {};
      // Clear the cache if the time is going backwards
      if (time < last_time) {
        location_cache = {};
      }
      /* Iterates through the movement group object
       * Recall that the movement group object has the following format:
       * movement._ = {
       *   id: [array_of_movement_associated_with_id]
       * }
       */
      _.forEach(movement_group_by_id._, function(m, id) {
        /* Find the recorded location of the user that is closest to the given time */
        var movements;
        if (location_cache[id] != undefined) {
          movements = m.slice(location_cache[id])
        } else {
          movements = m;
        }

        var best_movement;
        var best_diff = Infinity;
        var best_index = 0;
        for (var j = 0; j < movements.length; j++) {
          var diff = Math.abs(movements[j].Timestamp - time) / 1000 / 60;
          if (diff <= 6) {
            best_diff = diff;
            best_movement = movements[j];
            best_index = j;
            break;
          } else {
            if (diff < best_diff) {
              best_diff = diff;
              best_movement = movements[j];
              best_index = m.indexOf(best_movement);
            }
          }
        }

        location_cache[id] = best_index;
        map[id] = best_movement;
      });

      last_time = time;

      return map;
    })
  };
});
