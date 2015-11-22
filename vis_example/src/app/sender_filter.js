define(function(require) {
  var store = require("./datastore");
  return function(callback) {
    var filters = store.get_filters();
    var dims = store.get_dimensions();
    d3.select(".filters.control-panel .sender")
        .on("keyup", filter_sender);


    function filter_sender() {
      var id = d3.select(".filters.control-panel .sender").property("value");
      if (!id) {
        filters["sender"].filterAll();
        store.update_time_dimension();
        return;
      }

      filters["sender"].filterExact(id);
      store.update_time_dimension();
    }
    callback();
  }
});
