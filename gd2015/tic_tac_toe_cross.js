function determine_winning_states(states, player) {
  winning_states = [];
  states.forEach(function(state, index) {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        // Check row
        if (state[i][j] != player) {
          break;
        }
        if (j == 2) {
          winning_states.push(index);
        }
      }
      // Check column
      for (var j = 0; j < 3; j++) {
        if (state[j][i] != player) {
          break;
        }
        if (j == 2) {
          winning_states.push(index);
        }
      }
    }
    // Check diagonal
    for (var i = 0; i < 3; i++) {
      if (state[i][i] != player) {
        break;
      }
      if (i == 2) {
        winning_states.push(index)
      }
    }
    // Check anti-diagonal
    for (var i = 0; i < 3; i++) {
      if (state[i][2-i] != player) {
        break;
      }
      if (i == 2) {
        winning_states.push(index)
      }
    }
  });

  return winning_states;
}

function determine_drawing_states(states) {
  draw_states = []
  states.forEach(function(state, index) {
    var draw = true;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        if (state[i][j] == '-') {
          draw = false;
          break;
        }
      }
      if (!draw) {
        break;
      }
    }
    if (draw) {
      draw_states.push(index);
    }
  });

  return draw_states;
}

function sign(n) {
  return n < 0 ? -1 : n > 0 ?  1 : 0;
}

function calculate_depth(state) {
  var count = 0;
  _.forEach(state.split(''), function(c) {
    if (c != '-') {
      count += 1;
    }
  });
  return count;
}

/**
 * Calculate the crossing between two edges
 * Params:
 *  - e1: the first edge
 *  - e2: the second edge
 *  - l2: list of vertices of the second layer
*/
function calculate_crossings(e1, e2, l1, l2) {
  if (e1.from.depth != e2.from.depth) {
    throw "The depth of the first layer does not match";
  }

  if (e1.to.depth != e2.to.depth) {
    throw "The depth of the second layer does not match";
  }

  if (e1.from == e2.from && e1.to == e2.to) {
    return 0;
  }

  var a = sign(l1.indexOf(e2.from) - l1.indexOf(e1.from));
  var b = sign(l2.indexOf(e2.to) - l2.indexOf(e1.to));

  return Math.max(0, Math.abs(e2.offset - e1.offset + (b-a)/2) + (Math.abs(a)+Math.abs(b))/2 - 1)
}

var margin = {top: 30, right: 40, bottom: 40, left: 80};
var width = 1500;
var height = 1200;

var diagonal = d3.svg.diagonal()

