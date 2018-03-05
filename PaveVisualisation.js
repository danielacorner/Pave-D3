// Log Clicked Node & ID using jQuery
$( "body" ).click(function( event ) {
    console.log( "clicked: " + event.target.nodeName, event.target.id);
});

d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };


var graph, store; // displayed, stored data
var clicked = 0; // on: tooltips don't disappear

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
  // when you get to the last subskill, end
if(headersSplit[h] == "s15CriticalThinking") h = headersSplit.length;
}
    // set the options 
document.getElementById("dropdown1").innerHTML = options;
    // set title & reset the title when new option selected
document.getElementById("dropdown1Title").innerHTML = "Filter Jobs by: " + dropdown1.value;
d3.select("#dropdown1").on('click', function(d){
    document.getElementById("dropdown1Title").innerHTML = "Filter Jobs by: " + dropdown1.value;
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

var colorTooltip = d3.scaleOrdinal()
    .domain([0,1,2,3,4,5,6,7,8,9])
    .range(["#E1F8F9", // blue
            "#FFF3E1", // orange
            "#CFF0BE", // green
            "#F5DFDF", // red
            "#E9EBF8", // purple
            "white", // brown
            "#FCF5F7", // pink
            "#E8F1F2", // grey
            "#ECFCF5", // yellow-green
            "#D7F9E9" ]) // teal
// .domain(d3.range(m));
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
    title1: el.title1,
    title2: el.title2,
    title3: el.title3,
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
var forceCollide = d3.forceCollide(function(d) { return d.radius + 1 })
var forceXCombine = d3.forceX().strength(.3)
var forceYCombine = d3.forceY().strength(.3)
// default strength = -30, negative strength = repel, positive = attract
var forceGravity = d3.forceManyBody()
.strength(function(d) { return -7 * d.radius })
var forceFutureMode = d3.forceManyBody()
.strength(function(d) { return -7 * automationRadiusScale(d.automationRisk) })
var forceCollideFutureMode = d3.forceCollide(function(d) { return automationRadiusScale(d.radius) + 25 })
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
    .force("collide", forceCollide)
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);


// Tooltip div (on hover)
var div = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

var div2 = d3.select("body").append("div")
.style("opacity", 0)
.attr("transform", "translate(0," + 200 + ")");

// Append a group element to the svg & move to center
var svg = d3.select("#chart")
.append('g')
.attr('transform', 'translate('+width/2+','+height/2+')');




// TODO: merge pre, post-filtering
///////////////////////// Circles, Tooltips (pre-filtering) /////////////////////////////
// Add the circles with tooltips
var circles = svg.selectAll("circle")
.data(nodes)
.enter().append("circle")
    .attr("r", 0) // start at 0 radius and transition in
    .style("fill", function(d) { return color(d.cluster); })
    // Tooltips
    .on("mouseover", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);


      // create the hover tooltip
      div.transition()
      .duration(300)
      .style("opacity", .96)
      .style("height", "auto")
      .style("width", "350px")
      // .style("border",   "1px solid black;");

      // d3.select("#tooltip")
      // .append("image")
      //   .attr("src", "img/logo.png")
      //   .attr("class", "img-rounded");

      // Display Hover Tooltip
      div.html("<div style='font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div style='color: " + colorTooltip(d.cluster) +"; padding-left: 10px; font-size: 15px; font-family: Raleway;'>"
                                +"<br/>Some job titles from this group are ..."
                +"<ul><li>"+d.title1+"</li><li>"+d.title2+"</li><li>"+d.title3+"</li></ul></div>")
        // Move div above mouse by "top" + radius and right by "left"
        .style("left", (d3.event.pageX) + 20 + "px")
        .style("background", color(d.cluster) )
        .style("top", (d3.event.pageY - 80) - d.radius + "px");

      // div2.transition()
      // .duration(200)
      // .style("left", (d3.event.pageX) + 20 + "px")
      // .style("top", (d3.event.pageY - 80) - d.radius + "px")
      // .style("opacity", .9)

      // div2.html("test")
      })
    .on("mouseout", function(d) {
      if (clicked == 1) return;

      // clicked = 0;
      d3.select(this).attr("stroke", "none");
      div.transition()
      .duration(500)
      .style("opacity", 0);
    })
    .on("click", function(d) {
      // click-on, click-off
      clicked = 1-clicked;
      div
      .html("<div style='font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div style='padding-left: 10px; font-family: Raleway; font-size: 15px; color: " + colorTooltip(d.cluster) +";'>"
                +"<br/>Some job titles from this group are ..."
                +"<ul><li>"+d.title1+"</li><li>"+d.title2+"</li><li>"+d.title3+"</li></ul>"
                +"[Top Jobs Placeholder]" 
                +"<br/><br/>Top skills are..." + d.skillsComp + ", " + d.skillsMath + ", and " + d.skillsLang //TOP SKILLS
        // Insert extra info to display on click
                +"<br/><br/>" + 
                "<ul> <li>" + Math.round(10*d.yearsStudy)/10 + " years is the typical number of years of studying required to do jobs in this group.</li>"
                +"<br/><li>Median wage is $" + Math.round(100*d.wage)/100 + " per hr.</li>"
        + "<br/><li>Machine automation risk is " + Math.round(1000*d.automationRisk)/10 + "%</li>"
        + "<br/><li>This group currently has " + d.workers + " Jobs</li>"
        +"<br/><br/></div><span style='padding-left: 225px'></span><button class='btn btn-md btn-default'"+
         "style='box-shadow: 3px 3px 3px grey; font-size: 16px; font-family: Raleway; background: white; color: " + color(d.cluster) 
         +";'> View more</button></span></br></br> ").transition().duration(300).style("width", "350px")
        // Unfurl downward
        // .style("height", 200)
        // .transition()
        // .duration(200)
        // .style("height", "auto")
        .style("height", "auto");
      })
    // .on("dblclick", dblclick())

