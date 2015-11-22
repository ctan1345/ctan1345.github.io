define(function(require) {
  var d3 = require("d3");
  var store = require("./datastore");
  var async = require("async");

  function _init(day) {
    store.init(day, function() {
      async.parallel([
        require("./communication"),
        require("./timeline"),
        require("./rank_communication_by_sender"),
        require("./rank_communication_by_receiver"),
        require("./sender_filter"),
        require("./receiver_filter"),
        require("./hide_link_control"),
        require("./switch_dataset")
        //require("./song-adapter")
      ], function(err, result) {
        d3.select(".spinner").remove();
        d3.selectAll('.control-panel')
          .style('display', 'block');
        d3.selectAll('#switch')
          .style('display', 'block');

      });
    });
  }

  return {
    init: function(day) {
      _init(day);
    }
  }
});
