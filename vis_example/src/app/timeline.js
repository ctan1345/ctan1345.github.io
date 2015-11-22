define(function(require) {
  var constants = require("./constants");
  var store = require("./datastore");
  var colorbrewer = require("colorbrewer");
  var timer = require("./timer");

  var width = 1200;
  var height = 100;
  var margin = constants.MARGIN;

  var format = d3.time.format("%H:%M");

  return function(callback) {
    var svg = d3.select(".timeline")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dims = store.get_dimensions();
        filters = store.get_filters();

    var groupby = {
      time: dims["time"].group()
    };

    var data = groupby["time"].reduceCount().all();

    var extent = [
      dims["time"].bottom(1)[0].Timestamp,
      dims["time"].top(1)[0].Timestamp
    ];

    var x = d3.time.scale()
        .domain(extent)
        .range([0, width]);
    var y = d3.scale.linear()
        .domain([1, groupby["time"].top(1)[0].value])
        .range([height, 0]);

    var step = 100 / groupby["time"].size();
    var grad = svg.append("defs")
      .append("linearGradient")
       .attr("id", "grad");

    var color = d3.scale.quantile()
        .domain(data.map(function(d) { return d.value; }))
        .range(d3.range(9));

    var scheme = colorbrewer.Reds[9];

    grad.selectAll("stop")
       .data(data)
       .enter()
      .append("stop")
        .attr("offset", function(d, i) { return  (i+1) * step + "%"; })
        .attr("stop-color", function(d) { return scheme[color(d.value)]; });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.hour)
        .tickSize(16, 0)
        .tickFormat(d3.time.format("%H:%M"));

    var area = d3.svg.area()
        .x(function(d) { return x(d.key); })
        .y0(height)
        .y1(function(d) { return y(d.value); })

    svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area)
      .style("fill", "url(#grad)");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height) + ")")
      .call(xAxis)
    .selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);

    var start = dims["time"].bottom(1)[0].Timestamp;
    var brush = d3.svg.brush()
        .x(x)
        .extent([start, new Date(start.getTime() + 60000)])
        .on("brush", _.throttle(brushmove, 450))
        .on("brushstart", _.throttle(brushstart, 150))
        .on("brushend", brushend);

    svg.select("def")
        .append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    var control = svg.append("g")
        .attr("class", "control")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    control.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -17)
        .attr("height", height + 7);

    d3.select(".timeline-control .size")
      .on("keyup", window_size_change)
    d3.select(".timeline-control .previous")
      .on("click", previous)
    d3.select(".timeline-control .next")
      .on("click", next)
    d3.select(".timeline-control .play")
      .on("click", play)
    d3.select(".timeline-control .stop")
      .on("click", stop)

    function update_communication(extent) {
      filters["time"].filterRange(extent);
      store.update_time_dimension();
    }
    function brushstart() {
      var extent = brush.extent();
      update_communication(extent);
    }
    function brushmove() {
      var extent = brush.extent();
      d3.select(".timeline-control .time")
        .text(function(d) { return format(extent[0]) + " - " + format(extent[1]); });

      d3.select(".timeline-control .size")
        .property("value", function() { return Math.round((extent[1] - extent[0]) / 1000 / 60); })

      update_communication(extent);
    }
    function brushend() {
      //console.log(brush.extent());
    }
    function window_size_change() {
      var diff = d3.select(".timeline-control .size").property("value")
      if (diff > 30 && store.is_active("communication")) {
        diff = 30;
        d3.select(".timeline-control .size").attr("value", 30);
      }
      var extent = brush.extent();
      var end = new Date(extent[0].getTime() + (+diff) * 60000);

      brush.extent([extent[0], end]);
      brush(d3.select(".brush").transition());
      brush.event(d3.select(".brush"));
    }
    function previous() {
      var extent = brush.extent();
      var step = d3.select(".timeline-control .step").property("value");
      var start = new Date(extent[0].getTime() - step * 60000);
      var end = new Date(extent[1].getTime() - step * 60000);

      brush.extent([start, end]);
      brush(d3.select(".brush").transition());
      brush.event(d3.select(".brush"));
    }
    function next() {
      var extent = brush.extent();
      var step = d3.select(".timeline-control .step").property("value");
      var start = new Date(extent[0].getTime() + step * 60000);
      var end = new Date(extent[1].getTime() + step * 60000);

      brush.extent([start, end]);
      brush(d3.select(".brush").transition());
      brush.event(d3.select(".brush"));
    }

    timer.subscribe(next);
    function play() {
      timer.start();
    }
    function stop() {
      timer.stop();
    }


    callback();
  }
});