function dblclick(d){
  d3.select(this).classed("fixed", d.fixed = false)
}


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
  if (!d3.event.active && graphMode == 0) simulation.alphaTarget(0.2).restart();    

  d.fx = d.x;
  d.fy = d.y;

}

function dragged(d) {
  d3.select(this).classed("fixed", d.fixed = true);

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









///////////////////////////////// Buttons ////////////////////////////////////





//////////// Industry Split ////////////////

d3.select("#industry").on('click', function() {
  if (graphMode == 1 || futureMode == 1) return;
  simulation
  .force("x", forceXSeparate).alpha(0.4)
  .force("y", forceYSeparate).alpha(0.4)
    .alphaTarget(0) // after click, cool down to minimal temperature
    .restart()

  legend.transition().duration(500).style("opacity", 0).remove();
  // createBottomLegend();
  })

d3.select("#random").on('click', function() {
  legend.transition().duration(500).style("opacity", 0).remove();
  // createBottomLegend();
  if (graphMode == 1) {
    graphMode = 0;
    graphModeOff();
  };
  if (futureMode == 1) {
    futureMode = 0;
    futureModeOff();
  }
  simulation
  .force("x", forceXSeparateRandom)
  .force("y", forceYSeparateRandom)
  .alpha(0.15).alphaTarget(0).restart();


})

d3.select("#combine").on('click', function(d) {
  createLegend(0);
  if (graphMode == 0 && futureMode == 0) {
    simulation
    // .force("gravity", forceGravity)
    .force("x", forceXCombine).alpha(0.4)
    .force("y", forceYCombine).alpha(0.4)
    .alphaTarget(0)
    .restart()
  } else {
    if (futureMode==1) {
      futureMode = 0;
      futureModeOff();
    }
    if (graphMode==1) {
      graphMode = 0; // turn off graph mode
      graphModeOff();
    }
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
     .alphaTarget(0.2)
     .restart()
   }, 250);
  }
})


// TODO: maxWorkers, maxWage, skillsMath not working
var minWorkers = d3.min(nodes, function(d) {return d.workers}),
minWage = d3.min(nodes, function(d) {return d.wage});
// maxWage = d3.max(nodes, function(d) {return d.wage});//d3.max(datapoints, function(d) {return d.wage});

var maxWage = 116.18; //busted

maxYearsStudy = d3.max(nodes, function(d) {return d.yearsStudy}); // 5







////////////////// Freeze! (Pause) ////////////////////////
d3.select("#freeze").on('click', function(d) {
  simulation.stop();
});









///////////////// Graph Mode ////////////////////

// catch stored positions
var positionsX = {};
var positionsY = {};
var originalRadius = {};
// store previous radii
  nodes.forEach(function(d) {
    originalRadius[d.id] = d.radius;
  });

d3.select("#graph").on('click', function(d) {
  // createGraphModeLegend();
  // Toggle mode on or off
      simulation.alpha(0); //cool to 0 degrees

      graphMode = 1-graphMode;
      console.log("graphMode = ", graphMode);

  ////////////// GRAPH MODE ON! ////////////////
  if (graphMode == 1) {
    d3.select("#graphModeDropdown").style("visibility", "visible")

    // legend.transition().duration(500).style("opacity", 0).remove();
    graphModeOn(0);
  }
  //////////////// Graph mode OFF. ///////////////////
  if (graphMode == 0) {
    d3.select("#graphModeDropdown").style("visibility", "hidden")
    // d3.select("#slider_1").style("visibility", "visible")

    createLegend(0);
    // if future mode is on, return to future mode
    if (futureMode == 1) { 
      futureMode = 0;
      futureModeOff(); 
      createLegend(0);}
    // console.log("futureMode: ", futureMode);
    graphModeOff();
  }; // transition back to clusters
  
  // TODO: modularize graph mode in js folder
  // $.getScript("./js/graph-module.js");
})


