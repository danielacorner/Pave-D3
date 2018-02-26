var graph, store; // displayed, stored data

// load the data
d3.csv("NOC_403.csv", function(error, datapoints) {
  if (error) throw error;


// Setting the dropdown options
  // grab the headers array
var headersString = [];
datapoints.forEach(function(row) { 
  if (row.id == 1) headersString += (String(Object.keys(row)));
});
var headersSplit = headersString.split(",");
  // add the options html string
var options;
for(var h=0; h<=headersSplit.length; h++){
options += "<option>"+ headersSplit[h] +"</option>"; // switch to headersString[h]
  // when you get to the last skill faculty, end
if(headersSplit[h] == "s15CriticalThinking") h = headersSplit.length;
}
    // set the options 
document.getElementById("dropdown1").innerHTML = options;
    // set title & reset the title when new option selected
document.getElementById("dropdown1Title").innerHTML = "Minimum " + dropdown1.value;
d3.select("#dropdown1").on('click', function(d){
    document.getElementById("dropdown1Title").innerHTML = "Minimum " + dropdown1.value;
})


// Viz dimensions & margins
var margin = {top: 20, right: 20, bottom: 50, left: 50};
var canvas = d3.select("#chart"),
    width = canvas.attr("width"), // set chart dimensions
    height = canvas.attr("height"),
    maxRadius = 30; // Max circle radius


// number of distinct clusters
var industries = [];
datapoints.forEach(function(row){
if(!industries.includes(row.industry)) industries.push(row.industry)
}); 
var m = industries.length;


// Actual max workers... need to re-order?
var maxWorkers = 120415; // patch: d3.max(datapoints, function(d) { return d.workers })

// Scales
    // Color scale for 10 categories
var color = d3.scaleOrdinal(d3.schemeCategory10)
.domain(d3.range(m));
    // Scale Circle Area = Number of Workers
    // Sqrt scale because radius of a cicrle
var radiusScale = d3.scaleSqrt()
.domain([10, maxWorkers])
.range([1,maxRadius]);


// The largest node for each cluster
var clusters = new Array(m);

// Nodes: the data you want to display & filter by
var nodes = datapoints.map(function(el) {
  var i = el.cluster,
  r = radiusScale(el.workers),
  d = {
    id: +el.id,
    cluster: i, 
    radius: r, 
    job: el.job,
    industry: el.industry, 
    noc: el.noc, 
    workers: +el.workers,
    wage: el.wage,
    automationRisk: el.automationRisk,
    yearsStudy: el.yearsStudy,
    job: el.job,
    skillsComp: el.skillsComp,
    skillsLogi: el.skillsLogi,
    skillsMath: el.skillsMath,
    skillsLang: el.skillsLang,
    s1DataAnalysis: el.s1DataAnalysis,
    s2DecisionMaking: el.s2DecisionMaking,
    s3FindingInformation: el.s3FindingInformation,
    s4JobTaskPlanningandOrganizing: el.s4JobTaskPlanningandOrganizing,
    s5MeasurementandCalculation: el.s5MeasurementandCalculation,
    s6MoneyMath: el.s6MoneyMath,
    s7NumericalEstimation: el.s7NumericalEstimation,
    s8OralCommunication: el.s8OralCommunication,
    s9ProblemSolving: el.s9ProblemSolving,
    s10Reading: el.s10Reading,
    s11SchedulingorBudgetingandAccounting: el.s11SchedulingorBudgetingandAccounting,
    s12DigitalTechnology: el.s12DigitalTechnology,
    s13DocumentUse: el.s13DocumentUse,
    s14Writing: el.s14Writing,
    s15CriticalThinking: el.s15CriticalThinking,

};
  // if there's no cluster i OR if biggest radius yet, set cluster
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});

// Maximum values
var maxWorkers = d3.max(nodes, function(d){ return d.workers});


// Graph mode
    // Toggle for graph mode = off initially
var graphMode = 0;
    // store nodes for drawing axes in graph mode
graph = nodes;
store = nodes;


// Simulation, forces, & tick function
    // Forces for the simulation
var forceXCombine = d3.forceX().strength(.3)
var forceYCombine = d3.forceY().strength(.3)
// default strength = -30, negative strength = repel, positive = attract
var forceGravity = d3.forceManyBody()
.strength(function(d) { return -7 * d.radius })
var forceXSeparate = d3.forceX(function(d) {
  return ((width / m) * d.cluster - width/2 - 25) * 1.1
}).strength(0.3)
var forceYSeparate = d3.forceY(function(d) {
  return ((height / 2) * d.cluster/40 - 20)
}).strength(0.3)
var forceXSeparateRandom = d3.forceX(function(d) {
  Math.random();
  return ( (width / m) * 10 * Math.random() - width/2 )
}).strength(0.4)
var forceYSeparateRandom = d3.forceY(function(d) {
  return ( Math.random() * (height/2) - 125 )
}).strength(0.3)
// var forceX5By2 = d3.forceX(function(d) { // 10-grid force example
//     if (d.cluster/5<1) return d.cluster/5;
//     if (d.cluster/5>1) return d.cluster/5+1;
// })
    // force the circles toward their cluster nodes
function forceCluster(alpha) {
  for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.1; i < n; ++i) {
    node = nodes[i];
    cluster = clusters[node.cluster];
    node.vx -= (3*node.x - cluster.x) * k;
    node.vy -= (3*node.y - cluster.y) * k;
  }
  }
    // Update the positions each tick
function tick() {
  circles
  .attr("cx", function(d) { return d.x; })
  .attr("cy", function(d) { return d.y; });
}
    // The force simulation
var simulation = d3.forceSimulation()
.nodes(store)
    // .force("center", d3.forceCenter())
    .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);


