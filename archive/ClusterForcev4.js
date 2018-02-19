d3.csv("NOC_403.csv", function(error, datapoints) {
if (error) throw error;

var width = 960,
    height = 500,
    maxRadius = 10;

var m = 10; // number of distinct clusters

var minMaxWorkers = d3.extent(datapoints, function(d) {return d.workers});

var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(m));

// Sqrt scale because radius of a cicrle
var radiusScale = d3.scaleSqrt()
      .domain([10, minMaxWorkers[1]]).range([1,maxRadius]);



// The largest node for each cluster.
var clusters = new Array(m);

var nodes = datapoints.map(function(el) {
  var i = el.cluster,
      r = radiusScale(el.workers),
      d = {cluster: i, radius: r, 
        industry: el.industry, noc: el.noc, workers: el.workers,
        clicked: 0, mouseovered: 0};
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});


// Forces for the simulation
var forceXCombine = d3.forceX().strength(.3)
var forceYCombine = d3.forceY().strength(.3)
// default strength = -30, negative strength = repel, positive = attract
var forceGravity = d3.forceManyBody()
    .strength(function(d) {
    return -7 * d.radius
  })
var forceXSeparate = d3.forceX(function(d) {
    return ((width / m) * d.cluster - width/2) * 0.6
  }).strength(0.3)


// var forceCollide = d3.forceCollide()
//     .radius(function(d) { return d.radius + 1; })
//     .iterations(1);
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

// Append svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  // Append a group element to the svg & move to center
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
      d.mouseovered = 1;
      // highlight the current circle
      d3.select(this).attr("stroke", "black");
      div.transition()
         .duration(200)
         .style("opacity", .9);
      // Display NOC and Industry
      div.html("NOC " + d.noc + "<br/>Industry:<br/>" + d.industry)
        // Move div above mouse + radius
         .style("left", (d3.event.pageX) - 100 + "px")
         .style("top", (d3.event.pageY - 115) - d.radius + "px");
    })
    .on("mouseout", function(d) {
      // if clicked-on, don't transition out
      // if (d.clicked=1) return;
      d.mouseovered = 0;
      circles.attr("stroke", function(d) {
        if (d.mouseovered = 1) return "none"
      })
      div.transition()
         .duration(500)
         .style("opacity", 0);
    })
    .on("click", function(d) {
      //clicked on or clicked off?
      d.clicked = 1-d.clicked;
      if (d.clicked=1) {
        div.html("NOC " + d.noc + "<br/>Industry:<br/>" + d.industry
          + "<br/>Workers: " + d.workers)
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
      }
      if (d.clicked=0) {
        div.transition()
         .duration(500)
         .style("opacity", 0);
      }
    })
      

circles.transition()
    .duration(750)
    .delay(function(d, i) { return i * 4; })
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



d3.select("#industry").on('click', function(d) {
  simulation
    .force("x", forceXSeparate).alpha(0.8)
    .alphaTarget(0.001)
    .restart()
})

d3.select("#combine").on('click', function(d) {
  simulation
    .force("x", forceXCombine).alpha(0.4)
    .alphaTarget(0.001)
    .restart()
})



})