d3.select("#a0").on('click', function() {
  // if (typeof legend != "undefined") legend.transition().duration(500).style("opacity", 0).remove();
  graphModeOn(0);
  // createLegend(0);
});
d3.select("#a1").on('click', function() {
  graphModeOn(1);
});
d3.select("#a2").on('click', function() {
  graphModeOn(2);
});


function graphModeOn(mode) {
  if (typeof legend != "undefined") legend.transition().duration(500).style("opacity", 0).remove();
  d3.select("#freeze").transition().duration(500).style("opacity", 0);
  d3.select("#graphModesDiv").style("visibility", "visible");
    // cool to 0 degrees
    simulation.stop();

    // store previous positions
    nodes.forEach(function(d) {
      positionsX[d.id] = d.x;
    });
    nodes.forEach(function(d) {
      positionsY[d.id] = d.y;
    });

    // CHOOSE / SWITCH for graph-mode dropdown
    switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:
          // transition circles to graph positions
          circles.transition()
          .duration(750)
              // set x values
            .attrTween("cx", function(d) { // transition x position to...
              var i = d3.interpolate(d.x, d.workers/maxWorkers*width*0.9 - width/2 + margin.left); // here: create a dropdown
              return function(t) { return d.cx = i(t); };
            })
              // set y values
              .attrTween("cy", function(d) {
                var i = d3.interpolate(d.y, (1-d.automationRisk)*height*0.9 - height/2 + 100);
                return function(t) { return d.cy = i(t); };
              });
            break;
      // x = Years of Study
      // y = Wage
        case 1:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) {
              var i = d3.interpolate(d.x, d.yearsStudy/maxYearsStudy*width*0.9 - width/2 + margin.left); // here: create a dropdown
              return function(t) { return d.cx = i(t); };
            })
              .attrTween("cy", function(d) {
                var i = d3.interpolate(d.y, ((maxWage-d.wage)/maxWage)*height*0.9 - height/2 + 100);
                return function(t) { return d.cy = i(t); };
              });
            break;
      // x = Number of Jobs
      // y = Wage
        case 2:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) {
              var i = d3.interpolate(d.x, d.workers/maxWorkers*width*0.9 - width/2 + margin.left); // here: create a dropdown
              return function(t) { return d.cx = i(t); };
            })
              .attrTween("cy", function(d) {
                var i = d3.interpolate(d.y, ((maxWage-d.wage)/maxWage)*height*0.9 - height/2 + 100);
                return function(t) { return d.cy = i(t); };
              });
            break;
      // x = Number of Jobs
      // y = Automation Risk
        case 3:

            break;
        case 4:

            break;
        case 5:

            break;
        case 6:

    }

  //////////////////////// Axes ////////////////////////////

  // Set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

   switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:
               // Scale the range of the data (using globally-stored nodes)
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([0, 1]); //minmax risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Years of Study
      // y = Wage
        case 1:
                x.domain([0, maxYearsStudy]); //minmax workers
                y.domain([0, maxWage]);
            break;
      // x = Number of Jobs
      // y = Wage
        case 2:
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([0, maxWage]);
            break;
      // x = Number of Jobs
      // y = Automation Risk
        case 3:

            break;
        case 4:

            break;
        case 5:

            break;
        case 6:

    }


  // Add an axis-holder group
  axisG = svg.append("g").attr("transform", "translate(0,100)");

  d3.select("xaxis").remove();

  // Add the X Axis
  axisX = axisG.append("g")
 .attr("class", "xaxis")
 .attr("transform", "translate("+ (-width/2+margin.left) +","
  + (height/2-30) + ")")
 .call(d3.axisBottom(x).ticks(5))
 .attr("opacity", 0).transition().duration(500).attr("opacity",1);
   // text label for the x axis
  axisLabelX = axisG.append("text")
  .attr("transform","translate(" + (margin.left) + ","
                      + (height/2) +")") // top
  .style("text-anchor", "middle")
  .attr("opacity", 0).transition().duration(500).attr("opacity",1);

  d3.select("yaxis").remove();

  // Add the Y Axis
  axisY = axisG.append("g")
 .attr("class", "yaxis")
 .attr("transform", "translate("+ (-width/2+margin.left) +"," 
  + (-height/2-margin.bottom) + ")")
 .call(d3.axisLeft(y).ticks(5))
 .attr("opacity", 0).transition().duration(500).attr("opacity",1);
   // text label for the y axis
  axisLabelY = axisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -width/2)
  .attr("x", 0)
  .attr("dy", "1em")
  .style("text-anchor", "middle")

  switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:

            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");

            axisY.call(d3.axisLeft(y).ticks(5))
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("font-family", "Dosis").style("font-size", "20px")
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            axisLabelY.text("Risk of Machine Automation").style("font-family", "Dosis").style("font-size", "20px")
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            break;
      // x = Years of Study
      // y = Wage
        case 1:
            
            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");

            axisY.call(d3.axisLeft(y).ticks(5))
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Years of Study").style("font-family", "Dosis").style("font-size", "20px")
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            axisLabelY.text("Wage ($ per hr)").style("font-family", "Dosis").style("font-size", "20px")
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            break;
      // x = Number of Jobs
      // y = Wage
        case 2:

            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");

            axisY.call(d3.axisLeft(y).ticks(5))
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("font-family", "Dosis").style("font-size", "20px")
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            axisLabelY.text("Wage ($ per hr)").style("font-family", "Dosis").style("font-size", "20px")
            .attr("opacity", 0).transition().duration(500).attr("opacity",1);
            break;
  }


