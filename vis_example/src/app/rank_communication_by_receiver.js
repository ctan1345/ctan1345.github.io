define(function(require) {
  var store = require("./datastore");
  var _ = require("lodash");

  var margin = {top: 20, right: 20, bottom: 50, left: 40},
      width = 400 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .2);

  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");


  function update(svg, data) {
    if (data.length == 0) {
      return;
    }
    var flatten = _.flatten(data.map(function(d) { return d.value; }));
    var summary = d3.nest()
        .key(function(d) { return d.to; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(flatten);

    summary = _.sortBy(summary, function(d) {
      return -d.values;
    });
    summary = summary.slice(0, 20);

    x.domain(summary.map(function(d) { return d.key; }));
    if (summary.length == 1) {
      y.domain([0, _.first(summary).values]);
    } else {
      y.domain([_.last(summary).values-1, _.first(summary).values]);
    }

    var bar = svg.selectAll(".bar")
        .data(summary, function(d, i) { return i; });

    bar.exit()
        .remove();

    var person = bar.enter()
      .append("rect")
        .attr("class", "bar")

    bar
        .attr("transform", function(d) { return "translate(" + x(d.key) + ",0)"; })
        .attr("width", x.rangeBand())
        .transition()
        .duration(250)
        .attr("y", function(d) { return y(d.values); })
        .attr("height", function(d) { return height - y(d.values); });

    svg.selectAll(".x.axis")
        .call(xAxis)
      .selectAll("text")
        .attr("x", 9)
        .attr("dy", "-5px")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    svg.selectAll(".y.axis")
      .transition()
        .duration(250)
        .call(yAxis);


  }

  return function(callback) {
    var svg = d3.select("#rank-receiver").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "2em")
        .style("text-anchor", "end");

    svg.append("text")
        .attr("class", "title")
        .attr("x", width/2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text("Top number of communication by receiver");

    store.subscribe("rank_receiver", update.bind(null, svg));
    callback(null);
  };

});
