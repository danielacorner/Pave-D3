
var canvas = d3.select("#chart"),
    width = canvas.attr("width"), // set chart dimensions
    height = canvas.attr("height");

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