d3.select("#industry").style("display","none");
d3.select("#random").style("display","none");
d3.select("#combine").style("width", "305px");
d3.select(".btn-group").style("padding-left", "0px");

d3.select("#chart").transition().duration(500).attr("height","800px");

}





function graphModeOff() {
createSliders();

d3.select("#graphModesDiv").style("visibility","hidden");

d3.select("#freeze").transition().duration(500).style("opacity", 1);

d3.select("#industry").transition().duration(500).style("display","inline");
d3.select("#random").style("display","inline");
d3.select("#combine").style("width", "");
d3.select(".btn-group").style("padding-left", "0px")

d3.select("#chart").transition().duration(500).attr("height","700px");

    // remove axes
    axisG.attr("opacity", 1).transition().duration(500).attr("opacity",0)
    .remove();

    // Transition back to original positions
    circles.transition()
    .duration(750)
    .attr("r", function(d) { return originalRadius[d.id] })
    .style("fill", function(d) { return color(d.cluster) })
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

    setTimeout(function() {
      circles
      .style("stroke", "none");
    }, 500);

    // start the simulation after the transition delay
    setTimeout(function() {
      simulation.alphaTarget(0.2).restart();
    }, 750);
    
    return;

}








///////////////// Future View Mode ////////////////////


var futureMode = 0;
var automationRadiusScale = d3.scaleSqrt()
  .domain([0,1]).range([maxRadius,0]);
var automationColor = d3.scaleLinear()
  .domain([0,1]).range(['green','red']);


// Transition node areas and colours to automationRisk
  var pastPosX = {};
  var pastPosY = {};

d3.select("#futureView").on('click', function(d) {
  // Toggle mode on or off
  futureMode = 1-futureMode;
  console.log("futureMode = ", futureMode);
  ////////////// FUTURE VIEW ON! ////////////////
  if (futureMode == 1) {
    futureModeOn();
  }  //////////////// Future mode off. ///////////////////

  // If turning off:
  if (futureMode == 0) {
    if (graphMode == 0) { createLegend(0) }
    futureModeOff();
  }; 
  
  // TODO: modularize graph mode in js folder
  // $.getScript("./js/graph-module.js");
})
//store the positions in future mode for un-filtering
var futurePositions = [];

function futureModeOn() {
    legend.transition().duration(500).attr("opacity", 0);

    // cool to 0 degrees
    simulation.stop();
    // store previous positions
    nodes.forEach(function(d) {
      pastPosX[d.id] = d.x;
    });
    nodes.forEach(function(d) {
      pastPosY[d.id] = d.y;
    });
 
    // if graph mode off
    if (graphMode == 0) {

    // create random positions & store for un-filtering
    nodes.forEach(function(d) {
      futurePositions[d.id] = [
        // x positions
        d.x + Math.random()*width/2 + Math.random()*(1-d.automationRisk)*50 -25 -width/4,
        // y positions
        d.automationRisk*height*0.9 - height/2 + margin.top + 20 + Math.random()*(1-d.automationRisk)*100
      ];
    });
    // transition circles' areas, colours, positions
    circles.transition()
    .duration(750)
      .attr("cx", function(d) { return futurePositions[d.id][0] })
      .attr("cy", function(d) { return futurePositions[d.id][1] })
      .attrTween("r", function(d) { // transition x position to...
        var i = d3.interpolate(d.radius, automationRadiusScale(d.automationRisk));
        return function(t) { return d.radius = i(t); };
      })
      .styleTween("fill", function(d) {
        var i = d3.interpolate(color(d.cluster), automationColor(d.automationRisk));
        return function(t) { return d.color = i(t); };
      });
    }


    // if graph mode on
    if (graphMode == 1) {
    // transition circles' areas & colours
    circles.transition()
    .duration(750)
      .attrTween("r", function(d) { 
        var i = d3.interpolate(d.radius, automationRadiusScale(d.automationRisk));
        return function(t) { return d.radius = i(t); };
      })
      .styleTween("fill", function(d) {
        var i = d3.interpolate(color(d.cluster), automationColor(d.automationRisk));
        return function(t) { return d.color = i(t); };
      });
    }

    setTimeout(function() {
      circles.style("stroke", "black");
    }, 500);

}

