var graph, store; // graph is displayed, store holds all nodes

d3.csv("NOC_403.csv", function(error, datapoints) {
if (error) throw error;

var nodeByID = {};

datapoints.forEach(function(n) {
  nodeByID[n.id] = n;
});

// g.links1.forEach(function(l) {
//  l.sourceGroup = nodeByID[l.source].group.toString();
//  l.targetGroup = nodeByID[l.target].group.toString();
// });

// graph = datapoints;
// store = $.extend(true, {}, datapoints);


var canvas = d3.select("#chart"),
    margin = {left: 40, top: 40},
    width = canvas.attr("width"), // set chart dimensions
    height = canvas.attr("height"),
    // ctx = canvas.node().getContext("2d"),
    maxRadius = 30; // Max circle radius

var m = 10; // number of distinct clusters

var maxWorkers = 120415; // patch: d3.max(datapoints, function(d) { return d.workers })

// Toggle for graph mode = off
var graphMode = 0;


var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(m));

// Scale Circle Area = Number of Workers
// Sqrt scale because radius of a cicrle
var radiusScale = d3.scaleSqrt()
      .domain([10, maxWorkers])
      .range([1,maxRadius]);


// The largest node for each cluster.
var clusters = new Array(m);

// nodes: the data you want to display.
var nodes = datapoints.map(function(el) {
  var i = el.cluster,
      r = radiusScale(el.workers),
      d = {
        id: el.id,
        cluster: i, 
        radius: r, 
        job: el.job,
        industry: el.industry, 
        noc: el.noc, 
        workers: el.workers,
        wage: el.wage,
        automationRisk: el.automationRisk,
      };
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});


// store nodes for drawing axes in graph mode
graph = nodes;
store = nodes;


// Forces for the simulation
var forceXCombine = d3.forceX().strength(.3)
var forceYCombine = d3.forceY().strength(.3)
// default strength = -30, negative strength = repel, positive = attract
var forceGravity = d3.forceManyBody()
    .strength(function(d) { return -7 * d.radius })
var forceXSeparate = d3.forceX(function(d) {
    return ((width / m) * d.cluster - width/2) * 1
  }).strength(0.3)
var forceYSeparate = d3.forceY(function(d) {
    return ((height / 2) * d.cluster/50)
  }).strength(0.3)
var forceXSeparateRandom = d3.forceX(function(d) {
    Math.random();
    return ( (width / m) * 10 * Math.random() - width/2 )
  }).strength(0.4)
var forceYSeparateRandom = d3.forceY(function(d) {
    return ( Math.random() * (height/2) * d.cluster/25 - 25 )
  }).strength(0.3)
// var forceX5By2 = d3.forceX(function(d) {
//     if (d.cluster/5<1) return d.cluster/5;
//     if (d.cluster/5>1) return d.cluster/5+1;
// })


// The force simulation
var simulation = d3.forceSimulation()
    .nodes(store)
    // .force("center", d3.forceCenter())
    .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);

// Tooltip div
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

 // Append a group element to the svg & move to center
var svg = d3.select("#chart")
      .append('g')
      .attr('transform', 'translate('+width/2+','+height/2+')');


















// Add the circles with tooltips
var circles = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 0) // start at 0 radius and transition in
    .style("fill", function(d) { return color(d.cluster); })
    // Tooltips
    .on("mouseover", function(d) {
      // highlight the current circle
      // clicked = 0;
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      div.transition()
         .duration(200)
         .style("opacity", .9)
         .style("height", "60px");
      // Display NOC, Industry
      div.html("NOC " + d.noc + "<br/>Industry:<br/>" + d.industry)
        // Move div above mouse by "top" + radius and right by "left"
        .style("left", (d3.event.pageX) + 20 + "px")
        .style("top", (d3.event.pageY - 80) - d.radius + "px");
    })
    .on("mouseout", function(d) {
      // clicked = 0;
      d3.select(this).attr("stroke", "none");
      div.transition()
         .duration(500)
         .style("opacity", 0);
    })
    .on("click", function(d) {
      // clicked = 1-clicked;
      // if(clicked=1) {}
      div.html("NOC " + d.noc + "<br/>Industry:<br/>" + d.industry
        // Insert extra info to display on click
        + "<br/><br/>"+ d.job +"<br/><br/>"
        + "Automation Risk: " + d.automationRisk 
        + "<br/><br/>Workers: " + d.workers)
        // Unfurl downward
        .transition()
        .duration(200)
        .style("height", "200px");
    })

