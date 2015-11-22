define(function(require) {
  var d3 = require("d3");
  var utils = require("./utils");
  var Time = require('./time')
  var constants = require('./constants');
  var store = require('./datastore');
  var width = constants.IMAGE_WIDTH,
      height = constants.IMAGE_HEIGHT,
      margin = {top: 20, right: 10, bottom: 20, left: 15};

  var no_movement_ids = constants.NO_MOVEMENT_IDS;

  var parse = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

  var x_scale = d3.scale.linear()
      .range([margin.left, width])
      .domain([0, 99]);
  var y_scale = d3.scale.linear()
      .range([height, margin.top]) // reversed to attain correct direction of y-axis
      .domain([0, 99]);


  //var map = {
    //sender: {},
    //receiver: {}
  //};

  function update(g, data) {
    // Get the location of the person at window start time
    if (data.length == 0) {
      return;
    }
    var location_map = utils.update_location_map(data[0].key);

    var flatten = _.flatten(data.map(function(d) { return d.value; }));
    var lines = g.selectAll("line")
        .data(flatten, function(d) { return d.index; });

    lines.exit()
        .remove();

    lines.enter()
    .append("line")
    .attr('class', function(d) {
      if (_.includes(no_movement_ids, d.from)) {
        return 'sender-no-movement';
      } else if (_.includes(no_movement_ids, d.to)) {
        return 'receiver-no-movement';
      }
    })
    .attr('id', function(d) {
      if (d.from == 'external' || d.to == 'external') {
        return 'external';
      }
    })
    .attr("x1", function(d) {
      try {
        if (this.className.baseVal == 'sender-no-movement') {
          return x_scale(50);
        }
        return x_scale(+location_map[d.from].X)
      } catch (e) {
        //map['sender'][d.from] = map['sender'][d.from] == undefined ? 1 : map['sender'][d.from] + 1
        return margin.left;
      }
    })
    .attr("y1", function(d) {
      try {
        if (this.className.baseVal == 'sender-no-movement') {
          return y_scale(40);
        }
        return y_scale(+location_map[d.from].Y);
      } catch (e) {
        return margin.top;
      }
      })
    .attr("x2", function(d) {
      try {
        if (this.className.baseVal == 'receiver-no-movement') {
          return x_scale(50);
        }
        return x_scale(+location_map[d.to].X);
      } catch (e) {
        //map['receiver'][d.to] = map['receiver'][d.to] == undefined ? 1 : map['receiver'][d.to] + 1
        return margin.left;
      }
    })
    .attr("y2", function(d) {
      try {
        if (this.className.baseVal == 'receiver-no-movement') {
          return y_scale(40);
        }
        return y_scale(+location_map[d.to].Y);
      } catch (e) {
        return margin.top;
      }
    })

    lines
      .attr("stroke-width", "1px")
      .attr("stroke", function(d) {
        if (_.includes(['sender-no-movement', 'receiver-no-movement'], this.className.baseVal)) {
          return "grey"
        }
        if (this.getAttribute('id')) {
          return "green";
        }
        return "blue";
      });

      //console.log(map)

  }

  return function(callback) {
    //var timer = require("./timer");
      var body = d3.select('#main');
      var svg = body.append("svg")
          .attr("width", width)
          .attr("height", height);

      svg.insert('image', ":first-child")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', constants.IMAGE_WIDTH)
        .attr('height', constants.IMAGE_HEIGHT)
        .attr('xlink:href', '../../files/Park\ Map.jpg')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      var g = svg.append("g");
      //var x = x_accessor(communication._, timesteps);
      store.subscribe("communication", update.bind(null, g));
      callback(null);
  };
});