function futureModeOff() {
    // if graph mode off
    if (graphMode == 0) {
    // Transition back to original attributes, styles, positions
    circles.transition()
    .duration(750)
      // set x, y values
    .attr("cx", function(d) { return pastPosX[d.id] })
    .attr("cy", function(d) { return pastPosY[d.id] })
    .attrTween("r", function(d) {
      var i = d3.interpolate(automationRadiusScale(d.automationRisk), originalRadius[d.id])
      return function(t) { return d.radius = i(t); };
    })
    .styleTween("fill", function(d) {
      var i = d3.interpolate(automationColor(d.automationRisk), color(d.cluster));
      return function(t) { return d.color = i(t); };
    });

    setTimeout(function() {
      simulation.alphaTarget(0.2).restart();
    }, 750);
  }
  // if graph mode on
  if (graphMode == 1) {
  // Transition back to original attributes & styles
    circles.transition()
    .duration(750)
    .attrTween("r", function(d) {
      var i = d3.interpolate(automationRadiusScale(d.automationRisk), originalRadius[d.id])
      return function(t) { return d.radius = i(t); };
    })
    .styleTween("fill", function(d) {
      var i = d3.interpolate(automationColor(d.automationRisk), color(d.cluster));
      return function(t) { return d.color = i(t); };
    });

  }

    setTimeout(function() {
      circles.style("stroke", "none");
    }, 500);
    return;

}





///////////// Reset Filters /////////////

d3.select("#resetFilters").on('click', function(d) {
  // if (graphMode == 1) {
  //   graphMode = 0;

  //   graphModeOff();
  // }
  resetFilters();
});

function resetFilters() {
  // reset the slider positions
  for(var i=0; i<sliderArray.length; i++) {
    handleArray[i].attr("cx", sliderScaleArray[i](0)); // move the slider handle
    sliderPositionsArray[i] = 0; // Update the slider positions array
  };
  // reset all circles
  circles = circles.data(store, function(d) { return d.id });
  // ENTER (create the circles with all attributes)
  enterUpdateCircles();
  // restart simulation only if graph mode off
  if (graphMode == 0) {
    if (futureMode == 1) {
      futureMode = 0;
      futureModeOff();
      setTimeout(function(){ resetSimulation() }, 750);
    } else if (futureMode == 0) {
      resetSimulation();
    } 
  } else if (graphMode == 1) { // TODO: not working
    circles
    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
    .attr("cy", function(d){ return (1-d.automationRisk)*height*0.9 - height/2 + 100})
  };
};


function resetSimulation() {
  simulation.nodes(store)
  .force("collide", forceCollide)
  .force("cluster", forceCluster)
  .force("gravity", forceGravity)
  .force("x", forceXCombine)
  .force("y", forceYCombine)
  .on("tick", tick);
  simulation.alphaTarget(0.2).restart();
}

/////// Tooltips (post-filter)