// Tooltip div (on hover)
var div = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);


// Append a group element to the svg & move to center
var svg = d3.select("#chart")
.append('g')
.attr('transform', 'translate('+width/2+','+height/2+')');




///////////////////////// Circles /////////////////////////////
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
      })



// on start, transition in radii from 0
circles.transition()
.duration(1000)
.delay(function(d, i) { return i * 2})
.attrTween("r", function(d) {
  var i = d3.interpolate(0, d.radius);
  return function(t) { return d.radius = i(t); };
});


// Enable dragging
function dragstarted(d) { // no dragging in graph mode
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





// Buttons
d3.select("#industry").on('click', function() {
  simulation
  .force("x", forceXSeparate).alpha(0.8)
  .force("y", forceYSeparate).alpha(0.8)
    .alphaTarget(0.001) // after click, cool down to minimal temperature
    .restart()
  })

d3.select("#random").on('click', function() {
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
    graphMode = 0; // turn off graph mode
    // transition circles back to middle for 400 ms
    // but restart the simulation at 250 ms (looks ok,
    // could make similar to graphMode on/off transition) 
    circles.transition()
    .duration(400)
    .attrTween("cx", function(d) {
      var i = d3.interpolate(d.cx, 0);
      return function(t) { return d.cx = i(t); };
    })
    .attrTween("cy", function(d) {
      var i = d3.interpolate(d.cy, 0); 
      return function(t) { return d.cy = i(t); };
    });
    setTimeout(function() {  
     simulation
     .force("x", forceXCombine).alpha(0.4)
     .force("y", forceYCombine).alpha(0.4)
     .alphaTarget(0.001)
     .restart()
   }, 250);
  }
})


// TODO: maxWorkers, maxWage not working
var minWorkers = d3.min(nodes, function(d) {return d.workers}),
minWage = d3.min(nodes, function(d) {return d.wage}),
maxWage = d3.max(nodes, function(d) {return d.wage});//d3.max(datapoints, function(d) {return d.wage});

maxwage = 116.18; //busted

// ////////////////// FREEZE ////////////////////////
d3.select("#freeze").on('click', function(d) {
  simulation.stop();
});

///////////////// Graph Mode ////////////////////

// catch stored positions
var positionsX = {};
var positionsY = {};

