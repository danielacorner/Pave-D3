d3.csv("NOC_403.csv", function(error, datapoints) {
if (error) throw error;

var canvas = d3.select("#chart"),
    width = canvas.attr("width"),
    height = canvas.attr("height"),
    // ctx = canvas.node().getContext("2d"),
    // Max circle radius
    maxRadius = 10;

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

var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(m));

// Sqrt scale because radius of a cicrle
var radiusScale = d3.scaleSqrt()
      .domain([10, minMaxWorkers[1]])
      .range([1,maxRadius]);


var slider = d3.select("#chart")
      .append("svg")
      .attr("height", 30)
      .attr("width", 300);

var x = d3.scaleLinear()
    .domain([0, 180])
    .range([0, 100000])
    .clamp(true);

// var slider = sliderG.append("svg")
//     .attr("class", "slider")
//     .attr("transform", "translate(" + margin.left + "," + sliderHeight / 2 + ")");

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
        .on("start drag", function() { hue(x.invert(d3.event.x)); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
  .data(x.ticks(10))
  .enter().append("text")
    .attr("x", x)
    .attr("text-anchor", "middle")
    .text(function(d) { return d + "°"; });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

// slider.transition() // Gratuitous intro!
//     .duration(750)
//     .tween("hue", function() {
//       var i = d3.interpolate(0, 70);
//       return function(t) { hue(i(t)); };
//     });

function hue(h) {
  handle.attr("cx", x(h));
  sliderSvg.style("background-color", d3.hsl(h, 0.8, 0.8));
}

// The largest node for each cluster.
var clusters = new Array(m);

var nodes = datapoints.map(function(el) {
  var i = el.cluster,
      r = radiusScale(el.workers),
      d = {cluster: i, radius: r, 
        industry: el.industry, noc: el.noc, workers: el.workers,
        //clicked: 0, mouseovered: 0
      };
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
    return ((width / m) * d.cluster - width/2) * 1
  }).strength(0.3)
var forceYSeparate = d3.forceY(function(d) {
    return ((height / 2) * d.cluster/50)
  }).strength(0.3)
// var forceX5By2 = d3.forceX(function(d) {
//     if (d.cluster/5<1) return d.cluster/5;
//     if (d.cluster/5>1) return d.cluster/5+1;
// })


// var forceCollide = d3.forceCollide()
//     .radius(function(d) { return d.radius + 1; })
//     .iterations(1);
var simulation = d3.forceSimulation()
    .nodes(nodes)
    // .gravity(.02)
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
// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)
var svg = d3.select("#chart")
  // Append a group element to the svg & move to center
  .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// var clicked = 0;

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


// Buttons
d3.select("#industry").on('click', function(d) {
  simulation
    .force("x", forceXSeparate).alpha(0.8)
    .force("y", forceYSeparate).alpha(0.8)
    .alphaTarget(0.001)
    .restart()
})

d3.select("#combine").on('click', function(d) {
  simulation
    .force("x", forceXCombine).alpha(0.4)
    .force("y", forceYCombine).alpha(0.4)
    .alphaTarget(0.001)
    .restart()
})

d3.select("#graph").on('click', function(d) {
  circles
    .attr("cx", 0);
})

// Sliders

var minWorkers = minMaxWorkers[0],
    maxWorkers = minMaxWorkers[1];


// var svgSlider = d3.select("#slider")
//     .append("svg")
//     .attr("width", width/10)// + margin.left + margin.right)
//     .attr("height", 15)

// var x = d3.scaleLinear()
//     .domain([minWorkers, maxWorkers])
//     .range([0, width])
//     .clamp(true);


})