console.log(typeof(circles));
console.log(circles);
console.log(circles.nodes);
      
// transition in radii from 0
circles.transition()
    .duration(1000)
    .delay(function(d, i) { return i * 2})
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });


// Enable dragging
function dragstarted(d) {
    if (!d3.event.active && graphMode == 0) simulation.alphaTarget(0.3).restart();    
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active && graphMode == 0) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
} 

var drag_handler = d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

drag_handler(circles);


// Update the positions each tick
function tick() {
  circles
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}


// force the circles toward their cluster nodes
function forceCluster(alpha) {
  for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.1; i < n; ++i) {
    node = nodes[i];
    cluster = clusters[node.cluster];
    node.vx -= (3*node.x - cluster.x) * k;
    node.vy -= (3*node.y - cluster.y) * k;
  }
}


// Buttons
d3.select("#industry").on('click', function(d) {
  simulation
    .force("x", forceXSeparate).alpha(0.8)
    .force("y", forceYSeparate).alpha(0.8)
    .alphaTarget(0.001)
    .restart()
})

d3.select("#random").on('click', function(d) {
  simulation
    .force("x", forceXSeparateRandom).alpha(0.8)
    .force("y", forceYSeparateRandom).alpha(0.8)
    .alphaTarget(0.001)
    .restart()
})

d3.select("#combine").on('click', function(d) {
  if (graphMode==0) {
    simulation
      .force("x", forceXCombine).alpha(0.4)
      .force("y", forceYCombine).alpha(0.4)
      .alphaTarget(0.001)
      .restart()
  } else {
    // simulation.alpha(0.01).restart();
    graphMode = 0;
    circles.transition()
      .duration(250)
      .attrTween("cx", function(d) {
        var i = d3.interpolate(d.x, d.x/2);
        return function(t) { return d.cx = i(t); };
      })
      .attrTween("cy", function(d) {
        var i = d3.interpolate(d.y, d.y/2); 
        return function(t) { return d.cy = i(t); };
      });
    simulation
      .force("x", forceXCombine).alpha(0.4)
      .force("y", forceYCombine).alpha(0.4)
      .alphaTarget(0.001)
      .restart()
  }
})


// TODO: maxWorkers, maxWage not working
var minWorkers = d3.min(datapoints, function(d) {return d.workers}),
    minWage = d3.min(datapoints, function(d) {return d.wage}),
    maxWage = 116.18;//d3.max(datapoints, function(d) {return d.wage});


// ////////////////// FREEZE ////////////////////////
d3.select("#freeze").on('click', function(d) {
  simulation.stop();
});

///////////////// Graph Mode ////////////////////

// catch stored positions
var positionsX = {};
var positionsY = {};