var opacity_scale = d3.scale.linear().range([0.1, 0.2]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var colorscale = d3.scale.linear()
    .range([0,255]);

var depth = 7;

var g = new dagreD3.graphlib.Graph()
            .setGraph({})
            .setDefaultEdgeLabel(function() { return {}; });
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
  //.append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//for (var i = 0; i < depth; i++) {
  //y_offset = i * height/depth - 50;
  //var color = null;

  //if (i % 2 == 0) {
    //color = "#C9E2F5";
  //} else {
    //color = "#E8C5CE";
  //}
  //svg.append("rect")
    //.attr("width", "100%")
    //.attr("height", "130px")
    //.attr("fill", color)
    //.attr("transform", "translate(" + margin.left + "," + (margin.top + y_offset) + ")");
//}

d3.text("./tictactoe.txt", function(data) {
  data = data.split("\n");
  vertices = data.slice(0, 765);
  edges = data.slice(765, data.length-1);

  var states = [];
  vertices.forEach(function(node, i) {
    states.push([]);
    for (var j = 1; j < 4; j++) {
      var row = node.slice(3 * j - 3, 3 * j);
      states[i].push(row.split(""));
    }
  });

  x_winning_states = determine_winning_states(states, 'X');
  o_winning_states = determine_winning_states(states, 'O');
  drawing_states = _.difference(determine_drawing_states(states), x_winning_states);

  var tmp = [];
  _.forEach(vertices, function(vertex, i) {
    var configuration = vertex.trim();
    var depth = calculate_depth(configuration);
    var win = null;
    if (_.includes(x_winning_states, i)) {
      win = {win: "X"};
    } else if (_.includes(o_winning_states, i)) {
      win = {win: "Y"};
    } else if (_.includes(drawing_states, i)){
      win = {win: "D"};
    } else {
      win = {win: null};
    }
    tmp.push(_.assign({configuration: configuration, depth: depth}, win));
  })

  vertices = tmp;

  var root = vertices[0];

  var links = [];
  _.forEach(edges, function(edge) {
    edge = edge.replace(/(\(|\))/g, "").split(",").map(Number);
    var from = edge[0],
        to = edge[1];

    var first = vertices[from-1],
        second = vertices[to-1];

    if (first) {
      (first.to || (first.to = [])).push(second);
      (second.from || (second.from = [])).push(first);
      links.push({
        source: first,
        target: second
      });
    }

  });

  x_winning_states.forEach(function(i) {
    vertices[i].win = 'X';
  });
  o_winning_states.forEach(function(i) {
    vertices[i].win = 'O';
  });
  drawing_states.forEach(function(i) {
    vertices[i].win = 'D';
  });

  var x_winning_vertices = [].map.call(x_winning_states, function(index) {
    vertices[index].x_score = 1;
    return vertices[index];
  });
  var o_winning_vertices = [].map.call(o_winning_states, function(index) {
    vertices[index].o_score = 1;
    return vertices[index];
  });
  var drawing_vertices = [].map.call(drawing_states, function(index) {
    vertices[index].d_score = 1;
    return vertices[index];
  });

  function update_scores(nodes, key) {
    if (!nodes) {
      return;
    }
    _.forEach(nodes, function(vertex) {
      _.forEach(vertex.from, function(parent) {
        parent[key] = parent[key] ? parent[key] + 1 : 2;
        update_scores([parent], key);
      });
    });
  }

  update_scores(x_winning_vertices, "x_score");
  update_scores(o_winning_vertices, "o_score");
  update_scores(drawing_vertices, "d_score");

  var top_scores = {
    "x_score": root.x_score,
    "o_score": root.o_score,
    "d_score": root.d_score
  };

  opacity_scale.domain([-2000, -60]);

  // Filtering
  var filtered_edges = [];
  var checked = {};
  function filter_edges(node, condition) {
    if (!node.from) {
      return;
    }
    var max_score_parent = _.max(node.from, function(parent) {
      return parent[condition];
    });
    if (max_score_parent && max_score_parent != -Infinity) {
      filtered_edges.push({
        source: max_score_parent,
        target: node
      });

      //if (condition == 'x_score') {
        //max_score_parent.on_blue_path = true;
        //node.on_blue_path = true;
      //}
    }
    _.forEach(node.from, function(parent) {
      if (!checked[parent.configuration + condition]) {
        checked['' + parent.configuration + condition] = true;
        filter_edges(parent, condition);
      }
    });
  }
  filtered_edges = links;

  //_.forEach(x_winning_vertices, function(vertex) {
    //_.forEach(vertex.from, function(parent) {
      //filtered_edges.push({
        //source: parent,
        //target: vertex
      //});
      //filter_edges(parent, "x_score");
    //});
  //});
  //_.forEach(o_winning_vertices, function(vertex) {
    //_.forEach(vertex.from, function(parent) {
      //filtered_edges.push({
        //source: parent,
        //target: vertex
      //});
      //filter_edges(parent, "o_score");
    //});
  //});
  //_.forEach(drawing_vertices, function(vertex) {
    //_.forEach(vertex.from, function(parent) {
      //filtered_edges.push({
        //source: parent,
        //target: vertex
      //});
      //filter_edges(parent, "d_score");
    //});
  //});

  var N = 2;
  // Important paths
  function find_important_paths(node, condition) {
    var children = node.to;
    if (!children) {
      return;
    }
    children = _.sortBy(children, function(child) {
      return -child[condition];
    });
    var important_child = children[0];
    important_child.blue_important = true;

    find_important_paths(important_child, condition);
  }
  for (var i = 0; i < N; i++) {
    root.to[i].blue_important = true;
    find_important_paths(root.to[i], "x_score");
  }
  root.blue_important = true;

  //filtered_edges = _.unique(filtered_edges, function(edge) {
    //return edge.source.configuration && edge.target.configuration;
  //});
  console.log(filtered_edges);

  _.forEach(vertices, function(vertex) {
    g.setNode(vertex.configuration, {
      label: vertex.configuration,
      x_score: vertex.x_score,
      o_score: vertex.o_score,
      d_score: vertex.d_score,
      blue_important: vertex.blue_important,
      win: vertex.win
    });
  });

  _.forEach(filtered_edges, function(edge, i) {
    g.setEdge(edge.source.configuration, edge.target.configuration);
  });

  var render = new dagreD3.render();

  render(d3.select("sdf"), g);

 var nodes_data = [];
 _.forIn(g._nodes, function(v, k) {
   nodes_data.push({
     label: v.label,
     win: v.win,
     blue_important: v.blue_important,
     x_score: v.x_score ? v.x_score : 0,
     o_score: v.o_score ? v.o_score : 0,
     d_score: v.d_score ? v.d_score : 0,
     x: v.x / 18,
     y: v.y * 1.5
   });
 });

 console.log(nodes_data);

 var edges_data = [];
 _.forIn(g._edgeObjs, function(v, k) {
   var from = v.v,
       to = v.w;

   var source = _.find(nodes_data, function(vertex) {
     return vertex.label == from;
   });

   var target = _.find(nodes_data, function(vertex) {
     return vertex.label == to;
   });

   edges_data.push({
     source: source,
     target: target,
     x_score: source.x_score,
     o_score: source.o_score,
     d_score: source.d_score,
     blue_important: source.blue_important && target.blue_important
   });
   //if (source.on_blue_path && target.on_blue_path) {

   //}
 });

 function find_secondary_path(vertex, condition) {
   if (!vertex.from) {
     return;
   }
   var important_parent =_.first(_.sortBy(vertex.from, function(parent) {
     return -parent[condition];
   }));

   //console.log(important_parent);
   //console.log(vertex);
   console.log(edges_data);

   _.find(edges_data, function(edge) {
     return edge.source.label == important_parent.configuration && edge.target.label == vertex.configuration;
   }).secondary = true;

   find_secondary_path(important_parent, condition);
 }

 _.forEach(x_winning_vertices, function(vertex) {
    //find_secondary_path(vertex, "x_score");
 });

 _.find(edges_data, function(edge) {
   return edge.source.label == '-------OX' && edge.target.label == '-----XXO-';
 }).blue_important = false;
 _.find(edges_data, function(edge) {
   return edge.source.label == '-------OX' && edge.target.label == '----X--OX';
 }).blue_important = false;
 //_.find(edges_data, function(edge) {
   //return edge.source.label == '-----XXOO' && edge.target.label == '--OX-XX-O';
 //}).blue_important = false;


  var node = svg.selectAll("g.node")
      .data(nodes_data)
      .enter()
      .append("g")
      .attr("class", function(d) {
        return d.win == null ? "node" : d.win == 'X' ? "node x-win" : d.win == 'O' ? "node o-win" : "node draw";
      })
      .attr("transform", function(d) {
        return "translate(" + (d.x) + "," + (d.y) + ")";
      })
      .style({font: "10px sans-serif"});

  node.append("circle").attr("r", 4.5)
      .style({
        stroke: "steelblue", "stroke-width": "1.5px"
      })
      .attr("data", function(d) {
        return d.label;
      })
      .attr("x_score", function(d) {
        return d.x_score;
      })
      .attr("o_score", function(d) {
        return d.o_score;
      })
      .attr("d_score", function(d) {
        return d.d_score;
      });

  var link = svg.selectAll("path.link")
      .data(edges_data)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", diagonal)
      .style({fill: "none", "stroke-width": "1.5px"})
      .style("stroke", function(d) {
        if (d.blue_important) {
          return "blue";
        } else if (d.secondary) {
          return "steelblue";
        } else {
          return "#ccc";
        }
      })
      .style("stroke-opacity", function(d) {
        if (d.blue_important) {
          return 1;
        } else if (d.secondary) {
          return 1;
        } else {
          if (d.x_score > 1800) {
            return 0.5;
          } else if (d.x_score > 1000) {
            return 0.2;
          }
          if (d.x_score > 1 && d.x_score < 400) {
            return 0.05;
          } else if (!d.x_score || d.x_score < 2){
            return 0.5;
          } else {
            return opacity_scale(-d.x_score);
          }
        }
      });

  // Update the score of the nodes
  var min_score = null;
  var max_score = null;

  //var diagonal = d3.svg.diagonal()
      //.projection(function(d) {
        //return [d.x * 50, d.y * 50];
      //});

  //var links = [];
  //_.forEach(nodes, function(node) {
    //if (node.from != null) {
      //_.forEach(node.from, function(parent) {
        //links.push({
          //source: parent.first,
          //target: node
        //});
      //});
    //}
  //});
  //console.log(links);
  //var link = svg.selectAll("path.link")
      //.data(links)
      //.enter()
      //.append("path")
      //.attr("class", "link")
      //.attr("d", diagonal)
      //.style({fill: "none", stroke: "#ccc", "stroke-width": "1.5px"});
  $('svg .node').mouseover(function() {

      var data = $(this).children('circle').attr('data');
      var x_score = $(this).children('circle').attr('x_score');
      var o_score = $(this).children('circle').attr('o_score');
      var d_score = $(this).children('circle').attr('d_score');
      var sum = [x_score, o_score, d_score].reduce(_.add);

      var tooltip = "<div'>";
      for (var j = 1; j < 4; j++) {
        var row = data.substring(3 * j - 3, 3 * j);
        tooltip += "<p class='tooltip-grid'>======</p>";
        tooltip += "<p class='tooltip-content'>" + row.split("").join(" | ") + "</p>";
      }
      tooltip += "<p class='tooltip-grid'>======</p>";
      tooltip += "<p class='tooltip-content'>x-score: " + x_score + " (" + (x_score/sum).toFixed(2) + "%)</p>";
      tooltip += "<p class='tooltip-content'>o-score: " + o_score + " (" + (o_score/sum).toFixed(2) + "%)</p>";
      tooltip += "<p class='tooltip-content'>d-score: " + d_score + " (" + (d_score/sum).toFixed(2) + "%)</p>";
      tooltip += "</div>";
      $('.tooltip').html(tooltip);
  });

});
d3.select(self.frameElement).style("height", height + "px");
