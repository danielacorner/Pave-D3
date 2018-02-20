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

var minMaxWorkers = d3.extent(datapoints, function(d) {return d.workers});
var minMaxWage = d3.extent(datapoints, function(d) {return d.wage});

console.log(minMaxWorkers); // ping here
console.log(minMaxWage);


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
        cluster: i, radius: r, 
        industry: el.industry, 
        noc: el.noc, 
        workers: el.workers,
        wage: el.wage,
      };
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});


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

console.log('ping');
console.log(Math.random());

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


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();    
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
} 

var drag_handler = d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

drag_handler(circles);



function tick() {
  circles
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}



function forceCluster(alpha) {
  for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.1; i < n; ++i) {
    node = nodes[i];
    cluster = clusters[node.cluster];
    node.vx -= (3*node.x - cluster.x) * k;
    node.vy -= (3*node.y - cluster.y) * k;
  }
}

var graphMode = 0;

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
d3.select("#thresholdSlider")
  .on('change', function(d) {
    console.log("changing!")
    // d3.selectAll("circle")
    //   .filter(function (d) { return d.workers > 200 })

    // // for (var i = 0; i < nodes.length; i++) {
    // //   if (nodes[i].value < thresh) {nodes.splice(nodes[i]);}
    // // }
    // update();
})

//Restart the visualisation after any node and link changes

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
// console.log("minWorkers"+minWorkers);
// console.log(maxWorkers);
// console.log(minWage);
// console.log(maxWage);
// var scaleX = d3.scaleLinear().domain(0, maxWorkers).range(0,width/2);
d3.select("#graph").on('click', function(d) {
  graphMode = 1-graphMode;
  

  // Add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // text label for the x axis
  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height +  20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

  simulation.alpha(0); // cool to 0 degrees
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
     // simulation.alphaTarget(0).restart();
  var xaxis = svg.append("svg")
})

// Sliders

////////// slider //////////

var svgSlider = d3.select("#slider")
    .append("svg")
    .attr("width", width/4)// + margin.left + margin.right)
    .attr("height", 20)

var slider = svgSlider.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + 0 + "," + height / 2 + ")");

// Slider scale
var x = d3.scaleLinear()
    .domain([0, 180])
    .range([0, 100000])
    .clamp(true);


slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { update(x.invert(d3.event.x)); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return d; }); //

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(function(d) { return d; })
    .attr("transform", "translate(0," + (-25) + ")")


function update(h) {
  // update position and text of label according to slider scale
  handle.attr("cx", x(h));
  label
    .attr("x", x(h))
    .text(h);

  // filter data set and redraw plot
  var newData = datapoints.filter(function(d) {
    return d.automationRisk < h;
  })
  reassignForces(newData);
}

function reassignForces(freshData) {
  
  var locations = d3.selectAll("circle")
    .data(datapoints);

  // if filtered dataset has more circles than already existing, transition new ones in
  locations.enter()
    .append("circle")
    .attr("class", "location")
    .attr("cx", function(d) { return x(d.automationRisk); })
    .attr("cy", height/2)
    .style("fill", function(d) { return d3.hsl(d.automationRisk, 0.8, 0.8)})
    .style("stroke", function(d) { return d3.hsl(d.automationRisk, 0.7, 0.7)})
    .style("opacity", 0.5)
    .attr("r", 8)
      .transition()
      .duration(400)
      .attr("r", 25)
        .transition()
        .attr("r", 8);

  // if filtered dataset has less circles than already existing, remove excess
  locations.exit()
    .remove();
}

// var x = d3.scaleLinear()
//     .domain([minWorkers, maxWorkers])
//     .range([0, width])
//     .clamp(true);


})