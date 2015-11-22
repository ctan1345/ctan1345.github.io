define(function(require) {
  var d3 = require("d3");

  function switch_dataset() {
    var day = d3.select("#switch .dataset").node().value;
    window.location.replace("?day=" + day);
  }

  return function(callback) {
    d3.select("#switch .dataset")
      .on("change", switch_dataset);


    function get_param(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")).replace("/", "");
    }
    var day = get_param("day");

    if (day != "") {
      d3.select("#switch .dataset").node().value = day;
    }
    callback(null)
  }
});
