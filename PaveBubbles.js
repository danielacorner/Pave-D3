var globaldata;

d3.csv("NOC_403.csv", function(error, datapoints) {
if (error) throw error;

var canvas = d3.select("#chart"),
    width = canvas.attr("width"), // set chart dimensions
    height = canvas.attr("height"),
    // ctx = canvas.node().getContext("2d"),
    maxRadius = 10; // Max circle radius

// function update() {
//   ctx.clearRect(0,0, width, height);

//   ctx.beginPath();
//   graph.nodes.forEach(drawNode);
//   ctx.fill();
// }

// function drawNode(d) {
//   ctx.moveTo(d.x, d.y);
//   ctx.arc(d.x, d.y, r, 0, 2* Math.PI);
// }
// update();

var m = 10; // number of distinct clusters

// Toggle for graph mode = off
var graphMode = 0;

var minMaxWorkers = d3.extent(datapoints, function(d) {return d.workers});
var minMaxWage = d3.extent(datapoints, function(d) {return d.wage});


var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(m));

// Scale Circle Area = Number of Workers
// Sqrt scale because radius of a cicrle
var radiusScale = d3.scaleSqrt()
      .domain([10, minMaxWorkers[1]])
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
        industry: el.industry, 
        noc: el.noc, 
        workers: el.workers,
        wage: el.wage,
        automationRisk: el.automationRisk,
      };
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});

globaldata = nodes;




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
    return ( (width / m) * 10 * Math.random() - width/2 ) //(width/m * d.cluster - width/2) *  
  }).strength(0.4)
var forceYSeparateRandom = d3.forceY(function(d) {
    return ( Math.random() * (height/2) * d.cluster/25 - 25 )
  }).strength(0.3)
// var forceX5By2 = d3.forceX(function(d) {
//     if (d.cluster/5<1) return d.cluster/5;
//     if (d.cluster/5>1) return d.cluster/5+1;
// })

var simulation = d3.forceSimulation()
    .nodes(nodes)
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
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

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
      // Display NOC and Industry
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
        + "<br/><br/><br/><br/><br/>Workers: " + d.workers)
        // Unfurl downward
        .transition()
        .duration(200)
        .style("height", "200px");
    })
      
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

//  data stores
  var graph = {
    nodes: nodes
  }
  var store = {
    nodes: nodes
  }

//adjust threshold
// d3.select("#thresholdSlider")
//   .on('change', function(d) {
//     console.log("changing!")
    // d3.selectAll("circle")
    //   .filter(function (d) { return d.workers > 200 })

    // // for (var i = 0; i < nodes.length; i++) {
    // //   if (nodes[i].value < thresh) {nodes.splice(nodes[i]);}
    // // }
    // update();
// })

//Restart the visualisation after any node and link changes

//TODO: hook to filter slider

function update() {

  //  UPDATE
  nodes = nodes.data(graph.nodes, function(d) { return d.noc })
  //  EXIT
  nodes.exit().remove();
  //  ENTER
  var newNode = nodes.enter().append("circle")
    // .attr("class", "node")
    .attr("r", function(d) { return d.radius })
    .attr("fill", function(d) { return color(d.group) })
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        )

      //  ENTER + UPDATE
  node = node.merge(newNode);
  // var filteredCircles = nodes
  //   .data(filteredNodes)
  //   .exit().remove();
  // simulation.start();
}

var minWorkers = d3.min(datapoints, function(d) {return d.workers}),
    maxWorkers = d3.max(datapoints, function(d) {return d.workers}),
    minWage = d3.min(datapoints, function(d) {return d.wage}),
    maxWage = d3.max(datapoints, function(d) {return d.wage});


///////////////// Graph Mode ////////////////////

// catch stored positions
var positionsX = {};
var positionsY = {};

d3.select("#graph").on('click', function(d) {
  // Toggle mode on or off
  graphMode = 1-graphMode;
  console.log("graphMode = ", graphMode);
  
////////////// GRAPH MODE ON!!! ////////////////
  if (graphMode == 1) {

    // cool to 0 degrees
    simulation.alpha(0); 

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
        // console.log(d.workers/maxWorkers); // TODO: maxWorkers is not accurate
        var i = d3.interpolate(d.x, d.workers/maxWorkers*70 - width/2 + 40);
        return function(t) { return d.cx = i(t); };
      })
        // set y values
      .attrTween("cy", function(d) { // TODO: maxWage is not accurate
        var i = d3.interpolate(d.y, d.wage/maxWage*250 - height/2 + 30);
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

  // Append an axis-holder group
  var axisHolder = d3.select("body").append("g")
            .attr("transform", "translate(" + (-width/2) + "," + (-height/2) + ")");


  // Scale the range of the data
  x.domain(d3.extent(globaldata, function(d) { return d.workers; })); //minmax workers
  y.domain([0, 1]); //minmax risk d3.max(globaldata, function(d) { return d.automationRisk; })

  console.log("hello ");

  // Add the x Axis
  axisHolder.append("g")
      .attr("transform", "translate(" + 20 + "," + (height-30) + ")")
      .call(d3.axisBottom(x).ticks(5));

   // text label for the x axis
  var textholder = axisHolder.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," + // margin.left
                           height + 200 + ")") // top
      .style("text-anchor", "middle")
      .text("X Axis Title");

  // Add the y Axis
  axisHolder.append("g")
      .attr("transform", "translate(" + 20 + "," + 0 + ")")
      .call(d3.axisLeft(y).ticks(10));

   // text label for the y axis
  axisHolder.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Y Axis Title");   

 


})

// Filters

var workersGreaterThan50 = nodes.filter(function(entry){
  return entry.id > 500;
})
// console.log("workersGreaterThan50: ", workersGreaterThan50);

circles.data(workersGreaterThan50).enter().append().exit().remove();

// var reformattedNodes = datapoints.map(function(entry){
//   return {
//         cluster: el.cluster, 
//         radius: radiusScale(el.workers), 
//         industry: el.industry, 
//         noc: el.noc, 
//         workers: el.workers,
//         wage: el.wage,
//       };
// });

// Sliders




})