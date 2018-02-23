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
