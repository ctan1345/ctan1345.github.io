define(function(require) {
  var store = require("./datastore");
  return function(callback) {
    var filters = store.get_filters();
    var dims = store.get_dimensions();

    d3.select(".filters.control-panel .receiver")
        .on("keyup", filter_receiver);

    function filter_receiver() {
      var id = d3.select(".filters.control-panel .receiver").property("value");
      if (!id) {
        filters["receiver"].filterAll();
        store.update_time_dimension();
        return;
      }

      filters["receiver"].filterExact(id);
      store.update_time_dimension();
    }

    callback();
  }
});
