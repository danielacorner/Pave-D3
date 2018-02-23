var svg = d3.select('#root').append('svg')
.attr('width', 400)
.attr('height', 400);

var circ = svg.append("circle")
  .attr("cx", 100)
  .attr("cy", 100)
  .attr("r", 20);

function fillCircle(red) {
  circ.style("fill", d3.rgb(red, 0, 0));
}

// Initial values on page load
fillCircle(100);

var sliderScale = d3.scaleLinear()
  .domain([0, 255]) // Red component goes from 0 to 255
  .range([0, 200]) // Width of slider is 200 px
  .clamp(true);

var slider = svg.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + 13 + "," + 200 + ")");

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
      changeRed(sliderScale.invert(d3.event.x));
    }));

var handle = slider.insert("circle", ".track-overlay")
  .attr("class", "handle")
  .attr("r", 9);

function changeRed(h) {
  handle.attr("cx", sliderScale(h));
  fillCircle(h);
}










filterNodes(0);//d3.min(datapoints, function(d) { return d.workers }));

  // circles.data(graph);


function updateNodes(h) {
console.log("circles: ",circles);

  // use the slider handle
  handle.attr("cx", sliderScale(h));

  //  UPDATE
  circles = circles.data(filterNodes(h));

  circles.exit().remove();
  
  var newCircles = circles.enter().append("circle")
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
    });

  circles = circles.merge(newCircles);

  simulation.nodes(circles)
    .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);

  // circles.data(newCircles);//.enter().append().exit().remove();

  // drag_handler(enteringCircles);

  simulation.alphaTarget(0.3).restart();

}

})