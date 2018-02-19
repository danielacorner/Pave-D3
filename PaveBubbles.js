d3.csv("NOC_403.csv", function(error, datapoints) {
if (error) throw error;
var width = 1000,
    height = 500,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6; // separation between different-color nodes
    maxRadius = 15; // biggest circle

// Number of clusters, Colors, Scale range
var nestedIndustries = d3.nest()
      .key(function (d) { return d.industry })
      .entries(datapoints),
    // n = datapoints.length, // number of nodes / NOCs
    m = nestedIndustries.length; // number of clusters / industries
   
var color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(d3.range(m));

var minMaxWorkers = d3.extent(datapoints, function(d) {return d.workers});

// Sqrt scale because radius of a cicrle
var radiusScale = d3.scaleSqrt()
      .domain([0, minMaxWorkers[1]]).range([0,maxRadius]);

// The largest node for each cluster.
var clusters = new Array(m);
// Nodes: the data you want to display
var nodes = datapoints.map(function (el) { 
  var i = el.cluster,
      r = radiusScale(el.workers),
      d = {
        cluster: i, 
        radius: r, 
        industry: el.industry, 
        noc: el.noc
      };
  // if cluster uninitialized or if biggest radius so far, set as cluster's center
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
 })
// remove "undefined" industry
clusters.splice(0,1);  // (start at 0, delete 1)

// nodes = d3.nest()
//   .key(function(d) { return d.cluster; })
//   .entries(nodes);
  
// nodes = d3.hierarchy(nodes,function(d) { return d.values; });

// Use the pack layout to initialize node positions.
d3.pack(nodes)
  // .sort(null)
  .size([width, height])
  // .children(function(d) { return d.values; })
  .radius(function(d) { return d.radius * d.radius; });
  // .nodes({values: d3.nest()
  //   .key(function(d) { return d.cluster; })
  //   .entries(nodes)});

// Force simulation
var simulation = d3.forceSimulation()
  .nodes(nodes);
  
// Forces for the simulation
var forceXSeparate = d3.forceX(function(d) {
    if(d.cluster === 1) {
      return width / 4
    } else {
      return 3 * width / 4
    }
  }).strength(0.05)

var forceXCombine = d3.forceX(function(d) {
    return 0//width / 2
  }).strength(0.05)

var forceYCombine = d3.forceY(function(d) {
    return 0//height / 2
  }).strength(0.05)

var forceCollide = d3.forceCollide( function(d) { 
    return d.radius + 1; 
  })
  // .iterations(1); // ?

// Move d to be adjacent to the cluster node.
function forceCluster(alpha) {
  return function(d) {
    // patch: subtracted 1 to go from 1-10 to 0-9
    var cluster = clusters[d.cluster - 1];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  };
}

// Resolves collisions between d and all other circles.
// function forceCollide(alpha) {
//   var quadtree = d3.geom.quadtree(nodes);
//   return function(d) {
//     var r = d.radius + radiusScale(minMaxWorkers[1]) + Math.max(padding, clusterPadding),
//         nx1 = d.x - r,
//         nx2 = d.x + r,
//         ny1 = d.y - r,
//         ny2 = d.y + r;
//     quadtree.visit(function(quad, x1, y1, x2, y2) {
//       if (quad.point && (quad.point !== d)) {
//         var x = d.x - quad.point.x,
//             y = d.y - quad.point.y,
//             l = Math.sqrt(x * x + y * y),
//             r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
//         if (l < r) {
//           l = (l - r) / l * alpha;
//           d.x -= x *= l;
//           d.y -= y *= l;
//           quad.point.x += x;
//           quad.point.y += y;
//         }
//       }
//       return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
//     });
//   };
// }

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
         

// Prepare our physical space
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width/2 + "," + height/2 + ")")

//add encompassing group for the zoom 
var g = svg.append("g")
    .attr("class", "everything");

// Draw circles
var circles = g.append("g").attr("class", "circles")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", function(d) { return d.radius })
    .style("fill", function(d) { return color(d.cluster); });

var drag_handler = d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

drag_handler(circles);


simulation
  .force("x", forceXCombine)
  .force("y", forceYCombine)
  .force("collide", forceCollide)
  .force("cluster", forceCluster)
  .on('tick', tickActions);

// d3.queue() 
//   .defer(d3.csv, "NOC_403.csv") 
//   .await(ready)

// function ready (error, datapoints) {
//   if (error) throw error;


circles.transition()
    .duration(750)
    .delay(function(d, i) { return i * 5; })
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });



d3.select("#industry").on('click', function(d) {
  simulation
    .force("x", forceXSeparate)
    .alphaTarget(0.5)
    .restart()
})

d3.select("#combine").on('click', function(d) {
  simulation
    .force("x", forceXCombine)
    .alphaTarget(0.5)
    .restart
})



// simulation.nodes(datapoints)
//   .on('tick', tickActions)

// clock
function tickActions() {
  // update circle positions each tick of the simulation
  circles
      // .each(forceCluster(.5))
      // .each(forceCollide(.5))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

  // };
})