d3.csv("NOC_403.csv")
  .row(function(d) { return {
    noc: d.noc,
    job: d.job,
    cluster: +d.cluster,
    industry: d.industry,
    workers: +d.workers, // convert columns to number
    yearsStudy: +d.yearsStudy, 
    automationRisk: +d.automationRisk,
    wage: Math.round(+d.wage * 100) / 100 // round to 2 decimals. or Number(d.wage.trim().slice(1)) if there's a $ to remove (trim blanks, slice the first char)
    }; })
  .get(function(error,data) {
    dataViz(data);
});

function dataViz(incomingData) {

  var width = 960,
      height = 750,
      padding = 1.5, // separation between same-color nodes
      clusterPadding = 6; // separation between different-color nodes
      maxRadius = 30;

  var nestedIndustries = d3.nest()
  .key(function (el) { return el.industry })
  .entries(incomingData);

  var n = incomingData.length, // total number of nodes / NOCs
      m = nestedIndustries.length; // number of distinct clusters / industries

  // append new attributes:
  // incomingData.forEach(function (el) {
  //   //el.impact = el.favourites.length + el.retweets.length
  // });

  var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(m));
  
  var minMaxWorkers = d3.extent(incomingData, function(el) {return el.workers}); // smallest & largest NOCs by workers
  var radiusScale = d3.scaleLinear()
                     .domain([ 0, Math.sqrt(minMaxWorkers[1]/Math.PI) ]) // Node area = workers = pi*r^2 --> r = sqrt(workers/pi)
                     .range([1,maxRadius]); // set min & max radii

  // industry-specific metrics (group-by & summarize == nest & rollup)
  // var industryMetrics = d3.nest()
  //   .key(function(d) { return d.industry; })
  //   .rollup(function(v) { return {
  //     total: d3.sum(v, function(d) { return d.workers; }), // total industry workers
  //     max: d3.max(v, function(d) { return d.workers; }) // largest NOC by workers per industry
  //     }; })
  //   .entries(incomingData);

  // The largest node for each cluster.
  var clusters = new Array(m);

  // Node area = workers = pi*r^2 --> r = sqrt(workers/pi)
  var nodes = incomingData.map(function (el) { 
    var i = el.cluster,
        r = radiusScale(Math.sqrt(el.workers/Math.PI)),
        d = {
          cluster: i, radius: r, industry: el.industry, noc: el.noc,
          // x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
          // y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
        };
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d; //if cluster uninitialized or if biggest radius so far, set as largest node
    return d;
   })
  console.log(typeof nodes, nodes);
  clusters.splice(0,1); // remove "undefined" industry (start at 0, delete 1)

  // Use the pack layout to initialize node positions.
  
  var root = d3.hierarchy({"children": nodes})

  d3.pack()
      .sort(null)
      .size([width, height])
      .children(function(d) { return d.values; })
      .value(function(d) { return d.radius * d.radius; })
      .nodes({values: d3.nest()
        .key(function(d) { return d.cluster; })
        .entries(nodes)});

  var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .gravity(.02)
      .charge(0)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var node = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .style("fill", function(d) { return color(d.cluster); })
      .call(force.drag);

  node.transition()
      .duration(750)
      .delay(function(d, i) { return i * 5; })
      .attrTween("r", function(d) {
        var i = d3.interpolate(0, d.radius);
        return function(t) { return d.radius = i(t); };
      });

  function tick(e) {
    node
        .each(cluster(10 * e.alpha * e.alpha))
        .each(collide(.5))
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  var iterator = 0;

  // Move d to be adjacent to the cluster node.
  function cluster(alpha) {
    return function(d) {
      var cluster = clusters[d.cluster - 1]; // patch: subtracted 1 to go from 1-10 to 0-9
      // iterator = iterator + 1;
      // console.log(iterator, "d: ", d, "\nclusters[d.cluster]: ", clusters[d.cluster], "\nclusters[10]: ", clusters[10]); // throws an error on the last iteration
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
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + radiusScale(minMaxWorkers[1]) + Math.max(padding, clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  };

  d3.select("button")
      .on("click", function() {
          var popIndustry = Math.floor(Math.random() * (10 - 1) + 1); // random int between 1 and 10
          console.log("popping industry #", popIndustry);

          // nodes = nodes - nodes.cluster

            var node = svg.selectAll("circle")
                          .data(nodes)
                        .enter().append("circle")
                          .style("fill", function(d) { return color(d.cluster); })
                          .call(force.drag);

          var popping = svg.selectAll("circle")
                        .data(nodes)
                          .enter().append("circle")
                          .filter(function(d) { return d.industry != popIndustry })
                          .exit()              

          // //Exit…
          // node.exit()        //References the exit selection (a subset of the update selection)
          //  .transition()   //Initiates a transition on the one element we're deleting
          //  .duration(500)
          //  .attr("x", w)   //Move past the right edge of the SVG
          //  .remove();      //Deletes this element from the DOM once transition is complete

        });

};