d3.select("#graph").on('click', function(d) {
  // Toggle mode on or off
      simulation.alpha(0); 

  graphMode = 1-graphMode;
  console.log("graphMode = ", graphMode);
  
  ////////////// GRAPH MODE ON!!! ////////////////
  if (graphMode == 1) {

    // cool to 0 degrees
    simulation.stop();

    // store previous positions
    nodes.forEach(function(d) {
      positionsX[d.id] = d.x;
    });
    nodes.forEach(function(d) {
      positionsY[d.id] = d.y;
    });

    // transition circles to graph positions
    circles.transition()
      .duration(750)
        // set x values
      .attrTween("cx", function(d) { // transition x position to...
        var i = d3.interpolate(d.x, d.workers/maxWorkers*width*0.95 - width/2 + 10);
        return function(t) { return d.cx = i(t); };
      })
        // set y values
      .attrTween("cy", function(d) {
        var i = d3.interpolate(d.y, d.wage/maxWage*height*0.95 - height/2 + 10);
        return function(t) { return d.cy = i(t); };
       });
       // set styles
       //.styleTween(...automation risk colour scale)

  }

  //////////////// Graph mode off. ///////////////////

  // If turning off:
  if (graphMode == 0) {
    // Transition back to original positions
    circles.transition()
    .duration(750)
      // set x, y values
    .attrTween("cx", function(d) { // transition x position to...
      // previous positions
      var i = d3.interpolate(d.cx, positionsX[d.id])
      return function(t) { return d.cx = i(t); };
    })
    .attrTween("cy", function(d) { // transition y position to...
      // previous positions
      var i = d3.interpolate(d.cy, positionsY[d.id]);
      return function(t) { return d.cy = i(t); };
     });
     
    // start the simulation after the transition delay
    setTimeout(function() {
      simulation.alphaTarget(0.3).restart();
    }, 750);
    
    return;
  }; // transition back to clusters
  


  // TODO: modularize graph mode in js folder
  // $.getScript("./js/graph-module.js");



  //////////////////////// Axes ////////////////////////////

  // Set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);


  // Add an axis-holder group to the body
  var axisHolder = d3.select("body").append("g")
            .attr("transform", "translate(" + (-width/2) + "," + (-height/2) + ")");

  // Scale the range of the data (using globally-stored nodes)
  // TODO: modularize for axis selection
  x.domain([0, maxWorkers]); //minmax workers
  y.domain([0, 1]); //minmax risk d3.max(store, function(d) { return d.automationRisk; })

  // Add the X Axis
  axisHolder.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

  // Add the Y Axis
  axisHolder.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).ticks(5));

   // text label for the x axis
  axisHolder.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," + // margin.left
                           height + ")") // top
      .style("text-anchor", "middle")
      .text("X Axis Title");

   // text label for the y axis
  axisHolder.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Y Axis Title");   

})














///////////////////////////////// Filters ////////////////////////////////////


//////////////// Filter Slider //////////////////////

var sliderSVG = d3.select("#slider").append("svg")
  .attr("width", 250)
  .attr("height", 50)

// filtered IDs
filterList = [];

function filterNodes(workersAmt) { // return nodes with workers > "workersAmt"
  
  nodes.forEach(function(d) {
    // put you on the list if condition satisfied
    if (d.workers < workersAmt && !filterList.includes(d.id)) { 
      filterList.push(d.id); }
    // take you off the list if condition satisfied
    if (d.workers >= workersAmt && filterList.includes(d.id)) { 
      filterList.splice(filterList.indexOf(d.id), 1); }
    // // if you're not on the list & you're filtered, do nothing
    // if (!filterList.includes(d.id) && d.filtered) { return; }
    // // if you're on the list & you're not filtered, filta yoself
    // else if (filterList.includes(d.id) && !d.filtered) {
  });

  //  add and remove nodes from data based on filters
  store.forEach(function(n) {
    // if you're not on the filter list
    if (!filterList.includes(n.id) && !graph.includes(n)) {
      // n.filtered = false; // put you on the graph (start graph empty? or check)
      graph.push($.extend(true, {}, n));
    } else if (filterList.includes(n.id) && graph.includes(n)) {
      // n.filtered = true;
      graph.forEach(function(d, i) {
        if (n.id === d.id) {
          graph.splice(i, 1);
          }
        });
      }
    });

  return graph;

}

// Initial values on page load = ">= min workers"
filterNodes(0);//d3.min(datapoints, function(d) { return d.workers }));


// var node = circles.selectAll(".node");
// console.log("node: ", node, typeof(node));

var sliderScale = d3.scaleLinear()
  .domain([0, maxWorkers]) // Red component goes from 0 to 255
  .range([0, 200]) // Width of slider is 200 px
  .clamp(true);



var slider = sliderSVG.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

slider.append("line")
  .attr("class", "track")
  .attr("x1", sliderScale.range()[0])
  .attr("x2", sliderScale.range()[1])
  .select(function() {
    return this.parentNode;
  })
  .append("line")
  .attr("x1", sliderScale.range()[0])
  .attr("x2", sliderScale.range()[1])
  .attr("class", "track-inset")
  .select(function() {
    return this.parentNode;
  })
  .append("line")
  .attr("x1", sliderScale.range()[0])
  .attr("x2", sliderScale.range()[1])
  .attr("class", "track-overlay")
  .call(d3.drag()
    .on("start.interrupt", function() {
      slider.interrupt();
    })
    .on("start drag", function() {
      // console.log("filtering for workers > ", sliderScale.invert(d3.event.x));
      updateNodes(sliderScale.invert(d3.event.x));
    }));

