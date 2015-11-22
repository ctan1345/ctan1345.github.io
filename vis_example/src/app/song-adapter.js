define(function(require) {
  var _ = require("lodash");
  var song = require("./song");
  var store = require("./datastore");

  //var convert = function(data) {
    //var flatten = _.flatten(data.map(function(d) { return d.value; }));
    //var temp = d3.nest()
        //.key(function(d) { return d.location; })
        //.key(function(d) { return d.from; })
        //.rollup(function(leaves) { return leaves.length; })
        //.entries(flatten);

    //var converted = {};
    //var total = 0;
    //var grand_total = 0;
    //_.forEach(temp, function(obj) {
      //var location = obj["key"];
      //converted[location] = {};
      //converted[location]["person"] = [];
      //_.forEach(obj["values"], function(person, _k) {
        //converted[location]["person"].push({
          //person: person.key,
          //total: person.values
        //});
        //total += person.values;
      //})
      //converted[location]["total"] = total;
      //grand_total += total;
    //});

    //converted["total"] = grand_total;

    //return converted;
  //}
  function draw_user_communications_chart(data) {
    if (!data) {
      return;
    }
    console.log(data);
    var flatten = _.flatten(data.map(function(d) { return d.value; }))
        .filter(function(d) { return d.location == "Coaster Alley"; });
    var temp = d3.nest()
        .key(function(d) { return d.from; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(flatten);


    temp = _.sortBy(temp, function(d) { return -d.values; })
    temp = temp.splice(0, 20);
    console.log(temp)
    song.draw_user_communications_chart(temp, "Coaster Alley");
  }

  return function(callback) {
    store.subscribe(draw_user_communications_chart);
    callback(null);
  }
});
