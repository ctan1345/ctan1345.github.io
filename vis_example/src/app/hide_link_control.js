define(function(require) {
  var store = require("./datastore");
  return function(callback) {
    var filters = store.get_filters();
    var dims = store.get_dimensions();
    d3.select(".chart.control-panel .hide-btn")
        .on("change", hide_link_control);


    function hide_link_control() {
      var flag = d3.select(".chart.control-panel .hide-btn").property("checked");

      if (!flag) {
        store.subscribe("communication");
      } else {
        store.unsubscribe("communication");
      }

    }
    callback();
  }
});