function enterUpdateCircles() {
    var newCircles = circles.enter().append("circle")
    .attr("r", function(d) { return d.radius }) // start at full radius
    .style("fill", function(d) { return color(d.cluster); })

    // Tooltips
    .on("mouseover", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      // create the hover tooltip
      div.transition()
      .duration(200)
      .style("opacity", .96)
      .style("height", "auto")
      .style("width", "350px")
      // .style("border",   "1px solid black;");

      // d3.select("#tooltip")
      // .append("image")
      //   .attr("src", "img/logo.png")
      //   .attr("class", "img-rounded");

      // Display Hover Tooltip
      div.html("<div style='font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div style='color: " + colorTooltip(d.cluster) +"; padding-left: 10px; font-size: 15px; font-family: Raleway;'>"
                                +"<br/>Some job titles from this group are ..."
                +"<ul><li>"+d.title1+"</li><li>"+d.title1+"</li><li>"+d.title1+"</li></ul></div>")
        // Move div above mouse by "top" + radius and right by "left"
        .style("left", (d3.event.pageX) + 20 + "px")
        .style("background", color(d.cluster) )
        .style("top", (d3.event.pageY - 80) - d.radius + "px");

      // div2.transition()
      // .duration(200)
      // .style("left", (d3.event.pageX) + 20 + "px")
      // .style("top", (d3.event.pageY - 80) - d.radius + "px")
      // .style("opacity", .9)

      // div2.html("test")
      })
    .on("mouseout", function(d) {
      if (clicked == 1) return;

      // clicked = 0;
      d3.select(this).attr("stroke", "none");
      div.transition()
      .duration(500)
      .style("opacity", 0);
    })
    .on("click", function(d) {
      // click-on, click-off
      clicked = 1-clicked;
      div
      .html("<div style='font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div style='padding-left: 10px; font-family: Raleway; font-size: 15px; color: " + colorTooltip(d.cluster) +";'>"
                +"<br/>Some job titles from this group are ..."
                +"<ul><li>Title1</li><li>Title2</li><li>Title3</li></ul>"
                +"Top Jobs Placeholder" 
                +"<br/><br/>Top skills are (placeholders)" + d.skillsComp + ", " + d.skillsMath + ", and " + d.skillsLang
        // Insert extra info to display on click
                +"<br/><br/>" + 
                "<ul> <li>" + Math.round(10*d.yearsStudy)/10 + " years is the typical number of years of studying required to do jobs in this group.</li>"
                +"<br/><li>Median wage is $" + Math.round(100*d.wage)/100 + " per hr.</li>"
        + "<br/><li>Machine automation risk is " + Math.round(1000*d.automationRisk)/10 + "%</li>"
        + "<br/><li>This group currently has " + d.workers + " Jobs</li>"
        +"<br/><br/></div><span style='padding-left: 225px'></span><button href='www.google.ca' class='btn btn-md btn-default'"+
         "style='box-shadow: 3px 3px 3px grey; font-size: 16px; font-family: Raleway; background: white; color: " + color(d.cluster) 
         +";'> View more</button></span></br></br> ").transition().duration(300).style("width", "350px")
        // Unfurl downward
        // .style("height", 200)
        // .transition()
        // .duration(200)
        // .style("height", "auto")
        .style("height", "auto");
      });
  drag_handler(newCircles);
  //  ENTER + UPDATE
  circles = circles.merge(newCircles);

}



  /////////// Legend /////////////////
// legendG = d3.select("#legend").append("");
// legendG = d3.select("#legend").append("");

var legendHeight = 10;

var legend;
var bottomLegend;

// function createBottomLegend() {}

function createLegend(mode) {

              industriesArray = [
              'Natural resources, agriculture and related production occupations',
              'Management occupations',
              'Occupations in art, culture, recreation and sport',
              'Trades, transport and equipment operators and related occupations',
              'Business, finance and administration occupations',
              'Occupations in education, law and social, community and government services',
              'Natural and applied sciences and related occupations',
              'Occupations in manufacturing and utilities',
              'Health occupations',
              'Sales and service occupations',
              ]

    switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:
          // transition circles to graph positions

              legend = svg.selectAll("#legend")
                  .data(d3.range(10))
                  .enter().append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) { return "translate(5," + ((i * 22) - 130) + ")"; })
                  .style("fill", function(d, i) { return d3.schemeCategory10[i] });

              legend.append("rect")
                  .attr("x", width/2 - margin.right - 10)
                  .attr("width", 16)
                  .attr("height", 16)
                  .attr("transform", "translate(10," + legendHeight + ")")
                  .style("opacity",0).transition().duration(500).style("opacity", 1)

              legend.append("text")
                  .attr("x", width/2 - margin.right - 0 )
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "translate(0," + legendHeight + ")")
                  .style("text-anchor", "end")
                  .style("font-family", "Raleway")
                  .text(function(d, i) { return industriesArray[i].substring(0,30) + "..."; })
                  .style("opacity",0).transition().duration(500).style("opacity", 1);

          break;
      // x = Years of Study
      // y = Wage
        case 1:
          break;
      // x = Number of Jobs
      // y = Wage
        case 2:
            break;
      // x = Number of Jobs
      // y = Automation Risk
        case 3:

            break;
        case 4:

            break;
        case 5:

            break;
        case 6:

    }


}

createLegend(0);


// Expand buttons
d3.select("#expandSkills1").on('click', function() {
// For Each Slider create the slider
for(var i=0; i<sliderArray.length; i++) {
   
    // Language subskills
  if ([13,15,19].includes(i)) { column = 1, hidden = "visible"
    // Title & SVG
  // d3.select("#slider_"+i)
  //   .style("visibility", hidden)
  //     .text("test1")


  // d3.select("#slider_"+i).append("text").text("test")
    // .append("text")
    // .html("test")
    // .html("<br>"+sliderTitlesArray[i]+"<br>")
  // .append("svg")
  //   .style("visibility", hidden)
  //   .attr("id", "slider_"+i)
  //   .attr("width", 250)
  //   .attr("height", 50);

    // logic subskills
  } else if ([7,9,14,20].includes(i)) { column = 1, hidden = "visible";
  // Title & SVG
  sliderSVGArray[i].style("visibility", "visible")
    .append("text")
      // .attr("class", "sliderTitle_"+i)

  }

}

});























            // d3.select("#chart").moveToFront();



