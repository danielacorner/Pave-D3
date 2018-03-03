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