d3.select("#graph").on('click', function(d) {
  // Toggle mode on or off
      simulation.alpha(0); //cool to 0 degrees

      graphMode = 1-graphMode;
      console.log("graphMode = ", graphMode);

  ////////////// GRAPH MODE ON! ////////////////
  if (graphMode == 1) {

    // cool to 0 degrees
    simulation.stop();

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
        var i = d3.interpolate(d.x, d.workers/maxWorkers*width*0.9 - width/2 + margin.left);
        return function(t) { return d.cx = i(t); };
      })
        // set y values
        .attrTween("cy", function(d) {
          var i = d3.interpolate(d.y, (1-d.automationRisk)*height*0.9 - height/2);
          return function(t) { return d.cy = i(t); };
        });
       // set styles
       //.styleTween(...automation risk colour scale)

	//////////////////////// Axes ////////////////////////////

  // Nest the entries by state
  dataNest = d3.nest()
  .key(function(d) {return d.state;})
  .entries(data);

	// Set the ranges
	var x = d3.scaleLinear().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);


	// Scale the range of the data (using globally-stored nodes)
	// TODO: modularize for axis selection
	x.domain([0, maxWorkers]); //minmax workers
	y.domain([0, 1]); //minmax risk d3.max(store, function(d) { return d.automationRisk; })

	// Add an axis-holder group
	axisG = svg.append("g")

	// Add the X Axis
	axisX = axisG.append("g")
 .attr("class", "x axis")
 .attr("transform", "translate("+ (-width/2+margin.left) +","
  + (height/2-margin.bottom) + ")")
 .call(d3.axisBottom(x).ticks(5));

	 // text label for the x axis
  axisG.append("text")
  .attr("transform","translate(" + (margin.left) + ","
	                    + (height/2-10) + ")") // top
  .style("text-anchor", "middle")
  .text("Number of Jobs");

	// Add the Y Axis
	axisY = axisG.append("g")
 .attr("class", "y axis")
 .attr("transform", "translate("+ (-width/2+margin.left) +"," 
  + (-height/2-margin.bottom) + ")")
 .call(d3.axisLeft(y).ticks(5));

	 // text label for the y axis
  axisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -width/2)
  .attr("x", 0)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Risk of Machine Automation");   

}

  //////////////// Graph mode off. ///////////////////

  // If turning off:
  if (graphMode == 0) {

  	// remove axes
  	axisG.remove();

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

})








///////////////////////////////// Filters ////////////////////////////////////

//////////////// Filter Slider 1: # Workers //////////////////////

var sliderSVG = d3.select("#slider1").append("svg")
.attr("width", 250)
.attr("height", 50)

var sliderScale = d3.scaleLinear()
  .domain([0, maxWorkers]) // Red component goes from 0 to 255
  .range([0, 200]) // Width of slider is 200 px
  .clamp(true);

  var slider = sliderSVG.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

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
      // console.log("filtering for workers > ", sliderScale.invert(d3.event.x));
      updateNodes(sliderScale.invert(d3.event.x));
    }));

  var handle = slider.insert("circle", ".track-overlay")
  .attr("class", "handle")
  .attr("r", 9);

//////////////// Filter Functions 1: # Workers //////////////////////

// filtered IDs
listToDelete = [];