///////////////////////////////// Filters ////////////////////////////////////







//////////////// Filter Slider 1: Filter by Dropdown //////////////////////

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
  
    sliderDropdown.remove();
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

    handleDropdown.remove();
    var handleDropdown = sliderDropdown.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  })

//////////////// Filter Functions 1: Dropdown //////////////////////

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
  // update the slider handle position
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
  enterUpdateCircles();
  // simulation forces on filter
  simulation.nodes(filterNodesDropdown(h))
  .force("collide", forceCollide)
  .force("cluster", forceCluster)
  .force("gravity", forceGravity)
  .force("x", forceXCombine)
  .force("y", forceYCombine)
  .on("tick", tick);
  simulation.alphaTarget(0.2).restart();
}















//////////////// Filter Sliders 2: Multiple Sliders from an Array //////////////////////


// sliders to create
var sliderArray = ["wage", "workers", 
    // skills
    "skillsLang", "skillsLogi", "skillsMath", "skillsComp",
    // subskills
    "s1DataAnalysis","s2DecisionMaking","s3FindingInformation","s4JobTaskPlanningandOrganizing",
    "s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s8OralCommunication",
    "s9ProblemSolving","s10Reading","s11SchedulingorBudgetingandAccounting","s12DigitalTechnology",
    "s13DocumentUse","s14Writing","s15CriticalThinking"
];

// var sliderArrayStats = ["wage", "workers"];

// var sliderArrayLang = ["skillsLang",
//     // subskills
//    "s8OralCommunication","s10Reading","s14Writing"];

// var sliderArrayLogi = ["skillsLogi",
//     // subskills
//     "s2DecisionMaking","s3FindingInformation","s4JobTaskPlanningandOrganizing",
//     "s9ProblemSolving","s15CriticalThinking"];

// var sliderArrayMath = ["skillsMath",
//     // subskills
//     "s1DataAnalysis","s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation",
//     "s11SchedulingorBudgetingandAccounting"];

// var sliderArrayComp = ["skillsComp",
//     // subskills
//     "s1DataAnalysis","s3FindingInformation","s12DigitalTechnology","s13DocumentUse",];


var sliderPositionsArray = []; // array to track all sliders
var sliderSVGArray = []; // array of slider SVGs
var sliderScaleArray = []; // array of slider scale functions
var sliderMulti = []; // array of sliders
var handleArray = []; // array of slider handles
var listToDeleteMulti = []; // filtered IDs
var sliderTitlesArray = [
"Wage ($/hr)", "Number of Jobs", "Language Skills", "Logic Skills", "Math Skills", "Computer Skills",
  // subskills
    "Data Analysis","Decision-Making","Finding Information","Job Task Planning and Organizing",
    "Measurement and Calculation","Money Math","Numerical Estimation","Oral Communication",
    "Problem Solving","Reading","Scheduling or Budgeting and Accounting","Digital Technology",
    "Document Use","Writing","Critical Thinking"
    ]

createSliders();

function createSliders(){
// For Each Slider create the slider
  for(var i=0; i<sliderArray.length; i++) {
    var column, 
        hidden = "visible", 
        mainskill = false, 
        ytranslate = -50;
    // Wage, Number of Jobs
    if (i<2) { column = 2, hidden = "hidden"
      ytranslate = 550;
    // Language, Logic skills
    } else if (i<4) { column = 1, mainskill = true;
      if (["Logic Skills","Computer Skills"].includes(sliderTitlesArray[i])) {
        ytranslate = 550;
      }
    // Math, Computer skills
    } else if (i<6) { column = 3, mainskill = true;
      if (["Logic Skills","Computer Skills"].includes(sliderTitlesArray[i])) {
        ytranslate = 550;
      }
      // language subskills
    } else if ([13,15,19].includes(i)) { column = 1, hidden = "hidden"
      // logic subskills
    } else if ([7,9,14,20].includes(i)) { column = 1, hidden = "hidden"
      // Math subskills
    } else if ([10,11,12,16].includes(i)) { column = 3, hidden = "hidden"
      // Computer subskills
    } else if ([6,8,17,18].includes(i)) { column = 3, hidden = "hidden"}
  
    //  if(i==2 || i==3) {ytranslate=ytranslate+20};

  // Title & SVG

  var sliderPositionsOnPageHeight = 875;

  sliderSVGArray[i] = d3.select("#sliderArray"+column)
  .append("text")
    .style("visibility", hidden)
    .html("<br><div style='position: absolute; left: 0px; top: "+(-sliderPositionsOnPageHeight-55+ytranslate)+"px; padding-right: 80px; font-size: 18px; font-weight: bold; color:  #579E38; font-family: Raleway' align='left'>"
      +sliderTitlesArray[i] // "Language Skills"
      +"<span style='padding-left: 10px'></span><img style='padding-bottom: 2px;' src='img/question.png' alt='help' height='20' width = '18'>"
      +"</div>"+"<span style='position: absolute; left: 0px; top: "+(-sliderPositionsOnPageHeight+20+ytranslate)+"px; color:  #579E38; font-weight: bold; font-family: Raleway'>Not much<span style='padding-left: 135px'></span>"+"Lots</span>")
  .append("svg")
    .style("visibility", hidden)
    .style("position", "absolute")
    .style("top", (-sliderPositionsOnPageHeight+ytranslate)-30+"px") // y position
    .style("right", 140+"px") // x position
    .attr("id", "slider_"+i)
    .attr("width", 250)
    .attr("height", 50);

  // Scale
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){ return d[sliderArray[i]]})])
    .range([0, 200]) // Width of slider is 200 px
    .clamp(true);

  // Move Wage, Number of Jobs down
    // Slider
  sliderMulti[i] = sliderSVGArray[i].append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

  // track
  sliderMulti[i].append("line")
  .attr("class", "track")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .select(function() {
    // console.log("i4: ", i);
    return this.parentNode;
  }) // inset
  .append("line")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .attr("class", "track-inset")
  .select(function() {
    return this.parentNode;
  }) // overlay
  .append("line")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .attr("class", "track-overlay")
  .attr("id", i)
  .call(d3.drag()
    .on("start.interrupt", function() {
      sliderMulti[event.target.id].interrupt();
    }) // drag update function
    .on("start drag", function() {
      updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x)); // pass the current line id to update function
    }));

  handleArray[i] = sliderMulti[i].insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);
};


