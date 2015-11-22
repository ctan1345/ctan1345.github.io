// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        d3: "d3",
        async: "async",
        spin: "spin",
        crossfilter: "crossfilter",
	colorbrewer: "colorbrewer",
	jquery: "jquery",
	chartist: "chartist"
    },
  shim: {
    'crossfilter': {
      deps: [],
      exports: 'crossfilter'
    }
  },
    urlArgs: "bust=" + (new Date()).getTime()
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