function filterNodes(workersMin) { // return nodes with workers > "workersMin"
store.forEach(function(d) {
    // first, take any nodes off the list
    if (listToDelete.includes(d.id)) listToDelete.splice(listToDelete.indexOf(d.id),1);
    // then if you're under the min (bad) && if you're not on the list
    if (d.workers < workersMin && !listToDelete.includes(d.id)) {
      // put you on the list
      listToDelete.push(d.id);
    }
  });

  // reset the graph
  graph = [];
  //  add and remove nodes from data based on filters
  store.forEach(function(n) {
    // if you're not on the filter list
    if (n.workers >= workersMin && !listToDelete.includes(n.id)) {
      // put you on the graph         (start graph empty? or check)
      graph.push(n);
    //   circles.select("[id='"+n.id+"']")
    //   .attr("r", function(d) {return d.radius});
    // } else if (n.workers <= workersMin) {
    //   circles.select("[id='"+n.id+"']")
    //   .attr("r", 0);
  } else if (n.workers < workersMin && listToDelete.includes(n.id)) {
    graph.forEach(function(d, i) {
      if (n.id === d.id) {
        graph.splice(i, 1);
      }
    })
  };
});
  return graph;
}
//  general update pattern for updating the graph
function updateNodes(h) {
  // using the slider handle
  handle.attr("cx", sliderScale(h));
  //  UPDATE
  circles = circles.data(filterNodes(h), function(d) { return d.id});
  // EXIT
  circles.exit().transition().duration(300)
  // exit transition: "pop" radius * 1.5 + 5 & fade out
  .attr("r", function(d) { return d.radius * 1.5 + 5 })
  .attrTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return d.opacity = i(t); };
  })
  .remove();
  // ENTER
  var newCircles = circles.enter().append("circle")
    .attr("r", function(d) { return d.radius }) // start at full radius
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
    drag_handler(newCircles);
  //  ENTER + UPDATE
  circles = circles.merge(newCircles);
  // simulation forces on filter
  simulation.nodes(filterNodes(h))
  .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
  .force("cluster", forceCluster)
  .force("gravity", forceGravity)
  .force("x", forceXCombine)
  .force("y", forceYCombine)
  .on("tick", tick);
  simulation.alphaTarget(0.3).restart();
}













//////////////// Filter Slider 2: Filter by Dropdown //////////////////////

var sliderDropdownSVG = d3.select("#slider2").append("svg")
.attr("width", 250)
.attr("height", 50);

var sliderDropdownScale = d3.scaleLinear()
  .domain([ 0, d3.max(nodes, function(d){ return d[dropdown1.value] }) ]) 
  .range([0, 200]) // Width of slider is 200 px
  .clamp(true);

d3.select("#dropdown1").on('click', function(){
  sliderDropdownScale = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){return d[dropdown1.value]})])
    .range([0, 200]) // Width of slider is 200 px
    .clamp(true);
    console.log(d3.max(nodes, function(d){return d[dropdown1.value]}));
  // display (range: min to max) after dropdown title
  document.getElementById("dropdown1Title").innerHTML = "Minimum "+ dropdown1.value
      +" (range: "+ d3.min(nodes, function(d){ return d[dropdown1.value] }) 
        +" to "+ d3.max(nodes, function(d){ return d[dropdown1.value] }) +")";
})

  var sliderDropdown = sliderDropdownSVG.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

  sliderDropdown.append("line")
  .attr("class", "track")
  .attr("x1", sliderDropdownScale.range()[0])
  .attr("x2", sliderDropdownScale.range()[1])
  .select(function() {
    return this.parentNode;
  })
  .append("line")
  .attr("x1", sliderDropdownScale.range()[0])
  .attr("x2", sliderDropdownScale.range()[1])
  .attr("class", "track-inset")
  .select(function() {
    return this.parentNode;
  })
  .append("line")
  .attr("x1", sliderDropdownScale.range()[0])
  .attr("x2", sliderDropdownScale.range()[1])
  .attr("class", "track-overlay")
  .call(d3.drag()
    .on("start.interrupt", function() {
      sliderDropdown.interrupt();
    })
    .on("start drag", function() {
      // console.log("filtering for workers > ", sliderDropdownScale.invert(d3.event.x));
      updateNodesDropdown(sliderDropdownScale.invert(d3.event.x));
    }));

  var handleDropdown = sliderDropdown.insert("circle", ".track-overlay")
  .attr("class", "handle")
  .attr("r", 9);


  // on dropdown click, reset the slider
  d3.select("#dropdown1").on('click', function(){
    sliderDropdownScale = d3.scaleLinear()
      .domain([0, d3.max(nodes, function(d){return d[dropdown1.value]})])
      .range([0, 200]) // Width of slider is 200 px
      .clamp(true);
    // display (range: min to max) after dropdown title
    document.getElementById("dropdown1Title").innerHTML = "Minimum "+ dropdown1.value
        +" (range: "+ d3.min(nodes, function(d){ return d[dropdown1.value] }) 
          +" to "+ d3.max(nodes, function(d){ return d[dropdown1.value] }) +")";
  
    var sliderDropdown = sliderDropdownSVG.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + 25 + "," + 25 + ")");

    sliderDropdown.append("line")
    .attr("class", "track")
    .attr("x1", sliderDropdownScale.range()[0])
    .attr("x2", sliderDropdownScale.range()[1])
    .select(function() {
      return this.parentNode;
    })
    .append("line")
    .attr("x1", sliderDropdownScale.range()[0])
    .attr("x2", sliderDropdownScale.range()[1])
    .attr("class", "track-inset")
    .select(function() {
      return this.parentNode;
    })
    .append("line")
    .attr("x1", sliderDropdownScale.range()[0])
    .attr("x2", sliderDropdownScale.range()[1])
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function() {
        sliderDropdown.interrupt();
      })
      .on("start drag", function() {
        // console.log("filtering for workers > ", sliderDropdownScale.invert(d3.event.x));
        updateNodesDropdown(sliderDropdownScale.invert(d3.event.x));
      }));

    var handleDropdown = sliderDropdown.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  })