// Update function which detects current slider
//  general update pattern for updating the graph
function updateMulti(h) {
 
  // using the slider handle
  var sliderID = event.target.id;
  handleArray[sliderID].attr("cx", sliderScaleArray[sliderID](h)); // move the slider ball
  
  // Update the slider positions array
  sliderPositionsArray[sliderID] = sliderScaleArray[event.target.id].invert(d3.event.x);
  //  UPDATE
  circles = circles.data(filterAll(), function(d) { return d.id });
  
  // EXIT
  circles.exit().transition().duration(300)
  // exit transition: "pop" radius * 1.5 + 5 & fade out
  .attr("r", function(d) { return d.radius * 1.5 + 5 })
  .attrTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return d.opacity = i(t); };
  })
  .remove();

  // ENTER (create the circles with all attributes)
  enterUpdateCircles();

  // reset simulation if graph mode = off
  if (graphMode == 0 && futureMode == 0) {
    simulation.nodes(filterAll())
    .force("collide", forceCollide)
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);
    simulation.alphaTarget(0.2).restart();
  } else if (graphMode == 1) { // else reposition nodes on graph
    circles
    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
    .attr("cy", function(d){ return (1-d.automationRisk)*height*0.9 - height/2 + 100})
  } else if (futureMode == 1) {
    circles
    .attr("cx", function(d){ return futurePositions[d.id][0] })
    .attr("cy", function(d){ return futurePositions[d.id][1] })
    .attr("r", function(d) { return d.radius; })
    .style("fill", function(d) { return d.color; })
    .style("stroke", "black")
  }
};

};













//////////////// Filter Functions 3: filter on all variables at once //////////////////////

filterAll = function() {
  // h = sliderScaleArray[event.target.id].invert(d3.event.x)
  // START by filtering out nodes under the minimums
  store.forEach(function(d) {
    // INEFFICIENT -- TODO: fewer loops
      // first, take all nodes off the list              OR loop through sliders removing, then loop through adding?
      if (listToDeleteMulti.includes(d.id)) listToDeleteMulti.splice(listToDeleteMulti.indexOf(d.id),1);
      // then loop through the sliders array and put you on the list
      for(var s=0; s<sliderPositionsArray.length; s++){
        // if the slider position is above your value, put you on the list
        var checkMin = sliderPositionsArray[s];
        if(d[sliderArray[s]] < checkMin && !listToDeleteMulti.includes(d[sliderArray[s]])) {
          listToDeleteMulti.push(d.id);
        }

      }
      
    });
    // reset the graph
  graph = [];
  // THEN update the graph based on the filter list
  store.forEach(function(n) {
    // if you're not on the filter list
    if (!listToDeleteMulti.includes(n.id)) {
      // put you on the graph         (start graph empty? or check)
      graph.push(n);
    // if you're on the list
    } else if (listToDeleteMulti.includes(n.id)) {
      graph.forEach(function(d, p) {
        if (n.id === d.id) {
          graph.splice(p, 1); // get you off of there!
        }
      })
    };
  });
  return graph;
}

  // sliderArrayUpdateFunctions[i] = updateMulti;



})