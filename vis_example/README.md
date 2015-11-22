# Getting started
Make sure you are in the `vast2015` directory and then fire up a server.
```bash
    python -m SimpleHTTPServer 8888
```
Open `src/index.html` in your favourite browser.

Make use you download the csv files from VAST 2015 MC1 and MC2 and put it in the `comp5048/data` directory.
And the park map in the `comp5048/files` directory.
Your file system should look something like:
```
.
├── data
│   ├── comm-data-Fri.csv
│   ├── comm-data-Sat.csv
│   ├── comm-data-Sun.csv
│   ├── park-movement-Fri-FIXED-2.0.csv
│   ├── park-movement-Sat.csv
│   └── park-movement-Sun.csv
├── files
│   ├── Park Map.jpg
├── README.md
└── src
    ├── app
    │   ├── constants.js
    │   ├── init.js
    │   ├── main.js
    │   └── utils.js
    ├── app.js
    ├── index.html
    └── lib
        ├── d3.js
        ├── lodash.js
        └── require.js

```

# Structure of the app
The application uses [require.js](http://requirejs.org/) to manage Javascript dependencies.
So you have to include `define` function at the top of all your Javascript files:
```javascript
define(function(require) {
  var d3 = require("d3");
  var utils = require("./utils");

  /** Your code here **/
});
```
The `require("d3")` loads the d3.js library. You can use d3.js as normal.

The `require("utils")` loads the `utils.js` file which I have created to help loading the csv files.

You can ignore the technical details behind this.


# Creating new files
You can write your Javascript in `main.js`.
However, the preferred way is to create a new Javascript file and write your code there.
Then you can call the script from `main.js`.
See how `utils.js` is called in `main.js` for details.

# Listening to the changes
When the time pass by, the value of communication data changes.
You can capture the new data by listening to the datastore.
This is also called Pub/Sub pattern in OO design.
For example:
```javascript
  function update(data) {
    /** your code here **/
    console.log(data);
  }
  store.subscribe(update);
```
By simply doing this, you don't have to worry about how the timeline is handled.
You will get a new copy of data passed to update() when you move the timeline.
You just have to worry about how to visualise the data.

I returned a function in `communication.js` so that I can use handle asynchronous call effectively.
```javascript
  return function(svg, callback) {
      var g = svg.append("g");
      store.subscribe(update.bind(null, g));
      // This indicates the end of the function
      callback(null);
  };
```
The bind() passes an argument to the update() method, and thus creates a partial function.

The enter() and exit() function in d3 is essential in creating dynamic visualisation.
In short, you will need to remove the line/point/bar (depending on the type of visualisation) after you called exit().
And append new line/point/bar after you enter().
```javascript
  lines.exit()
    .remove();
  lines.enter()
    .append("line")
```


# Visualisation
## Communication data
We will make use of both movement dataset from MC1 and communication dataset from MC2.
To visualise the communication patterns we first plot the person's location using coordinates from movement dataset.
If person A sends a message to person B, then there will be a red link between A and B.
We will also check if person B responds to person A.
If person B responds to the message within 5 minutes, we will draw a blue link between B and A.

## Statistics
We will plot the number of communications occurs at each timestep (per minute).
This will show when the peak of communication traffic happens.

## People with unknown locations
Currently I am trying to figure out a way to deal with these missing data.
They may have special meaning in the system.
We need to investigate on this.
```javascript
{
  sender: {
    839736: 19,
    1278894: 60
  },
  receiver: {
    839736: 5279,
    1278894: 35103,
    external: 10030
  }
}
```