//////////////// Filter Functions 2: Dropdown //////////////////////

// filtered IDs
listToDeleteDropdown = [];

function filterNodesDropdown(dropdownMin) { // return nodes with workers > "dropdownMin"
store.forEach(function(d) {
    // first, take any nodes off the list
    if (listToDeleteDropdown.includes(d.id)) listToDeleteDropdown.splice(listToDeleteDropdown.indexOf(d.id),1);
    // then if you're under the min (bad) && if you're not on the list
    if (d[dropdown1.value] < dropdownMin && !listToDeleteDropdown.includes(d.id)) {
      // put you on the list
      listToDeleteDropdown.push(d.id);
    }
  });
  // reset the graph
  graph = [];
  //  add and remove nodes from data based on filters
  store.forEach(function(n) {
    // if you're not on the filter list
    if (n[dropdown1.value] >= dropdownMin && !listToDeleteDropdown.includes(n.id)) {
      // put you on the graph         (start graph empty? or check)
      graph.push(n);
    } else if (n[dropdown1.value] < dropdownMin && listToDeleteDropdown.includes(n.id)) {
      graph.forEach(function(d, i) {
        if (n.id === d.id) {
          graph.splice(i, 1);
        }
      })
    };
  });
  return graph;
}
//  general update pattern for updating the graph
function updateNodesDropdown(h) {
  // using the slider handle
  handleDropdown.attr("cx", sliderDropdownScale(h));
  //  UPDATE
  circles = circles.data(filterNodesDropdown(h), function(d) { return d.id });
  // EXIT
  circles.exit().transition().duration(300)
  // exit transition: "pop" radius * 1.5 + 5 & fade out
  .attr("r", function(d) { return d.radius * 1.5 + 5 })
  .attrTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return d.opacity = i(t); };
  })
  .remove();
  // ENTER
  var newCircles = circles.enter().append("circle")
    .attr("r", function(d) { return d.radius }) // start at full radius
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
    drag_handler(newCircles);
  //  ENTER + UPDATE
  circles = circles.merge(newCircles);
  // simulation forces on filter
  simulation.nodes(filterNodesDropdown(h))
  .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
  .force("cluster", forceCluster)
  .force("gravity", forceGravity)
  .force("x", forceXCombine)
  .force("y", forceYCombine)
  .on("tick", tick);
  simulation.alphaTarget(0.3).restart();
}















//////////////// Filter Slider 3: Loop for creating sliders //////////////////////
// sliders to create
var sliderArray = ["skillsLang", "skillsLogi", "skillsMath", "skillsComp"];

var sliderArraySVG = [];

var sliderArrayScale = [];

var sliderArrayFunctions = [];

var sliderArrayUpdateFunctions = [];