var handle = slider.insert("circle", ".track-overlay")
  .attr("class", "handle")
  .attr("r", 9);




function updateNodes(h) {
  //  UPDATE


  console.log("circles pre-update:", circles);


//  UPDATE
  circles = circles.data(graph, function(d) { return d.id;});
  
  console.log("circles post-update:", circles);

  //  EXIT
  circles.exit().remove();

  console.log("circles post-exit:", circles);


  console.log("circles enter:", circles.enter());
  //  ENTER
  var newCircles = circles.enter().append("circle")
    // .attr("class", "node")
    .attr("r", function(d) {return d.radius})
    .attr("fill", function(d) {return color(d.cluster);})

  drag_handler(newCircles);

  console.log("circles pre-merge:", circles);


  //  ENTER + UPDATE
  circles = circles.merge(newCircles);


  console.log("circles post-merge:", circles);



  // var newCircles = circles.selectAll("circle").data(filterNodes(h));
  //  EXIT
  // newCircles.exit().attr("r",0);
  // newCircles.exit().remove();
  console.log("newCircles exit:", newCircles.exit());





  // use the slider handle
  handle.attr("cx", sliderScale(h));

  //  UPDATE
  // circles = circles.data(filterNodes(h));

  simulation.nodes(filterNodes(h))
    .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);

  // drag_handler(enteringCircles);

  simulation.alphaTarget(0.3).restart();
  // console.log("filterNodes:", filterNodes(h));
  // console.log("circles pre-remove:", circles);

  // circles.exit().remove();

  // console.log("circles post-remove:", circles);

  // EXIT transition
  // var exitTransition = d3.transition().each(function() {
  //   circles.exit()
  //   .transition().duration(200)
  //     .attr("r", function(d) { return d.radius + 2 })
  //     .remove();
  // })



  // TODO: as the slider handle moves, the circles 
  //       change positions & the tooltips don't update

  // var enterTransition = exitTransition.transition().each(function() {
  //   circles.enter().append("circle")
  //   .transition().duration(200)
  //     .attr("r", function(d) { return d.radius + 2 })
  //     ;
  // })





  // var enteringCircles;
  // ENTER transition -- uses selection.transition.transition to chain transitions (redundant?)
  // var enterTransition = exitTransition.transition().each(function() {
    // newCircles.enter().append("circle")

    // Add the circles with tooltips
    // enteringCircles = svg.selectAll("circle")

    // circles = circles.data(filterNodes(h));
    // var exitTransition = svg.selectAll("circle").data(filterNodes(h)).exit().remove();

    // var enterTransition = exitTransition.transition().each(function(){
    


      // var test1 = sliderSVG.append("circle")
      //   .attr("r",500).style("fill", "red")
      //   .attr("cx", 20);

      // test1.remove();






    // TODO: transition entering circles in
    // TRY: don't exit & remove, just transition radius to 0??!











    // circles = circles.merge(newCircles);


      // .style("fill", function(d) { return color(d.cluster); })
      // .attr("r", 100)
      // .attr("cx", 100)
      // .transition()
      //   .duration(500)
      //   .delay(function(d, i) { return i * 2})
      //   .attrTween("r", function(d) {
      //     var i = d3.interpolate(0, d.radius);
      //     return function(t) { return d.radius = i(t); };
      //   });
  // })

  // transition in radii from 0


  // circles.transition()
  //   .duration(1000)
  //   .delay(function(d, i) { return i * 2})
  //   .attr("r", function(d) {return d.radius});


    // .attrTween("r", function(d) {
    //   var i = d3.interpolate(0, d.radius); //d.radius not accurate -- fetch from store?
    //   return function(t) { return d.radius = i(t); };
    // });


  // newCircles.enter().append("circle").transition()
  //   .duration(750)
  //   .delay(function(d, i) { return i * 2})
  //   .attrTween("r", function(d) {
  //     var i = d3.interpolate(0, d.radius);
  //     return function(t) { return d.radius = i(t); };
  //   });

    // .attr("class", "node")
    // .attr("r", function(d) { return d.radius })
    // .attr("fill", function(d) { return color(d.group) })


  //  ENTER + UPDATE
  // circles = circles.merge(newCircles);


}

})