for(var i=0; i<sliderArray.length; i++) {

  sliderArraySVG[i] = d3.select("#sliderArray").append("text").html("<br>"+sliderArray[i]+"<br>")
  .append("svg")
    // .style("display", "inline").style("position", "relative")
    .attr("id", "slider_"+i)
    .attr("width", 250)
    .attr("height", 50);

  // sliverArraySVG[i].text("test");

  sliderArrayScale[i] = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){ return d[sliderArray[i]]})]) // Red component goes from 0 to 255
    .range([0, 200]) // Width of slider is 200 px
    .clamp(true);

  var sliderLoop = sliderArraySVG[i].append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

  sliderLoop.append("line")
  .attr("class", "track")
  .attr("x1", sliderArrayScale[i].range()[0])
  .attr("x2", sliderArrayScale[i].range()[1])
  .select(function() {
    return this.parentNode;
  })
  .append("line")
  .attr("x1", sliderArrayScale[i].range()[0])
  .attr("x2", sliderArrayScale[i].range()[1])
  .attr("class", "track-inset")
  .select(function() {
    return this.parentNode;
  })
  .append("line")
  .attr("x1", sliderArrayScale[i].range()[0])
  .attr("x2", sliderArrayScale[i].range()[1])
  .attr("class", "track-overlay")
  .call(d3.drag()
    .on("start.interrupt", function() {
      sliderLoop.interrupt();
    })
    .on("start drag", function() {
      // console.log("filtering for workers > ", sliderArrayScale.invert(d3.event.x));
      sliderArrayFunctions[i](sliderArrayScale[i].invert(d3.event.x));
    }));

  var handleLoop = sliderLoop.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

  //////////////// Filter Functions 3: Function-generated //////////////////////

  // filtered IDs
  listToDeleteLoop = [];

  var tempFunction = new function (dropdownMin) { // return nodes with workers > "dropdownMin"
    store.forEach(function(d) {
        // first, take any nodes off the list
        if (listToDeleteLoop.includes(d.id)) listToDeleteLoop.splice(listToDeleteLoop.indexOf(d.id),1);
        // then if you're under the min (bad) && if you're not on the list
        if (d[sliderArray[i]] < dropdownMin && !listToDeleteLoop.includes(d.id)) {
          // put you on the list
          listToDeleteLoop.push(d.id);
        }
      });
      // reset the graph
      graph = [];
      //  add and remove nodes from data based on filters
      store.forEach(function(n) {
        // if you're not on the filter list
        if (n[sliderArray[i]] >= dropdownMin && !listToDeleteLoop.includes(n.id)) {
          // put you on the graph         (start graph empty? or check)
          graph.push(n);
        } else if (n[sliderArray[i]] < dropdownMin && listToDeleteLoop.includes(n.id)) {
          graph.forEach(function(d, i) {
            if (n.id === d.id) {
              graph.splice(i, 1);
            }
          })
        };
      });
      return graph;
  }

  sliderArrayFunctions[i] = tempFunction;

  //  general update pattern for updating the graph
    function tempUpdateFunction(h) {
      // using the slider handle
      handleLoop.attr("cx", sliderArrayScale[i](h));
      //  UPDATE
      circles = circles.data(sliderArrayFunctions[i](h), function(d) { return d.id });
      // EXIT
      circles.exit().transition().duration(300)
      // exit transition: "pop" radius * 1.5 + 5 & fade out
      .attr("r", function(d) { return d.radius * 1.5 + 5 })
      .attrTween("opacity", function(d) {
        var i = d3.interpolate(1, 0);
        return function(t) { return d.opacity = i(t); };
      })
      .remove();
      // ENTER
      var newCircles = circles.enter().append("circle")
        .attr("r", function(d) { return d.radius }) // start at full radius
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
        drag_handler(newCircles);
      //  ENTER + UPDATE
      circles = circles.merge(newCircles);
      // simulation forces on filter
      simulation.nodes(sliderArrayFunctions[i](h))
      .force("collide", d3.forceCollide(function(d) { return d.radius + 1; }))
      .force("cluster", forceCluster)
      .force("gravity", forceGravity)
      .force("x", forceXCombine)
      .force("y", forceYCombine)
      .on("tick", tick);
      simulation.alphaTarget(0.3).restart();
    };

  sliderArrayUpdateFunctions[i] = tempUpdateFunction;
};



})