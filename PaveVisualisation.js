var circles, drag_handler, enterUpdateCircles, graphMode, futureMode, simulation, listToDeleteMulti,
forceCollide, forceXCombine, forceYCombine, forceGravity, forceXSeparate, forceYSeparate, 
forceXSeparateRandom, forceYSeparateRandom, forceCluster, tick, legend, graphYtranslate, currentMode, resetFilters, compressY, width, height, maxWorkers, maxWage,
hoverTimeout;

var sticky = []; // whether or not the current circle is expanded
var circleExpanded = []; // whether or not the current circle is expanded
var circlesExpanded = 0;
var legendCreated = 0;
var graphFirstTime = true;
var legendMode = 0;
var equalRadius = 6.5;
// sliders to create
// var sliderArray = [
// // "skillsLang", "skillsLogi", "skillsMath", "skillsComp",
//     // subskills
//     "s1DataAnalysis","s2DecisionMaking","s3FindingInformation","s4JobTaskPlanningandOrganizing", // reorganize to match lang-log-mat-com
//     "s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s8OralCommunication",
//     "s9ProblemSolving","s10Reading","s11SchedulingorBudgetingandAccounting","s12DigitalTechnology",
//     "s13DocumentUse","s14Writing","s15CriticalThinking"
// ];

////////////////////// Hover divs for question marks //////////////////////////////

var sliderArray = [
"skillsLang", "skillsLogi", "skillsMath", "skillsComp",
    // subskills
    "s8OralCommunication","s10Reading","s14Writing",
    
    "s4JobTaskPlanningandOrganizing","s9ProblemSolving","s15CriticalThinking","s2DecisionMaking",
    
    "s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s11SchedulingorBudgetingandAccounting",
      
    "s1DataAnalysis","s3FindingInformation","s12DigitalTechnology","s13DocumentUse"
];

// var sliderTitlesArray = ["Language skills", "Logic skills", "Math skills", "Computer skills",
//   // subskills
//     "Data Analysis","Decision-Making","Finding Information","Job Task Planning and Organizing",
//     "Measurement and Calculation","Money Math","Numerical Estimation","Oral Communication",
//     "Problem Solving","Reading","Scheduling or Budgeting and Accounting","Digital Technology",
//     "Document Use","Writing","Critical Thinking"
//     ];

var sliderTitlesArray = [
// "Language skills", "Logic skills", "Math skills", "Computer skills",
  // subskills
    "Oral Communication","Reading","Writing",
    "Job Task Planning and Organizing","Problem Solving","Critical Thinking","Decision-Making",
    "Measurement and Calculation","Money Math","Numerical Estimation","Scheduling or Budgeting and Accounting",
    "Data Analysis","Finding Information","Digital Technology","Document Use"
    ];

var sliderArrayMain = ["skillsLang", "skillsLogi", "skillsMath", "skillsComp"];

var sliderTitlesArrayMain = [
"Language skills", "Logic skills", "Math skills", "Computer skills",
];

// var sliderArrayStats = ["wage", "workers"];

var sliderArrayLang = ["s8OralCommunication","s10Reading","s14Writing"];
var sliderTitlesArrayLang = ["Oral Communication","Reading","Writing"];

var sliderArrayLogi = ["s2DecisionMaking","s4JobTaskPlanningandOrganizing","s9ProblemSolving","s15CriticalThinking"];
var sliderTitlesArrayLogi = ["Decision-Making","Job Task Planning and Organizing","Problem Solving","Critical Thinking"];

var sliderArrayMath = ["s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s11SchedulingorBudgetingandAccounting"];
var sliderTitlesArrayMath = ["Measurement and Calculation","Money Math","Numerical Estimation","Scheduling, Budgeting, Accounting"];

var sliderArrayComp = ["s1DataAnalysis","s3FindingInformation","s12DigitalTechnology","s13DocumentUse",];
var sliderTitlesArrayComp = ["Data Analysis","Finding Information","Digital Technology","Document Use"];


var sliderPositionsArray = []; // array to track all sliders
var sliderSVGArray = []; // array of slider SVGs
var sliderScaleArray = []; // array of slider scale functions
var sliderMulti = [];
var handleArray = []; // array of slider handles
listToDeleteMulti = []; // filtered IDs

var filteredIndustries = [];













// Log Clicked Node & ID using jQuery
$( "body" ).click(function( event ) {
    console.log( "clicked: " + event.target.nodeName, event.target.id);
});

// init foundation (used for joyride) (redundant?)
// $(document).foundation()

// d3.selection.prototype.moveToFront = function() {  
//       return this.each(function(){
//         this.parentNode.appendChild(this);
//       });
//     };


var graph, store; // displayed, stored data
var clicked = 0; // on: tooltips don't disappear

// load the data
createViz();
function createViz() {
d3.csv("NOC_494_interpolated.csv", function(error, datapoints) {
  if (error) throw error;


// Setting the dropdown options
  // grab the headers array
// var headersString = [];
// datapoints.forEach(function(row) { 
//   if (row.id == 1) headersString += (String(Object.keys(row)));
// });
// var headersSplit = headersString.split(",");
  // add the options html string
// var options;
// for(var h=0; h<=headersSplit.length; h++){
// options += "<option>"+ headersSplit[h] +"</option>"; // switch to headersString[h]
  // when you get to the last subskill, end
// if(headersSplit[h] == "s15CriticalThinking") h = headersSplit.length;
// }
    // set the options 
// document.getElementById("dropdown1").innerHTML = options;
    // set title & reset the title when new option selected
// document.getElementById("dropdown1Title").innerHTML = "Filter Jobs by: " + dropdown1.value;
// d3.select("#dropdown1").on('click', function(d){
    // document.getElementById("dropdown1Title").innerHTML = "Filter Jobs by: " + dropdown1.value;
// })


// Viz dimensions & margins
var margin = {top: 20, right: 20, bottom: 50, left: 50};
width = window.innerWidth/1.5, // set chart dimensions
height = window.innerHeight/1.5,
    maxRadius = 30; // Max circle radius


///////////////// TODO: Mobile version /////////////////
// ontouch instead of onclick
// stack filters below break poin

resize();
d3.select(window).on("resize", resize);
// resize the window
function resize() {
  if(typeof circles != "undefined"){
    circles.attr("transform", circleHeight(0, 28 )) //flag! need to make equation for width/height ratio
  }

  graphYtranslate = window.innerHeight*0.12 - 16;
  // return "translate("+window.innerWidth*0.5+","+ (165 + window.innerHeight*0.12) +")"

  // Add an axis-holder group
  if(typeof axisG != "undefined") {
    axisG.attr("transform", "translate(0," + graphYtranslate + ")");
    // axisX.attr("transform", circleHeight(window.innerWidth*-0.25,0));
    // Add the X Axis
    // axisX.attr("transform", "translate("+window.innerWidth*0.23+","+window.innerHeight*0.43+")");
    // // .call(d3.axisBottom(x).ticks(5))
    // // text label for the x axis
    // axisLabelX.attr("transform", "translate("+window.innerWidth*0.50+","+window.innerHeight*0.5+")")

    // // Add the Y Axis
    // axisY.attr("transform", "translate("+window.innerWidth*0.23+","+( -15 )+")")

  }


  if(window.innerWidth<641){ // Phones
    margin = {top: 20, right: 12, bottom: 20, left: 12}
  }
}
// //   for(var i=0; i<4; i++){
// //     d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
// //       +"<span id='notmuchSpan_"+i+"' style='margin-left: "+window.innerWidth*0.135+"px'></span>"
// //       +"Lots")  
// //   }  
// // // }
// // // if(window.innerWidth<=1024){
// // //   for(var i=0; i<4; i++){
// // //     d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
// // //       +"<span id='notmuchSpan_"+i+"' style='margin-left: 50%'></span>"
// // //       +"Lots")  
// // //   }  
// //   if(window.innerWidth<=954){
// //     for(var i=0; i<4; i++){
// //       d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
// //         +"<span id='notmuchSpan_"+i+"' style='margin-left: 40%'></span>"
// //         +"Lots")  
// //     }
// //     if(window.innerWidth<768){
// //       for(var i=0; i<4; i++){
// //         d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
// //           +"<span id='notmuchSpan_"+i+"' style='margin-left: 40%'></span>"
// //           +"Lots")
// //       } 
// //       if(window.innerWidth<684){
// //         for(var i=0; i<4; i++){
// //           d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
// //             +"<span id='notmuchSpan_"+i+"' style='margin-left: 30%'></span>"
// //             +"Lots")
// //         }
        
// //         for(var i=0; i<4; i++){
// //           d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
// //             +"<span id='notmuchSpan_"+i+"' style='margin-left: 20%'></span>"
// //             +"Lots")
// //         }

// //         if(window.innerWidth<576){
// //           for(var i=0; i<4; i++){
// //             d3.select("#notmuchlots_"+i).html("<span style='font-size: 24px;'>-&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp+</span>")
// //             // d3.select("#sliderArray1").style("margin-right", "-700%")
// //             // d3.select("#sliderArray3").style("margin-left", "-700%")
// //           }        
// //           if(window.innerWidth<512){
// //             for(var i=0; i<4; i++){
// //               // d3.select("#sliderArray1").style("margin-right", "-700%")
// //               // d3.select("#sliderArray3").style("margin-left", "-700%")
// //             }
// //           }
// //         }
// //       }
// //     }  
// //   }
// // // }
  
// // d3.select("#futureView").style("margin-top", "0px")
// // if(window.innerWidth<576){
// //   d3.select("#futureView").style("margin-top", "10px")
// // }

// // if(window.innerWidth<768){
// //   // d3.select("#sliderArray1").style("margin-right", "-500%")
// //   // d3.select("#sliderArray3").style("margin-left", "-500%")
// //   d3.select("#split").style("display","none")

// //   d3.select("#shuffle").style("visibility", "visible")
// //   if(window.innerWidth<750) {
// //     d3.select("#shuffle").style("visibility", "hidden")
// //     if(window.innerWidth<684) {
// //       // d3.select("#sliderArray1").style("margin-right", "-600%")
// //       // d3.select("#sliderArray3").style("margin-left", "-600%")
// //     }
// //   }
// // }
// // if(window.innerWidth>=768){
// //   // d3.select("#sliderArray1").style("margin-right", "-300%")
// //   // d3.select("#sliderArray3").style("margin-left", "-300%")
// //   d3.select("#split").style("display","inline")

// // }

// //   // svg.attr("viewBox", "-"+width/2+" -"+height/2+" "+width+" "+height+"");
//   // svg.attr("width", width).attr("height", height);
// }


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
// var color = d3.scaleOrdinal(d3.schemeCategory10)
//     .domain(d3.range(m))

var color = d3.scaleOrdinal()
    .domain(d3.range(m))
    .range([
          "#4B40DD",
          "#D42A2F",
          "#329E33",
          "#BCBC35",
          "#2678B2",
          "#AA3DAA",
          "#FD7F27",
          "#7F7F7F",
          "#8B564C",
          "#29BECE",
      ]);

var colorTooltip = d3.scaleOrdinal()
    .domain([0,1,2,3,4,5,6,7,8,9])
    .range(["white", // blue
            "white", // orange
            "white", // green
            "white", // red
            "white", // purple
            "white", // brown
            "white", // pink
            "white", // grey
            "white", // yellow-green
            "white" ]) // teal

var colorTooltip2 = d3.scaleOrdinal()
    .domain([0,1,2,3,4,5,6,7,8,9])
    .range(["#3E35B5", // blue
            "#AE2327", // 
            "#29822A", // green
            "#9A9A2C", // red
            "#206392", // purple
            "#8C328C", // pink
            "#D06820", // orange
            "#686868", // grey
            "#72473F", // brown
            "#229CA9" ]) // teal

var colorSkillbar = d3.scaleOrdinal()
    .domain([0,1,2,3,4,5,6,7,8,9])
    .range(["#256D1B", // purple
            "#256D1B", // red
            "#244F26", // green
            "#256D1B", // red
            "#244F26", // blue
            "#256D1B", // pink
            "#256D1B", // orange
            "#256D1B", // grey
            "#256D1B", // brown
            "#256D1B" ]) // teal
// var colorTooltip = d3.scaleOrdinal()
//     .domain([0,1,2,3,4,5,6,7,8,9])
//     .range(["#FBFFF1", // blue
//             "#FFECCC", // orange
//             "#FDFFFC", // green
//             "#EAFFDA", // red
//             "#F7F7FF", // purple
//             "#CCDBDC", // brown
//             "#F6F7EB", // pink
//             "#F3F7F0", // grey
//             "#EAEBED", // yellow-green
//             "#EDDDD4" ]) // teal

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
  r = equalRadius, // start equal radii
  d = {
    id: +el.id,
    favourite: 0,
    // transparent: false,
    cluster: i, 
    radius: r, 
    job: el.job,
    allTitles: el.allTitles,
    topSkill1: el.topSkill1,
    topSkill2: el.topSkill2,
    topSkill3: el.topSkill3,
    title1: el.title1,
    title2: el.title2,
    title3: el.title3,
    industry: el.industry, 
    industryNum: el.industryNum, 
    noc: el.noc, 
    workers: +el.workers,
    wage: el.wage,
    automationRisk: el.automationRisk,
    yearsStudy: el.yearsStudy,
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
maxWorkers = d3.max(nodes, function(d){ return d.workers});


// Graph mode
    // Toggle for graph mode = off initially
graphMode = 0;
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
.strength(function(d) { return -10 * d.radius })
// .strength(function(d) { return -7 * automationRadiusScale(d.automationRisk) })
var forceXSeparate = d3.forceX(function(d) {
  return ((width / m) * d.cluster - width/2 - 20) //try window.innerWidth??
}).strength(0.3)
var forceYSeparate = d3.forceY(function(d) {
  return ((height / 2) * d.cluster/40 - 50)
}).strength(0.3)
var forceXSeparateRandom = d3.forceX(function(d) {
  Math.random();
  return ( (width / m) * 10 * Math.random() - width/2 + 0)
}).strength(0.4)
var forceYSeparateRandom = d3.forceY(function(d) {
  return ( Math.random() * (height/2) - 150 )
}).strength(0.3)
// var forceX5By2 = d3.forceX(function(d) { // 10-grid force example
//     if (d.cluster/5<1) return d.cluster/5;
//     if (d.cluster/5>1) return d.cluster/5+1;
// })
    // force the circles toward their cluster nodes

var clusterForce = 3.5;
function forceCluster(alpha) { 
  // alpha = attractor force
  for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.10; i < n; ++i) {
    node = nodes[i];
    cluster = clusters[node.cluster];
    node.vx -= (clusterForce*node.x - cluster.x) * k;
    node.vy -= (clusterForce*node.y - cluster.y) * k;
  }
  // for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.1; i < n; ++i) {
  //   node = nodes[i];
  //   cluster = clusters[node.cluster];
  //   node.vx -= (3*node.x - cluster.x) * k;
  //   node.vy -= (3*node.y - cluster.y) * k;
  // }
  }
    // Update the positions each tick
    console.log(window.innerWidth*0.3)
tick = function() {

  circles
  .attr("cx", function(d) { 


      // if sticky
      if(sticky[d.id] == 2){
        // stuck
        return window.innerWidth*0.4 
      } else if(sticky[d.id] == 1){
        return window.innerWidth*-0.4
      } else {
      return d.x; 
      }
  })
  .attr("cy", function(d) { 
    return d.y; });
}


    // The force simulation
simulation = d3.forceSimulation()
.nodes(store)
    // .force("center", d3.forceCenter())
    .force("collide", forceCollide)
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);


// Tooltip div (on hover)
var div = d3.select("body").append("div").style("width", "360px").style("border-radius", "6px").attr("id","tooltip")
var div2;
var miniTooltip;

// Append a group element to the svg & move to center
var svg = d3.select("#chart")
  .append('svg').style("position","absolute").style("z-index", "-1")

var stretch_y = 1.7;
var compress_y = 0.7;
var skillsBarsXtranslate = -15;
var skillsBarsYtranslate = 80;
// TODO: merge pre, post-filtering
///////////////////////// Circles, Tooltips (pre-filtering) /////////////////////////////

function circleHeight(xtrans,ytrans) {
  return "translate("+ (window.innerWidth*0.5 + xtrans)+","+ (window.innerHeight*0.12 + 165 + ytrans) +")"
}

// Add the circles with tooltips
circles = svg.selectAll("circle")
.data(nodes)
.enter().append("circle")
    .attr("r", 0) // start at 0 radius and transition in
    .attr("transform", circleHeight(0,0) ) //flag! need to make equation for width/height ratio
    .attr("id",function(d) { return "circle_"+d.id })
    .attr("class","jobCircle")
    .style("z-index", -1)
    .style("fill", function(d) { return color(d.cluster); })
    // Tooltips
    .on("mouseenter", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.selectAll("circle").attr("stroke", "none");
      d3.select(this)
        .style("fill", "url(#pattern_"+d.id+")" )
        // .attr("stroke", "black")
        .style("stroke-width", 2)
        .attr("stroke", color(d.cluster));
      showToolTip(0);
      tooltipMouseover(d);
      hoverTimeout = setTimeout(function(){
        tooltipLarge(d)
        clicked = 1
      }, 1750)
      })
    .on("mouseout", function(d) {

      if(!circleExpanded[d.id] == 1){
        d3.select(this)
          .style("fill", color(d.cluster) )
          // .attr("stroke", "black")
          .style("stroke-width", 2)
          .attr("stroke", color(d.cluster));
      }

      clearTimeout(hoverTimeout)
      if (clicked == 1) return;
      clicked = 0;
      hideToolTip(500)
      d3.select(this).attr("stroke", "none");
      // div.transition().duration(500).style("opacity", 0)

    })
    .on("click", function(d) {
      clearTimeout(hoverTimeout)
      // click-off
      if (clicked == 1) { 
        clicked = 0
        hideToolTip(500)
      // click-on
      } else if (clicked == 0) {
        clicked = 1;
        tooltipLarge(d);
       }
      // hideToolTip(0);
      // if(typeof div2 != "undefined") div2.transition().duration(250).style("height","0px").remove();
      // tooltipSmall(d);}
      })




// d3.select("body").on("mouseover", function(d){
//   // if clicked outside of left or right 1/5 page,
//   if(d3.event.pageX < window.innerWidth*0.2 || d3.event.pageX > window.innerWidth*0.8 ||
//      d3.event.pageY < window.innerHeight*0.2 || d3.event.pageY > window.innerHeight*0.8){
//     hideToolTip(500);
//   }
// })

d3.select("#chart").on("click", function(d){
  // hide any subskill sliders
  hideAll();
  closeLegends();
  if (graphMode == 0 && legendMode == 1) {
    smashTogether(0.3, 0.4);
  }
  // if clicked off of a circle
  if (clicked == 1) { 
    if (d3.event.target.nodeName == "circle") {
      return
    } else if (d3.event.target.nodeName == "svg") { clicked = 0
    hideToolTip(500) }
  }
})



function showToolTip(duration) {
      d3.select("#tooltip").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip0").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip1").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip2").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip3").transition().duration(duration).style("opacity",1)
      d3.select("#tooltipBottomDiv").transition().duration(duration).style("opacity",1)
      d3.select("#tooltipBottomDiv2").transition().duration(duration).style("opacity",1)

}

function hideToolTip(duration) {

      hideHoverImg();
      // fade out each tooltip contents object
      d3.select("#tooltip").transition().duration(duration).style("opacity",0)
      d3.select("#tooltip0").transition().duration(duration).style("opacity",0).remove()
      d3.select("#tooltip1").transition().duration(duration).style("opacity",0).remove()
      d3.select("#tooltip2").transition().duration(duration).style("opacity",0).remove()
      d3.select("#tooltip3").transition().duration(duration).style("opacity",0).remove()

      // shrink each tooltip div
      // d3.select("#tooltipBottomDiv").transition().duration(duration).style("height","0px").remove()
      // d3.select("#tooltipBottomDiv2").transition().duration(duration).style("height","0px").remove()
      
      d3.select("#tooltipBottomDiv2").transition().duration(duration).style("margin-top","-250px").style("opacity",0).remove()
      d3.select("#tooltipBottomDiv").transition().duration(duration).style("margin-top","-250px").style("opacity",0).remove()
      
      // fade the skill bar rects
      for (var i = 5; i < 9; i++) {
        d3.select("#rect"+i).transition().duration(duration).style("opacity",0).remove()
        d3.select("#rect"+i+"shadow").transition().duration(duration).style("opacity",0).remove()
      }

      // put the original tooltip on top
      d3.select("#moreBtnsContainerDiv").style("z-index","-1")
      d3.select("#moreBtnsDiv").style("z-index","-1")
      
      // shrink the more buttons div
      d3.select("#moreBtnsContainerDiv").transition().duration(300).style("width","20px").style("opacity",0).style("bottom","20px")
      d3.select("#moreBtnsDiv").transition().duration(180).style("opacity",0)
}




var defs = svg.append("defs");

// create for all 494? or create on the fly?

  // defs.append("pattern")

  defs.selectAll(".img-pattern")
    .data(datapoints)
    .enter().append("pattern")
    .attr("class", "img-pattern")
      .attr("id", function(d) { return "pattern_"+d.id} )
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("height", 1)
      .attr("width", 1)
      .attr("preserveAspectRatio", "none")
      // .attr("xmlns:xlink:href","/img/NOC_images/"+d.noc+".jpg")
      .attr("xlink:href",function(d) {
          return "/img/NOC_images/"+d.noc+".jpg"
        })



function createHoverImg(d) {

  var circLeft, circTop;
  
  if(graphMode == 0) {

    if(d3.event.pageX < window.innerWidth/2) { // left side
      circLeft = window.innerWidth*0.5 + (d.x) - 125;
      circTop = window.innerHeight*0.15 + ((window.innerHeight-300)*(d.y/window.innerHeight));

    }else if (d3.event.pageX >= window.innerWidth/2) { // right side
      circLeft = window.innerWidth*0.5 + (d.x) + 125;
      circTop = window.innerHeight*0.15 + ((window.innerHeight-300)*(d.y/window.innerHeight));
    }
  }else if(graphMode == 1) {

    if(d3.event.pageX < window.innerWidth/2) { // left side
      circLeft = window.innerWidth*0.5 + (d.cx) - 125;
      circTop = window.innerHeight*0.15 + ((window.innerHeight-300)*(d.cy/window.innerHeight));

    }else if (d3.event.pageX >= window.innerWidth/2) { // right side
      circLeft = window.innerWidth*0.5 + (d.cx) + 125;
      circTop = window.innerHeight*0.15 + ((window.innerHeight-300)*(d.cy/window.innerHeight));
    }
  }

  // console.log("creating Hover Img! for " + d.id + d.x)
  var imgCircle = d3.select("#chart").append("circle")
    .attr("class","circleImg")
    .attr("cx",circLeft)
    .attr("cy",circTop)
    .attr("fill", "url(#pattern_"+d.id+")")
  // .append("image").attr("xlink:href","/img/NOC_images/"+d.noc+".jpg")
    // .attr("cy",d3.select(function(){return this.parentNode}).attr("cy"))
    // .attr("r",d3.select(function(d){return d.r}))
      .transition().duration(350)
    .attr("r","100px")
    .style("stroke","black")
    .style("stroke-width","1")

    // .attr("cx",)
}
function hideHoverImg() {
  d3.selectAll(".circleImg").transition().duration(200).style("opacity",0).remove()
}

function pad(num, size) { // add leading 0s to nocs like 0011
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
















var graphMode;

  function tooltipMouseover(d) {
  // create the hover tooltip

      div.append("div").attr("class", "tooltip").attr("id","tooltip0")
      .style("position","absolute").style("z-index","999")
      // .style("left", (d3.event.pageX) + 20 + "px")
      // .style("top", (d3.event.pageY - 80) - d.radius + "px")
      .style("opacity",1).style("width","360px")
       
      div.transition()
      .duration(0)
      .style("box-shadow", "4px 4px 17px #404040FF")
      .style("height", "auto")
      .style("position", "absolute")
      .style("z-index", 999)
      .style("pointer-events","none")

      var divLeft, divTop;
      
      if(graphMode == 0) {

        if(d3.event.pageX < window.innerWidth/2) { // left side
          divLeft = window.innerWidth*0.5 + (d.x) + 5;
          divTop = window.innerHeight*0.25 + ((window.innerHeight-300)*(d.y/window.innerHeight));
        } else if (d3.event.pageX >= window.innerWidth/2) { // right side
          divLeft = window.innerWidth*0.5 + (d.x) - 355;
          divTop = window.innerHeight*0.25 + ((window.innerHeight-300)*(d.y/window.innerHeight));
        }

      }else if(graphMode == 1) {

        if(d3.event.pageX < window.innerWidth/2) { // left side
          divLeft = window.innerWidth*0.5 + (d.cx) + 5;
          divTop = window.innerHeight*0.25 + ((window.innerHeight-300)*(d.cy/window.innerHeight));
        } else if (d3.event.pageX >= window.innerWidth/2) { // right side
          divLeft = window.innerWidth*0.5 + (d.cx) - 355;
          divTop = window.innerHeight*0.25 + ((window.innerHeight-300)*(d.cy/window.innerHeight));
        }
      
        // divTop = d.cy + window.innerHeight*0.4 - 150;      
        // divLeft = d.cx + window.innerWidth/2;
      }

      // pageY increases downward
      // at small pageY, approach d3.event.pageY
      // at large pageY, approach constant window.innerHeight-400

      // Display Hover Tooltip
      div.html("<div id='tooltip1' style='z-index: 999; font-weight: bold; font-size: 20px; padding-top: 7.5px; padding-left: 12.5px; padding-right: 2.5px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div id='tooltip2' style='color: " + colorTooltip(d.cluster) +"; padding-left: 10px; font-size: 15px; font-family: Raleway;'>"
        
                +"<svg height='55px' style='margin: 10 0;' class='chart' aria-labelledby='title desc' role='img'>"+
                  "<title id='title'>A bar chart showing information</title>"+
                  "<g class='bar'>"+
                    "<rect width='"+(350*d.wage/maxWage)+"' style='fill: #256D1B;' height='15'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Arial' x='"+(Math.round((350*d.wage/maxWage+5)*100)/100)+"' y='9.5' dy='.35em'>$ "+Math.round(d.wage*100)/100+" per hr</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.yearsStudy/5)+"' style='fill: #244F26' height='15' y='20'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Arial' x='"+(150*d.yearsStudy/5+5)+"' y='28' dy='.35em'>"+Math.round(d.yearsStudy*10)/10+" years of study</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.automationRisk)+"' height='15' style='fill: #550C18' y='40'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Arial' x='"+(150*d.automationRisk+5)+"' y='48' dy='.35em'>"+(Math.round(d.automationRisk*100))+"% risk of machine automation</text>"+
                  "</g>"+
                "</svg>"                                
                +"Top skills:</br>"
                +"<ul class='subtext' style='margin-top: 5px;'><li>" + d.topSkill1 + "</li><li>" + d.topSkill2 + "</li><li>" + d.topSkill3 + "</ul>"//TOP SKILLS
     +"<div id='tooltip3' style='border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; margin-left: -10px; height: 15px; background: "+ colorTooltip2(d.cluster) +";'>"
                     // Skill minibars
        +"<svg id='miniBars' height='10px' style='position: absolute; margin-top: "+5+"px; margin-left: 25px;' class='chart' aria-labelledby='title desc' role='img'>"+
          "<title id='title'>A bar chart showing information</title>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(-7-skillsBarsXtranslate)+"' dy='.35em'>Language</text>"+
          "<rect id='rect1' height='"+(d.skillsLang*compress_y)+"' width='18' style='fill: "+ colorSkillbar(d.cluster) +";' y='"+(skillsBarsYtranslate*0.25-(d.skillsLang*compress_y))+"' x='"+(5-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(15-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsLang)/10+"</text>"+
          "</g>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(30-skillsBarsXtranslate)+"' dy='.35em'>Logic</text>"+
          "<rect id='rect2' height='"+(d.skillsLogi*compress_y)+"' width='18' style='fill: "+ colorSkillbar(d.cluster) +";' y='"+(skillsBarsYtranslate*0.25-(d.skillsLogi*compress_y))+"' x='"+(40-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(50-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsLogi)/10+"</text>"+
          "</g>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(100-skillsBarsXtranslate)+"' dy='.35em'>Computer</text>"+
          "<rect id='rect4' height='"+(d.skillsComp*compress_y)+"' width='18' style='fill: "+ colorSkillbar(d.cluster) +";' y='"+(skillsBarsYtranslate*0.25-(d.skillsComp*compress_y))+"' x='"+(75-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(120-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsComp)/10+"</text>"+
          "</g>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(65-skillsBarsXtranslate)+"' dy='.35em'>Math</text>"+
          "<rect id='rect3' height='"+(d.skillsMath*compress_y)+"' width='18' style='fill: "+ colorSkillbar(d.cluster) +";' y='"+(skillsBarsYtranslate*0.25-(d.skillsMath*compress_y))+"' x='"+(110-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(85-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsMath)/10+"</text>"+
          "</g>"+
        "</svg>"
        // +"<span id='clickSpan' style='position: absolute; right: 45px; bottom: -3px; color: white; font-size: 14px;'>&#9660&nbspclick&nbsp&#9660</span>"
        +"</div>")
        // Move div above mouse by "top" + radius and right by "left"
        .style("left", divLeft + "px")
        .style("background", color(d.cluster) )
        .style("top", (divTop) + "px")
        .style("z-index",999);

      // div2.transition()
      // .duration(200)
      // .style("left", (d3.event.pageX) + 20 + "px")
      // .style("top", (d3.event.pageY - 80) - d.radius + "px")
      // .style("opacity", .9)

      // div2.html("test")
      createHoverImg(d);


  }

  function tooltipLarge(d) {

  div2 = div.append("div")
  .attr("id","tooltipBottomDiv").style("background",colorTooltip2(d.cluster))
  .style("height","0px").style("width","360px")
  .style("z-index",-1)
  .style("border-bottom-left-radius","6px")
  .style("border-bottom-right-radius","6px")
  .style("pointer-events","auto");

 
  d3.select("#miniBars").transition().duration(275)
  // .style("margin-top",250+"px")
  .style("opacity",0);
 
  var maxLength = 34
  //Some job titles from this group are...
  if(d.title1.length>maxLength){var title1 = d.title1.substring(0,maxLength) + "..."
  }else{var title1 = d.title1}
  if(d.title2.length>maxLength){var title2 = d.title2.substring(0,maxLength) + "..."
  }else{var title2 = d.title2}
  if(d.title3.length>maxLength){var title3 = d.title3.substring(0,maxLength) + "..."
  }else{var title3 = d.title3}

  setTimeout(function(){

    d3.select("#tooltipBottomDiv")
    .html("<div id='tooltipBottomDiv2' style=' z-index: -1; margin-top: -15px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 16px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
      +"; background: "+ colorTooltip2(d.cluster) +";'>"

        +"<span style='padding-left: 3px;'>Some job titles from this group are:</span></br>"
        +"<ul style='padding-top: 9px;'><li>"+title1+"</li><li>"+title2+"</li><li>"+title3+"</li></ul></div>"

      // Skill levels
        +"<svg height='80px' style='position: absolute; margin-top: "+(15)+"px; margin-left: 15px;' class='chart' aria-labelledby='title desc' role='img'>"+
        "<title id='title'>A bar chart showing information</title>"+

        "<g class='bar'>"+                                                                       // y = x if rotated 90deg
        "<rect id='rect5shadow' class='shadow' height='"+(d.skillsLang*stretch_y)+"' width='18' transform='translate(3,7)' style='box-shadow: 3px 3px 3px black; fill: #30352F;' y='"+(skillsBarsYtranslate-(d.skillsLang*stretch_y))+"' x='"+(5-skillsBarsXtranslate)+"'></rect>"+
        "<rect id='rect5' height='"+(d.skillsLang*stretch_y)+"' width='18' style='box-shadow: 3px 3px 3px black; fill: #256D1B;' y='"+(skillsBarsYtranslate-(d.skillsLang*stretch_y))+"' x='"+(5-skillsBarsXtranslate)+"'></rect>"+
        "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(-5-skillsBarsXtranslate)+"' dy='.35em'>"+
          "Language</text>"+
        // "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(17-skillsBarsXtranslate)+"'>"+
        //   Math.round(10*d.skillsLang)/10+"</text>"+
        "</g>"+
        "<g class='bar'>"+
        "<rect id='rect6shadow' class='shadow' height='"+(d.skillsLogi*stretch_y)+"' width='18' transform='translate(3,7)' style='box-shadow: 3px 3px 3px black; fill: #30352F;' y='"+(skillsBarsYtranslate-(d.skillsLogi*stretch_y))+"' x='"+(40-skillsBarsXtranslate)+"'></rect>"+
        "<rect id='rect6' height='"+(d.skillsLogi*stretch_y)+"' width='18' style='box-shadow: 3px 3px 3px black; fill: #256D1B;' y='"+(skillsBarsYtranslate-(d.skillsLogi*stretch_y))+"' x='"+(40-skillsBarsXtranslate)+"'></rect>"+
        "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(32-skillsBarsXtranslate)+"' dy='.35em'>"+
        "Logic</text>"+
        // "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(52-skillsBarsXtranslate)+"'>"+
        //   Math.round(10*d.skillsLogi)/10+"</text>"+
        "</g>"+
        "<g class='bar'>"+
        "<rect id='rect7shadow' class='shadow' height='"+(d.skillsComp*stretch_y)+"' width='18' transform='translate(3,7)' style='box-shadow: 3px 3px 3px black; fill: #30352F;' y='"+(skillsBarsYtranslate-(d.skillsComp*stretch_y))+"' x='"+(75-skillsBarsXtranslate)+"'></rect>"+
        "<rect id='rect7' height='"+(d.skillsComp*stretch_y)+"' width='18' style='box-shadow: 3px 3px 3px black; fill: #256D1B;' y='"+(skillsBarsYtranslate-(d.skillsComp*stretch_y))+"' x='"+(75-skillsBarsXtranslate)+"'></rect>"+
        "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(67-skillsBarsXtranslate)+"' dy='.35em'>Computer</text>"+
        // "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(87-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsComp)/10+"</text>"+
        "</g>"+
        "<g class='bar'>"+
        "<rect id='rect8shadow' class='shadow' height='"+(d.skillsMath*stretch_y)+"' width='18' transform='translate(3,7)' style='box-shadow: 3px 3px 3px black; fill: #30352F;' y='"+(skillsBarsYtranslate-(d.skillsMath*stretch_y))+"' x='"+(110-skillsBarsXtranslate)+"'></rect>"+
        "<rect id='rect8' height='"+(d.skillsMath*stretch_y)+"' width='18' style='box-shadow: 3px 3px 3px black; fill: #256D1B;' y='"+(skillsBarsYtranslate-(d.skillsMath*stretch_y))+"' x='"+(110-skillsBarsXtranslate)+"'></rect>"+
        "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(102-skillsBarsXtranslate)+"' dy='.35em'>Math</text>"+
        // "<text class='subtext' style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(122-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsMath)/10+"</text>"+
        "</g>"+
        "</svg>"+
        // +"<br/>" 
        "<span style='margin-left: 231px'></span>"+
        "<span style='margin-top: 10px; margin-left: 220px'></span>"+
        "<button id='viewMoreBtn' class='btn btn-lg'"+
        "style='position: absolute; right: 17px; bottom: 20px; z-index: 999; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; margin-top: 11px; font-family: Raleway; background: white; color: " + color(d.cluster) +"'>"+
        "View more</button>"+"</div>")

    d3.select("#viewMoreBtn").on("click", function() {
        d3.select("#viewMoreBtn").transition().duration(500).style("opacity",0).remove()

        // d3.select("#tooltipBottomDiv").style("border-radius", "6px")
        // .transition().duration(500).style("width","550px")
        // .style("box-shadow","7px 7px 17px #404040FF")
        
        div3 = d3.select("#tooltipBottomDiv").append("div").attr("id","moreBtnsContainerDiv")
          .style("height","250px")
          .style("box-shadow","6px 4px 12px #404040FF")
          .style("border-top-right-radius","6px")
          .style("border-bottom-right-radius","6px")
          .style("background", colorTooltip2(d.cluster))
          .style("position","absolute")
          .style("left","160px")
          .style("bottom","0px")
          .style("z-index","-1")
          .html("<div id='moreBtnsDiv' align='right' style='margin-top: 0px; margin-left: 15px; margin-right: 15px;'>"+

        "<a id='btnJobBank' class='btn btn-sm' href='"+"http://noc.esdc.gc.ca/English/NOC/QuickSearch.aspx?ver=&val65="+pad(d.noc,4)+"' target='_blank' "+
        "style='margin-top: 20px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) + "'>"+
        "Job details page</a><br>"+

        // "<a id='btnVolunteer' class='btn btn-sm' "+
        // "style='margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        // "' target='_blank' href='"+"https://youth.volunteer.ca/"+"'>"+
        // "Volunteer Canada</a><br>"+

        "<br><br><span style='margin-left: -20px; color: white;'>"+
        "This section is currently under construction...</span>"+

        "<div align='right' style='margin: 10px 0px 20px 0px'>"+
        "<a id='btnIndeed' class='btn btn-sm' "+
        "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        "'>"+
        "&nbspcoming soon&nbsp</a><br>"+

        // "<a id='btnIndeed' class='btn btn-sm' "+
        // "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        // "' target='_blank' href='"+"https://www.indeed.ca/jobs?q="+d.job+"'>"+
        // "&nbspIndeed.ca&nbsp</a><br>"+

        // "<a id='btnGlassdoor' class='btn btn-sm' "+
        // "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        // "' target='_blank' href='"+"https://www.glassdoor.ca/Job/"+d.job.split(' ').join('-')+"-jobs-SRCH_KO0,19.htm'>"+
        // "&nbspGlassdoor.ca&nbsp</a><br>"+

        // "<a id='btnMonster' class='btn btn-sm' "+
        // "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        // "' target='_blank' href='"+"https://www.monster.ca/jobs/search/?q="+d.job.split(' ').join('-')+"'>"+
        // "&nbspMonster.ca&nbsp</a><br>"+

        "</div></div>")
          
        div3.transition().duration(350).style("left","360px").style("height","360px")

        d3.select("#moreBtnsDiv").style("opacity",0).transition().duration(350).style("opacity",1).style("left","360px")
    })

   }, 275);

  // skill bars
  d3.select("#tooltipBottomDiv").append("svg")
  .attr("height","280px").style("position","absolute").style("margin-left","25px")
  .append("rect").attr("height",(d.skillsLang*compress_y)).attr("width","18")
  .style("fill",colorSkillbar(d.cluster))
  .attr("y",(skillsBarsYtranslate*0.25-(d.skillsLang*compress_y))).attr("x",(5-skillsBarsXtranslate))
  .transition().duration(275)
    .attr("height", (d.skillsLang*stretch_y))
    .attr("y",150)

  d3.select("#tooltipBottomDiv").append("svg")
  .attr("height","280px").style("position","absolute").style("margin-left","25px")
  .append("rect").attr("height",(d.skillsLogi*compress_y)).attr("width","18")
  .style("fill",colorSkillbar(d.cluster))
  .attr("y",(skillsBarsYtranslate*0.25-(d.skillsLogi*compress_y))).attr("x",(40-skillsBarsXtranslate))
  .transition().duration(275)
    .attr("height", (d.skillsLogi*stretch_y))
    .attr("y",150)  

  d3.select("#tooltipBottomDiv").append("svg")
  .attr("height","280px").style("position","absolute").style("margin-left","25px")
  .append("rect").attr("height",(d.skillsComp*compress_y)).attr("width","18")
  .style("fill",colorSkillbar(d.cluster))
  .attr("y",(skillsBarsYtranslate*0.25-(d.skillsComp*compress_y))).attr("x",(75-skillsBarsXtranslate))
  .transition().duration(275)
    .attr("height", (d.skillsComp*stretch_y))
    .attr("y",150)  

  d3.select("#tooltipBottomDiv").append("svg")
  .attr("height","280px").style("position","absolute").style("margin-left","25px")
  .append("rect").attr("height",(d.skillsMath*compress_y)).attr("width","18")
  .style("fill",colorSkillbar(d.cluster))
  .attr("y",(skillsBarsYtranslate*0.25-(d.skillsMath*compress_y))).attr("x",(110-skillsBarsXtranslate))
  .transition().duration(275)
    .attr("height", (d.skillsMath*stretch_y))
    .attr("y",150)

  // d3.select("#tooltipBottomDiv2").transition().duration(250).style("height", "2800px");
  // d3.select("#tooltipBottomDiv").transition().duration(250).style("height", "2802px");
  div2.transition().duration(250).style("height","250px");

        // Unfurl downward
        // .style("height", 200)
        // .transition()
        // .duration(200)
        // .style("height", "auto")
       // d3.select("#tooltipContent").transition().duration(250).style("height", "auto");



     };

function tooltipSmall(d) {
  d3.selectAll(".subtext").style("opacity",0)
  d3.select("#tooltipBottomDiv2").transition().duration(250).style("height","0px");
  d3.select("#tooltipBottomDiv").transition().duration(250).style("height","0px");
  d3.select("#tooltipContent").transition().duration(250).style("height", "100px");
      setTimeout(function() {
              div.html("<div style='z-index: 99; font-weight: bold; font-size: 20px; padding-top: 7.5px; padding-left: 12.5px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div id='tooltip2' style='color: " + colorTooltip(d.cluster) +"; padding-left: 10px; font-size: 15px; font-family: Raleway;'>"
        
                +"<svg height='55px' style='margin: 10 0;' class='chart' aria-labelledby='title desc' role='img'>"+
                  "<title id='title'>A bar chart showing information</title>"+
                  "<g class='bar'>"+
                    "<rect width='"+(350*d.wage/maxWage)+"'  style='fill: #256D1B;'height='15' ></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(Math.round((350*d.wage/maxWage+5)*100)/100)+"' y='9.5' dy='.35em'>$ "+Math.round(d.wage*100)/100+" per hr</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.yearsStudy/5)+"' style='fill: #244F26' height='15' y='20'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.yearsStudy/5+5)+"' y='28' dy='.35em'>"+Math.round(d.yearsStudy*10)/10+" years of study</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.automationRisk)+"' height='15' style='fill: #550C18' y='40'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.automationRisk+5)+"' y='48' dy='.35em'>"+(Math.round(d.automationRisk*100))+"% risk of machine automation</text>"+
                  "</g>"+
                "</svg>"             
                +"Top skills:</br>"
                +"<ul class='subtext' style='margin-top: 5px;'><li>" + d.topSkill1 + "</li><li>" + d.topSkill2 + "</li><li>" + d.topSkill3 + "</ul>"//TOP SKILLS
                     
     +"<div style='border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; height: 15px; background: "+ colorTooltip2(d.cluster) +";'>"
                     // Skill minibars
        +"<svg id='miniBars' height='10px' style='position: absolute; margin-top: "+5+"px; margin-left: 25px;' class='chart' aria-labelledby='title desc' role='img'>"+
          "<title id='title'>A bar chart showing information</title>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(-7-skillsBarsXtranslate)+"' dy='.35em'>Language</text>"+
          "<rect id='rect1' height='"+(d.skillsLang*compress_y)+"' width='18' style='fill: "+ colorSkillbar(d.cluster) +";' y='"+(skillsBarsYtranslate*0.25-(d.skillsLang*compress_y))+"' x='"+(5-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(15-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsLang)/10+"</text>"+
          "</g>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(30-skillsBarsXtranslate)+"' dy='.35em'>Logic</text>"+
          "<rect id='rect2' height='"+(d.skillsLogi*compress_y)+"' width='18' style='fill: "+ colorSkillbar(d.cluster) +";' y='"+(skillsBarsYtranslate*0.25-(d.skillsLogi*compress_y))+"' x='"+(40-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(50-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsLogi)/10+"</text>"+
          "</g>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(100-skillsBarsXtranslate)+"' dy='.35em'>Computer</text>"+
          "<rect id='rect3' height='"+(d.skillsComp*compress_y)+"' width='18' style='fill: #256D1B;' y='"+(skillsBarsYtranslate*0.25-(d.skillsComp*compress_y))+"' x='"+(75-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(120-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsComp)/10+"</text>"+
          "</g>"+
          "<g class='bar'>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(65-skillsBarsXtranslate)+"' dy='.35em'>Math</text>"+
          "<rect id='rect4' height='"+(d.skillsMath*compress_y)+"' width='18' style='fill: #256D1B;' y='"+(skillsBarsYtranslate*0.25-(d.skillsMath*compress_y))+"' x='"+(110-skillsBarsXtranslate)+"'></rect>"+
          // "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(85-skillsBarsXtranslate)+"'>"+Math.round(10*d.skillsMath)/10+"</text>"+
          "</g>"+
        "</svg>"
        // +"<span id='clickSpan' style='position: absolute; right: 45px; bottom: -3px; color: white; font-size: 14px;'>&#9660&nbspclick&nbsp&#9660</span>"
        +"</div>")
        // Move div above mouse by "top" + radius and right by "left"
        // .style("left", (d3.event.pageX) + 20 + "px")
        // .style("background", color(d.cluster) )
        // .style("top", (d3.event.pageY - 80) - d.radius + "px")

            }, 200);

  d3.select("#rect5")
  .transition().duration(200)
    .attr("height", (d.skillsLang*compress_y))
    .attr("y",-100)  

  d3.select("#rect6")
  .transition().duration(200)
    .attr("height", (d.skillsLogi*compress_y))
    .attr("y",-100)  

  d3.select("#rect7")
  .transition().duration(200)
    .attr("height", (d.skillsComp*compress_y))
    .attr("y",-100)  

  d3.select("#rect8")
  .transition().duration(200)
    .attr("height", (d.skillsMath*compress_y))
    .attr("y",-100)

  d3.select("#rect5shadow")
  .transition().duration(150)
    .attr("height", (d.skillsLang*compress_y))
    .attr("y",-100)  

  d3.select("#rect6shadow")
  .transition().duration(150)
    .attr("height", (d.skillsLogi*compress_y))
    .attr("y",-100)  

  d3.select("#rect7shadow")
  .transition().duration(150)
    .attr("height", (d.skillsComp*compress_y))
    .attr("y",-100)  

  d3.select("#rect8shadow")
  .transition().duration(150)
    .attr("height", (d.skillsMath*compress_y))
    .attr("y",-100)
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

  // if clicking on the chart, restart the simulation
  if (!d3.event.active && graphMode == 0) simulation.alphaTarget(0.001).restart();    

    d.fx = d.x; // drag
    d.fy = d.y;

  // if dragged to right side, becomes sticky
  // if (d.fx < window.innerWidth*0.8){
    // sticky[d.id] = 1
  // }

}

function dragged(d) {
  d3.select(this).classed("fixed", d.fixed = true);


  // if in sticky zone
  if(d.x > window.innerWidth*0.4) { 
    // stick!
    sticky[d.id] = 2 // right side
  } else if (d.x < window.innerWidth*-0.4){
    sticky[d.id] = 1 // left side
  }

  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active && graphMode == 0) simulation.alphaTarget(0.001);
  d.fx = null;
  d.fy = null;
} 

drag_handler = d3.drag()
.on("start", dragstarted)
.on("drag", dragged)
.on("end", dragended);

drag_handler(circles);



///////////////////////////////// Buttons ////////////////////////////////////

var legendButtonHeight = 60,
    legendButtonWidth = 85;

/////////////// COLOUR LEGEND button

industriesArray = [
'Natural resources and agriculture',
'Management',
'Art, culture, recreation and sport',
'Trades, transport and equipment ops',
'Business, finance and administration',
'Education, law, social, community, government',
'Natural and applied sciences',
'Manufacturing and utilities',
'Health',
'Sales and services',
]

d3.select("#btnColours").on("click", function() {
  expandColoursLegend()
})

d3.select("#btnColours").on("mouseover", function() {
  d3.select("#btnColours").style("background","#eaeaea")
})
d3.select("#btnColours").on("mouseout", function() {
  d3.select("#btnColours").style("background","white")
})

function expandColoursLegend() {

  if (graphMode == 0){
    simulation
    .force("x", forceXSeparate).alpha(0.4)
    .force("y", forceYSeparate).alpha(0.4)
      .alphaTarget(0.001) // after click, cool down to minimal temperature
      .restart()
  };

  legendMode = 1;
  d3.select("#btnColours").on("click", "")

  // shrink Size Legend button 
  d3.select("#btnSizes").transition().duration(250).style("opacity",0).style("height","0px").style("width","0px").style("border-width","2px")

  // expand colour legend
  d3.select("#btnColours")
    .append("div")
  .attr("id","legendDiv1")
    .style("position","absolute")
    .style("width","0px")
    .style("height","0px")
    // .style("bottom","0px")
  .transition().duration(375)
    .style("background","white")
    .style("width", "335px")
    .style("height", "310px").style("border","2px solid #49AC52").style("border-radius","6px")
    .style("bottom","0px")
    .style("left","0px")
  // .text("")


  svgLegend = d3.select("#legendDiv1")
      .html("")
      .append("svg").attr("id","svgLegend")
        .attr("width","335px")
        .attr("height","300px")
        .style("margin-top","5px")
        .style("background","white")
    
  legendCircles = d3.select("#svgLegend").selectAll("circle").data(industriesArray).enter().append("circle")
      .attr("r", 0) // start at 0 radius and transition in
      .attr("class","legendCirc")
      .transition().duration(450).attr("r", 10)
      .attr("id",function(d,i) { return "legendCircle_"+i } )
      .attr("transform", function(d,i) { return "translate("+"14"+","+(45+i*27)+")" } ) //flag! need to make equation for width/height ratio
      .style("fill", function(d,i) { return color(i); })
      .attr("opacity",  function(d,i) {
        if( filteredIndustries.includes(+i) ) { 
          return 0.1 }
        else{ 
          return 1 }
      })
      // append rect with on click
      
  legendFilterCircles = d3.select("#svgLegend").selectAll("rect").data(industriesArray).enter().append("rect")
        .attr("id",function(d,i){ return i+"filterColoursRect_" })
        .attr("class","legendBtn")
        // .style("fill","black")
        .attr("onclick",function(d,i) { return "filterIndustry("+(this.id.substring(0,1))+")" }) // quote?
        .attr("width","20px")
        .attr("height","20px")
        .attr("transform", function(d,i) { return "translate("+"4"+","+(35+i*27)+")" } ) //flag! need to make equation for width/height ratio



  legendTexts = svgLegend.selectAll("text").data(industriesArray).enter().append("text")
      .attr("text-anchor","left")
      .attr("transform", function(d,i) { return "translate("+"38"+","+(50+i*27)+")" } ) //flag! need to make equation for width/height ratio
      .text(function(d) { return d })
      .style("opacity",0).transition().duration(600).style("opacity",1)
  
  legendTitle = d3.select("#svgLegend").append("text")
    .attr("transform","translate(36,17)")
    .text("Industries")
    .style("font-size","22px").style("fill","#49AC52")

  //     .attr("r","20px").style("fill", function(d,i) { return color(i) })
  //     .attr("cx", "80vw")
  //     .attr("cy", function(d,i) { return i*20 + "px" })
  // .transition().duration(500)
  // .style("width", "300px")
  // .style("height", "400px")

  // btnSplitCombine = d3s bookmark todo: split button on click of colour legend

  if (graphMode == 0){
    d3.select("#legendDiv1").style("opacity",0.9)
    // d3.selectAll(".legendCirc").style("opacity",1)
  }

} // end expandColoursLegend()

// d3.select("#btnColours").on("mouseleave", function() {
function closeLegends() {
    
    if (graphMode == 0) {
    smashTogether(0.3, 0.4);
    }

  legendMode = 0;
  // reset Size Legend button
  d3.select("#btnSizes").transition().duration(300).style("opacity",1)
    .style("height",legendButtonHeight+"px")
    .style("width",legendButtonWidth+"px").style("border-width","3px")
    
    setTimeout(function() {
      d3.select("#btnSizes")
      .html("Size<br>Legend")
      }, 300);

  // reset Colour Legend button
  d3.select("#btnColours").transition().duration(300).style("opacity",1)
  .style("width", legendButtonWidth+"px")
  .style("height", legendButtonHeight+"px").style("border-width","3px")

    setTimeout(function() {
      d3.select("#btnColours")
      .html("Colour<br>Legend")
      }, 300);

  d3.select("#btnColours").on("click", function() {
    expandColoursLegend()
  })

  d3.select("#btnSizes").on("click", function() {
    expandSizesLegend()  
  })

  d3.select("#svgLegend").selectAll("circle").transition().duration(400).attr("r", 0)

  d3.select("#legendDiv1").transition().duration(300).style("opacity",0).remove()
  d3.select("#svgLegend").selectAll("text").transition().duration(300).style("opacity",0).remove()
  d3.select("#sizeDropdownButton").transition().duration(300).style("opacity",0).remove()
  // legendTexts.selectAll("text").style("opacity",0).remove()

}




////////////////// SIZE LEGEND button

// size scales
var wageRadiusScale = d3.scaleSqrt() // Sqrt scale because radius
.domain([d3.min(nodes, function(d) { return d.wage }), d3.max(nodes, function(d) { return d.wage })]) // input
.range([1,maxRadius/1.2]); // output -- need to think about relative scales for each set of sizes

var automationRadiusScale = d3.scaleSqrt()
.domain([0.01, d3.max(nodes, function(d) { return d.automationRisk })])
.range([1,maxRadius/3]);

var yearRadiusScale = d3.scaleSqrt()
.domain([d3.min(nodes, function(d) { return d.yearsStudy }), d3.max(nodes, function(d) { return d.yearsStudy })])
.range([0.01,maxRadius/2]);
var sizesArray = []
var sizesValuesArray = []

setSizes("none")

function setSizes(mode){

  // radii of size legend circles
  sizesArray = []
  sizesValuesArray = []

  switch (mode) {
    case "workers":
    // add minima
    sizesArray.push(radiusScale(d3.min(nodes, function(d) { return d.workers })))
    sizesValuesArray.push(d3.min(nodes, function(d) { return d.workers }))
    // split scales into 4 intervals after minimum
    for (var i = 1; i < 5; i++) {
      sizesArray.push(
        (i/5) * radiusScale(d3.max(nodes, function(d) { return d.workers }))
        )
      sizesValuesArray.push(
        (i/5) * d3.max(nodes, function(d) { return d.workers })
        )
    }
    break;
    case "wage":
    // add minima
    sizesArray.push(wageRadiusScale(d3.min(nodes, function(d) { return d.wage })))
    sizesValuesArray.push("$ "+String(d3.min(nodes, function(d) { return d.wage })).substring(0,2)+" per hr")
    // split scales into 4 intervals after minimum
    for (var i = 1; i < 5; i++) {
      sizesArray.push(
        (i/5) * wageRadiusScale(d3.max(nodes, function(d) { return d.wage }))
        )
      sizesValuesArray.push("$ "+String(
        (i/5) * d3.max(nodes, function(d) { return d.wage })
        ).substring(0,2)+" per hr")
    }
    break;
    case "yearsStudy":
    // add minima
    sizesArray.push(yearRadiusScale(d3.min(nodes, function(d) { return d.yearsStudy })))
    sizesValuesArray.push(d3.min(nodes, function(d) { return d.yearsStudy }))
    // split scales into 4 intervals after minimum
    for (var i = 1; i < 5; i++) {
      sizesArray.push(
        (i/5) * yearRadiusScale(d3.max(nodes, function(d) { return d.yearsStudy }))
        )
      sizesValuesArray.push(
        (i/5) * d3.max(nodes, function(d) { return d.yearsStudy })
        )
    }
    break;
    case "none":
      sizesArray.push(10)
    break;
  }

}

var currentSize = "nothing"
var btnSizesDims = ["190px","320px"] // width, height


d3.select("#btnSizes").on("click", function() {
      expandSizesLegend()  
})
d3.select("#btnSizes").on("mouseover", function() {
  d3.select("#btnSizes").style("background","#eaeaea")
})
d3.select("#btnSizes").on("mouseout", function() {
  d3.select("#btnSizes").style("background","white")
})

function expandSizesLegend() {

  d3.select("#sizeDropdownDiv").remove()

  if(typeof sizesDiv != "undefined") {
    sizesDiv.remove()
  }

  d3.select("#btnSizes").on("click", "")

   // shrink Colour Legend button and Sizes dropdown
    d3.select("#btnColours").transition().duration(300).style("opacity",0).style("height","0px").style("width","0px")
    // d3.select("#btnSizes").transition().duration(300)

    sizesDiv = d3.select("#btnSizes")
    .append("div").attr("id","legendDiv2").style("border","2px solid #49AC52").style("border-radius", "6px")
    .style("width","0px")
    .style("height","0px")
    .style("background","white")
    .style("position", "absolute")
    .style("left","37px")

    d3.select("#legendDiv2").transition().duration(350)
    .style("width", btnSizesDims[0])
    .style("height", btnSizesDims[1])
    .style("bottom", "0px")
    // .text("")

    svgLegend = d3.select("#legendDiv2")
      .html("")
      .append("svg").attr("id","svgLegend")
        .attr("width",btnSizesDims[0])
        .attr("height",btnSizesDims[1])
        .style("margin-top","5px")
        // .style("background","#eaeaea")
      
    sizeCircles = svgLegend.selectAll("circle").data(sizesArray).enter().append("circle")
        .attr("r", 0) // start at 0 radius and transition in
        .transition().duration(400).attr("r",  function(d,i) { return sizesArray[i] })
        .attr("transform", function(d,i) { return "translate("+"35"+","+(45 + i*0 + Math.pow(sizesArray[i], 1.6))+")" } ) 
        .style("fill", "#B5ADAD")

    legendTexts = d3.select("#svgLegend").selectAll("text").data(sizesValuesArray).enter().append("text")
        .attr("text-anchor","left")
        .attr("transform", function(d,i) { return "translate("+"95"+","+(49 + i*0 + Math.pow(sizesArray[i], 1.6))+")" } ) 
        .text(function(d,i) { if(i==0){ return "Less" }else if(i==4){ return "More" } })
        .style("opacity",0).transition().duration(600).style("opacity",1)
    
    legendTitle = d3.select("#svgLegend").append("text")
      .attr("transform","translate(11,23)")

      .text(currentSize) // must change this when size dropdown activated
      .style("font-size","22px").style("fill","#49AC52")

    if(currentSize=="nothing"){
      legendTitle.text("")
    }

    sizesDropdown = d3.select("#btnSizes").append("div").attr("id","sizeDropdownDiv")
        .attr("class","dropup")
        // .style("position","relative")
        // .style("right","50%") 
        // .style("bottom","15%")
        .append("button")
          .attr("id","sizeDropdownButton")
          .attr("class","btn-grey dropdown-toggle")
          .attr("type","button")
          .attr("data-toggle","dropdown")
          .style("position","absolute")
          .style("right","-100px")
          .style("bottom","5px")
          .style("height","50px")
          .style("border","3px solid #49AC52")
          .style("border-radius","6px")
          .style("font-weight","bold")
          .style("color","#49AC52")
          .style("background", "white")
          .html("Size by<br>"+currentSize+"<span class='caret'></span>")
          .append("ul").attr("class","dropdown-menu").style("padding-left", "5px")

    switch(currentSize) {
      
      case "Number of Jobs":
        sizesDropdown.html("<li><strong>Number of Jobs</strong></li>" +
                    "<li><a id='wageLink' href='#'>Wage ($ per hr)</a></li>" +
                    "<li><a id='yearLink' href='#'>Years of study</a></li>" +
                    "<li><a id='equaLink' href='#'>Equal sizes</a></li>")
      break;

      case "Wage ($ per hr)":
        sizesDropdown.html("<li><a id='workLink' href='#'>Number of Jobs</a></li>" +
                          "<li><strong>Wage ($ per hr)</strong></li>" +
                          "<li><a id='yearLink' href='#'>Years of study</a></li>" +
                          "<li><a id='equaLink' href='#'>Equal sizes</a></li>")
      break;
      
      case "Years of Study":
        sizesDropdown.html("<li><a id='workLink' href='#'>Number of Jobs</a></li>" +
                          "<li><a id='wageLink' href='#'>Wage ($ per hr)</a></li>" +
                          "<li><strong>Years of study</strong></li>" +
                          "<li><a id='equaLink' href='#'>Equal sizes</a></li>")
      break;
      
      case "nothing":
        sizesDropdown.html("<li><a id='workLink' href='#'>Number of Jobs</a></li>" +
                          "<li><a id='wageLink' href='#'>Wage ($ per hr)</a></li>" +
                          "<li><a id='yearLink' href='#'>Years of study</a></li>" +
                          "<li><strong>Equal sizes</strong></li>")
      break;
        
    }


    d3.select("#workLink").on("click", function() {

      circles.transition().duration(100)
        .delay(function(d, i) { return i * 1})
        .attrTween("r", function(d) {
          var i = d3.interpolate(d.radius, radiusScale(d.workers));
          return function(t) { return d.radius = i(t); };
        });

      if(graphMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);

        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      }

      currentSize = "Number of Jobs"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      // mouseEnterOff() // turn off until mouseleave
      setSizes("workers")
      expandSizesLegend()
      // removeLegends()
    })

    d3.select("#wageLink").on("click", function() {

      circles.transition().duration(100)
      .delay(function(d, i) { return i * 1})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, wageRadiusScale(d.wage)/1.2);
        return function(t) { return d.radius = i(t); };
      });

      if(graphMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);
        
        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      }

      currentSize = "Wage ($ per hr)"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      // mouseEnterOff()
      setSizes("wage")
      expandSizesLegend()
      // removeLegends()
    })

    d3.select("#yearLink").on("click", function() {

      circles.transition().duration(100)
      .delay(function(d, i) { return i * 1})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, yearRadiusScale(d.yearsStudy));
        return function(t) { return d.radius = i(t); };
      });
      if(graphMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);

        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      }

      currentSize = "Years of Study"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      // mouseEnterOff()
      setSizes("yearsStudy")
      expandSizesLegend()
      // removeLegends()
    })

    d3.select("#equaLink").on("click", function() {
    
      circles.transition().duration(100)
      .delay(function(d, i) { return i * 1})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, equalRadius);
        return function(t) { return d.radius = i(t); };
      });
      if(graphMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);

        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      }

      currentSize = "nothing"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      // mouseEnterOff()
      setSizes("none")
      expandSizesLegend()
      // removeLegends()
    })

    // fade in dropdown
    d3.select("#sizeDropdownDiv").style("opacity",0).transition().duration(700).style("opacity",1)

  if (graphMode == 0){
    d3.select("#legendDiv2").style("opacity",0.9)
    // d3.selectAll(".legendCirc").style("opacity",1)
  }

} // end expandSizesLegend()



function removeLegends() {
    // reset Colour Legend button and Sizes dropdown

    d3.select("#legendDiv1").transition().duration(400).style("opacity",0).remove()
    clickedColours = 0;

    d3.select("#sizeDropdownDiv").style("opacity",1).transition().duration(200).style("opacity",0).remove()
    clickedSizes = 0;

    d3.select("#btnSizes").transition().duration(500)
    .style("width", "100px")
    .style("height", "70px").style("border-width","3px")

    svgLegend.selectAll("circle").transition().duration(400).attr("r", 0)

    d3.select("#svgLegend").selectAll("text").transition().duration(300).style("opacity",0).remove()
    // legendTexts.selectAll("text").style("opacity",0).remove()

    setTimeout(function() {
      d3.select("#btnSizes")
      .html("Size<br>Legend")
      }, 400);
    mouseEnterOn()
}




//////////// Industry Split ////////////////

// d3.select("#industry").on('click', function() {
//   if (graphMode == 1) return;
//   simulation
//   .force("x", forceXSeparate).alpha(0.4)
//   .force("y", forceYSeparate).alpha(0.4)
//     .alphaTarget(0.001) // after click, cool down to minimal temperature
//     .restart()

//   // d3.select("#split").style("display","none");
//   // d3.select("#shuffle").style("display","none");

//   // d3.select("#combine").style("display", "inline");

//   // legend.transition().duration(500).style("opacity", 0).remove();
//   })

d3.select("#shuffle").on('click', function() {
  // legend.transition().duration(500).style("opacity", 0).remove();
  // createBottomLegend();
  if (graphMode == 1) {
    graphMode = 0;
    graphModeOff();
  };
  simulation
  .force("x", forceXSeparateRandom)
  .force("y", forceYSeparateRandom)
  .alpha(0.15).alphaTarget(0.001).restart();


})

function smashTogether(force, temp) {
  simulation
  .force("x", d3.forceX().strength(force)).alpha(temp)
  .force("y", d3.forceY().strength(force)).alpha(temp)
  .alphaTarget(0.001)
  .restart()
}

d3.select("#combine").on('click', function(d) {

  if (graphMode == 0) {
    smashTogether(0.3, 0.4);
  }
})

// TODO: maxWorkers, maxWage, skillsMath not working
var minWorkers = d3.min(nodes, function(d) {return d.workers}),
minWage = d3.min(nodes, function(d) {return d.wage});

maxWage = 116.18; //busted

maxYearsStudy = d3.max(nodes, function(d) {return d.yearsStudy}); // 5







////////////////// Pause the simulation ////////////////////////
d3.select("#pause").on('click', function(d) {
  simulation.stop();

  d3.select("#pause").style("display", "none");
  d3.select("#unpause").style("display", "inline");

});
////////////////// unpause the simulation ////////////////////////
d3.select("#unpause").on('click', function(d) {
  simulation.alpha(0.7).alphaTarget(0.001).restart();

  d3.select("#pause").style("display", "inline");
  d3.select("#unpause").style("display", "none");

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

// mouseover explainer divs

// d3.select("#graph").on('mouseenter', function(d) {

//   // append a large div, transition its height and width
//   d3.select("#graph").select(function(){return this.parentNode})
//   .append("div").style("width","10px").style("height","0px")
//     .attr("id","graphExplainer").style("opacity",0)
//     .style("position","absolute").style("top","40px").style("left","0px")
 
//   //move button down and keep other button up
//   d3.select("#futureView").transition().duration(250).style("margin-bottom","20px")
//   d3.select("#graph").transition().duration(250).style("padding-bottom","40px").style("margin-bottom","0px")
  
//   // explainer transition
//   d3.select("#graphExplainer").transition().duration(250)
//     .style("width","30vw")
//     .style("height","auto")
//     .style("background","#A6B0A8")
//     .style("opacity",1)
//     .style("border-bottom-left-radius","6px")
//     .style("border-bottom-right-radius","6px")

//   d3.select("#graphExplainer").append("div").attr("id","graphExplanation").style("color","white").style("padding","25px 18px")
//     .html("Not all jobs are equal! This view shows how jobs differ in terms of <em>wage, years of study,</em> and <em> number of jobs.</em>")

// })

// d3.select("#graph").on('mouseleave', function(d) {

//     d3.select("#futureExplanation").transition().duration(200).style("opacity",0).remove();
//     //move button up and keep other button down
//     d3.select("#futureView").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
//     // fade out
//     d3.select("#futureExplainer").transition().duration(200).style("opacity",0).remove();
//     d3.select("#futureExplanation").transition().duration(200).style("opacity",0).remove();
//   //move button up and keep other button down
//   // d3.select("#futureView").transition().duration(250).style("margin-bottom","0px")
//   d3.select("#graph").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
  
//   // fade out
//   // d3.select("#graph").transition().duration(250).style("height","32px")
//   d3.select("#graphExplainer").transition().duration(200).style("opacity",0).remove();
//   d3.select("#graphExplanation").transition().duration(200).style("opacity",0).remove();

// })


// d3.select("#futureView").on('mouseenter', function(d) {
//   //move button up and keep other button down
//   // d3.select("#futureView").transition().duration(250).style("margin-bottom","0px")
//   d3.select("#graph").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
  
//   // fade out
//   // d3.select("#graph").transition().duration(250).style("height","32px")
//   d3.select("#graphExplainer").transition().duration(200).style("opacity",0).remove();
//   d3.select("#graphExplanation").transition().duration(200).style("opacity",0).remove();

//   // append and transition the explainer div
//   d3.select("#futureView").select(function(){return this.parentNode})
//   .append("div").style("width","10px").style("height","0px")
//     .attr("id","futureExplainer").style("opacity",0)
//     .style("position","absolute").style("top","40px").style("right","0px")

//   //move button down and keep other button up
//   d3.select("#graph").transition().duration(250).style("margin-bottom","20px")
//   d3.select("#futureView").transition().duration(250).style("padding-bottom","40px").style("margin-bottom","0px")
  
//   // explainer transition
//   d3.select("#futureExplainer").transition().duration(250)
//     .style("width","30vw")
//     .style("height","auto")
//     .style("background","#A6B0A8")
//     .style("opacity",1)
//     .style("border-bottom-left-radius","6px")
//     .style("border-bottom-right-radius","6px")

//   d3.select("#futureExplainer").append("div").attr("id","futureExplanation").style("color","white").style("padding","25px 18px")
//     .html("Machines are getting better at performing new tasks every day. <em>Automation Risk</em> tells us how likely a job will soon become unavailable.")

// })

// d3.select("#futureView").on('mouseleave', function(d) {

//     //move button up and keep other button down
//     d3.select("#futureView").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
//     // fade out
//     d3.select("#futureExplainer").transition().duration(200).style("opacity",0).remove();

// })

function createGraphExplainerDiv() {
  // width of the div
  var explainerWidth = 700;
    // append a large div, transition its height and width
  graphExplainerDiv = d3.select("body").append("div")
    .style("width",explainerWidth+"px").style("height","400px")
    .attr("id","graphExplainer").style("opacity",0)
    .style("position","fixed").style("top","300px").style("left",(window.innerWidth*0.5-(explainerWidth/2))+"px")
    .style("color", "#49AC52")
    .style("font-size", "20px")
    .style("border", "3px solid #49AC52")
    .style("border-radius", "13px")
    .style("padding", "20px")
    .style("box-shadow","0px 0px 150px #404040FF")
    .html(
      "<p>Graph View lets you compare job groups by their length of education, automation risk, and potential income.</p>"+
      // bookmarklet : todo - buttons onclick dismiss explainer
      "<div id='explainLeft' style='float: left; display: inline;'>"+
                "<li class='list-graphModes' style='width: 220px; font-size: 16px; margin-bottom: 11px;'>"+
                  "<button id='b1' class='suggested-views-btn' href='#'>"+
                    "How much study for how much pay?"+
                  "</button>"+
                "</li>"+
                "<li class='list-graphModes' style='width: 220px; font-size: 16px;'>"+
                  "<button id='b2' class='suggested-views-btn'  href='#'>"+
                    "How many jobs exist?"+
                  "</button>"+
                "</li>"+
                "<li class='list-graphModes' style='width: 220px; font-size: 16px; margin-top: 14px; margin-bottom: 51px;'>"+
                  "<button id='b0' class='suggested-views-btn' style='background: white' href='#'>"+
                    "What's the risk my job will be automated?"+
                  "</button>"+
                "</li>"+
      "</div>"+

      "<div id='explainRight' style='display: inline;'>"+
              "<p style='margin-top: 1em'>1. This view compares average <strong>income</strong> and <strong>years of study</strong>.</p>"+
              
              "<p style='margin-top: 1.5em; margin-bottom: 1.5em;'>2. This view compares the <strong>number of available positions</strong> and the average <strong>income</strong></p>"+

              "<p style='display: inline; margin-top: 1.5em;'>3. Machines are getting better at performing new tasks every day -- "+
              "this view compares the <strong>number of available positions</strong> with the <strong>risk that job tasks will be machine-automated</strong><sup>1</sup>.</p>" +
              
      "</div>"+

      // "<p style=' font-size: 12px'><sup>1</sup><a href='http://brookfieldinstitute.ca/research-analysis/automation-across-the-nation-understanding-distribution-automation-susceptibility-across-canada/' target='_blank'>"+
      // "The Brookfield Institute</a> has provided automation risk predictions.</p>"+ // 'make into a citation?''
      "")
 
//   //move button down and keep other button up
//   d3.select("#futureView").transition().duration(250).style("margin-bottom","20px")
//   d3.select("#graph").transition().duration(250).style("padding-bottom","40px").style("margin-bottom","0px")
  
  // explainer transition
  d3.select("#graphExplainer").transition().duration(500)
    .style("background","white")
    .style("opacity",1)

//   d3.select("#graphExplainer").append("div").attr("id","graphExplanation").style("color","white").style("padding","25px 18px")
//     .html("Not all jobs are equal! This view shows how jobs differ in terms of <em>wage, years of study,</em> and <em> number of jobs.</em>")
/////////////////////////////// Suggested Views buttons /////////////////////////

d3.select("#b0").on('mouseover', function() {d3.select(this).style("background", "#eaeaea")})
d3.select("#b0").on("mouseout", function() {d3.select(this).style("background", "white")})

d3.select("#b0").on('click', function() { // Automation vs Number of Jobs
  currentMode = 3;
  graphModeOn(3);

  graphExplainerDiv.transition().duration(500).style("opacity",0).remove()

  d3.select("#b0").style("background", "#49AC52").style("color","white").on("mouseover","").on("mouseout", "")
  // d3.select("#b0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#b0").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#b1").style("background", "white").style("color","#49AC52")
  d3.select("#b1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#b1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#b2").style("background", "white").style("color","#49AC52")
  d3.select("#b2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#b2").on("mouseout", function() {d3.select(this).style("background", "white")})
  // createLegend(0);

  d3.select("#a0").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#a1").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})

});

d3.select("#b1").on('click', function() { // Wage vs Years
  currentMode = 1;
  // graphModeOn(1);

  graphExplainerDiv.transition().duration(500).style("opacity",0).remove()

  d3.select("#b0").style("background", "white").style("color","#49AC52")
  d3.select("#b0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#b0").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#b1").style("background", "#49AC52").style("color","white").on("mouseover","").on("mouseout", "")
  // d3.select("#b1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#b1").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#b2").style("background", "white").style("color","#49AC52")
  d3.select("#b2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#b2").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a0").style("background", "white").style("color","#49AC52")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a1").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "white").style("color","#49AC52")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})

});

d3.select("#b2").on('click', function() { // Wage vs Workers
  currentMode = 2;
  graphModeOn(2);

  graphExplainerDiv.transition().duration(500).style("opacity",0).remove()

  d3.select("#b0").style("background", "white").style("color","#49AC52")
  d3.select("#b0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#b0").on("mouseout", function() {d3.select(this).style("background", "white")})
  
  d3.select("#b1").style("background", "white").style("color","#49AC52")
  d3.select("#b1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#b1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#b2").style("background", "#49AC52").style("color","white").on("mouseover","").on("mouseout", "")
  // d3.select("#b2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#b2").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#a0").style("background", "white").style("color","#49AC52")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a1").style("background", "white").style("color","#49AC52")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})

});


}

d3.select("#graph").on('click', function(d){
  // first time?
  if(graphFirstTime == true){
    graphFirstTime = false;
    createGraphExplainerDiv()
  }
  // Toggle mode on or off
  graphMode = 1-graphMode;
  //cool to 0 degrees
  simulation.alpha(0);

  ////////////// GRAPH MODE ON! ////////////////
  if (graphMode == 1) {
      currentMode = 0;
      graphModeOn(0);
    }
  
  //////////////// Graph mode OFF. ///////////////////
  if (graphMode == 0) {
    if(typeof graphExplainerDiv != "undefined"){
      d3.select("#graphExplainer").transition().duration(500).style("opacity",0).remove()
    }
    graphModeOff();
  }; // transition back to clusters
  
})

function moveBottomDown() {
  // Move top up
  d3.select("#topButtons").transition().duration(500).style("top", "10vh");
  d3.select("#sliderDiv_skillsLang").transition().duration(500).style("top", "7vh");
  d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("top", "7vh");
  
  d3.select("#bottomButtons").transition().duration(500).style("bottom", "10vh");
  d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "3vh");
  d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "3vh");
}
function moveBottomUp() {
  // Move top up
  d3.select("#topButtons").transition().duration(500).style("top", "12vh");
  d3.select("#sliderDiv_skillsLang").transition().duration(500).style("top", "9vh");
  d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("top", "9vh");

  d3.select("#bottomButtons").transition().duration(500).style("bottom", "15vh");
  d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "9vh");
  d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "9vh");
}

/////////////////////////////// Suggested Views buttons /////////////////////////

d3.select("#a0").on('click', function() { // Automation vs Number of Jobs
  currentMode = 3;
  graphModeOn(3);

  d3.select("#a0").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#a1").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})
  // createLegend(0);
});

d3.select("#a1").on('click', function() { // Wage vs Years
  currentMode = 1;
  graphModeOn(1);

  d3.select("#a0").style("background", "white").style("color","#49AC52")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a1").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "white").style("color","#49AC52")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})
});

d3.select("#a2").on('click', function() { // Wage vs Workers
  currentMode = 2;
  graphModeOn(2);

  d3.select("#a0").style("background", "white").style("color","#49AC52")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a1").style("background", "white").style("color","#49AC52")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})
});


function graphModeOn(mode) {
  // move legend group right
  d3.select(".legend").style("margin-left","30px")
  // clear annotations
  d3.selectAll(".annotation-group").transition().duration(500).style("opacity",0).remove()
  // wait for transform before applying transformed annotations
  setTimeout(function() {
    createAnnotations(mode);}
    , 1000)
  
  hideGraphViewCallout();
  hideAll();
  // hideGraphViewCallout();
  moveBottomDown();
  hideToolTip(500);
  d3.select("#btnColours").transition().duration(500).style("margin-left","100px")
  d3.select("#btnSizes").transition().duration(500).style("margin-left","100px")
  d3.select("#splitShuffle").transition().duration(500).style("opacity", 0);

  // if there is already a legend, remove the legend
  if (typeof axisG != "undefined") axisG.transition().duration(500).style("opacity", 0).remove();
  if (typeof legend != "undefined") legend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureLegend != "undefined") futureLegend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureAxisG != "undefined") futureAxisG.transition().duration(500).style("opacity", 0).remove();


  d3.select("#graphToggle").attr("src","img/toggle-on.png")
  
  d3.select("#suggestedViewsDiv").style("display", "inline");
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

        case 0:
          // transition circles to graph positions
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) {
              var i = d3.interpolate(d.x, 
                // x = Years of Study
                d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4);
              return function(t) { return d.cx = i(t); };
            })
            .attrTween("cy", function(d) {
              var i = d3.interpolate(d.y, 
                // y = Wage
                ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

          // svgAutoAxis = svg.append("g")
          //   .call(d3.svg.axis()
          //               .scale(xScale)
          //               .orient("bottom"))
          //     .style("stroke", "#FF7F0E")
          //     .style("stroke-width", "2.5px")
          //     // .attr("x1", window.innerWidth*0.2)
          //     // .attr("x2", window.innerWidth*0.75)
          //     // .attr("y1", height*0.7 + 200 )  
          //     // .attr("y2", 0 );

          // // svgAutoAxis = svg.append("line")
          // //     .style("stroke", "#FF7F0E")
          // //     .style("stroke-width", "2.5px")
          // //     .attr("x1", window.innerWidth*0.2)
          // //     .attr("x2", window.innerWidth*0.75)
          // //     .attr("y1", height*0.7 + 200 )  
          // //     .attr("y2", 0 );

          // //add text to fixed line
          // svgAutoAxis.append("text")
          //     .attr("x", window.innerWidth*0.55)
          //     .attr("y", 0.5)
          //     .attr("text-anchor", "middle")
          //     .text("50% risk");


        case 1:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) {
              var i = d3.interpolate(d.cx, 
                // x = Years of Study
                d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4);
              return function(t) { return d.cx = i(t); };
            })
            .attrTween("cy", function(d) {
              var i = d3.interpolate(d.cy, 
                // y = Wage
                ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

        case 2:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) {
              var i = d3.interpolate(d.cx, 
                // x = Number of Jobs
                d.workers/maxWorkers*width*0.73 - width*0.4);
              return function(t) { return d.cx = i(t); };
            })
            .attrTween("cy", function(d) {
              var i = d3.interpolate(d.cy, 
                // y = Wage
                ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

        case 3:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) { // transition x position to...
              var i = d3.interpolate(d.cx, 
                // x = Number of Jobs
                d.workers/maxWorkers*width*0.73 - width*0.4);
              return function(t) { return d.cx = i(t); };
            })
            .attrTween("cy", function(d) {
              var i = d3.interpolate(d.cy, 
                // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
                (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

        case 4:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) { // transition x position to...
              var i = d3.interpolate(futurePositions[d.id][0], 
                // x = Number of Jobs
                d.workers/maxWorkers*width*0.73 - width*0.4);
              return function(t) { return d.cx = i(t); };
            })
            .attrTween("cy", function(d) {
              var i = d3.interpolate(futurePositions[d.id][1], 
                // y = Automation Risk
                (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

        case 5:

            break;
        case 6:

    }

  //////////////////////// Axes ////////////////////////////
compressY = 0.65;
  // Set the ranges
  var x = d3.scaleLinear().range([0, width*0.75]);
  var y = d3.scaleLinear().range([height*compressY, 0]);

   switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 1:
               // Scale the range of the data (using globally-stored nodes)
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Years of Study
      // y = Wage
        case 0:
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
      // y = Automation Risk (when graph mode already on)
        case 3:
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Number of Jobs
      // y = Automation Risk (when future mode already on)
        case 4:
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
        case 5:

            break;
        case 6:

    }

  graphYtranslate = window.innerHeight*0.12 - 10; // y position of entire graph

  // Add an axis-holder group
  axisG = svg.append("g")

  var axisYtranslate = window.innerHeight*-0.12;

  if(mode==3){
          // append dashed horizontal line at risk = 0.5

          var axisHz = axisG.append("g")
          .attr("class", "hz")
          .attr("transform", circleHeight((window.innerWidth*-0.28+15),(axisYtranslate*-1.15)) ) // bookmark
          .call(d3.axisBottom(x).tickSize(0))
            .attr("id","axisHz")
            .attr("transform",circleHeight((window.innerWidth*-0.28+15),(window.innerHeight*-0.09)))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

          // text label for the x axis
          var axisLabelHz = axisG.append("text")
          .attr("id","axisLabelHz")
          .style("text-anchor", "middle")
          .attr("transform",circleHeight((window.innerWidth*0.25+15),(window.innerHeight*-0.086)))
          .style("opacity", 0).transition().duration(500).style("opacity",1)
          .text("50% Risk").style("font-size", "16px");

  } else {
    d3.select("#axisHz").transition().duration(500).style("opacity",0).remove()
    d3.select("#axisLabelHz").transition().duration(500).style("opacity",0).remove()
  }

  d3.select("xaxis").remove();

  // Add the X Axis
  axisX = axisG.append("g")
  .attr("class", "axis")
  .attr("transform", circleHeight((window.innerWidth*-0.28+15),(axisYtranslate*-1.15)) )
  .call(d3.axisBottom(x).ticks(5)).attr("id","axisX")
  .style("opacity", 0).transition().duration(500).style("opacity",1);
  // text label for the x axis
  axisLabelX = axisG.append("text")
  .attr("transform", circleHeight((window.innerWidth*0),(axisYtranslate*-1.55)))
  .style("text-anchor", "middle")
  .style("opacity", 0).transition().duration(500).style("opacity",1);

   d3.select("yaxis").remove();

  // Add the Y Axis
  axisY = axisG.append("g")
 .attr("class", "axis")
 .attr("transform",  circleHeight((window.innerWidth*-0.28+9), (axisYtranslate*2.55)) )
 .call(d3.axisLeft(y).ticks(4)).attr("id","axisY")
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the y axis
  axisLabelY = axisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", "17vw")
  .attr("x", "-20vh")
  .attr("dy", "1em")
  .style("text-anchor", "middle")

  resize()


  // axisDecorationYTop = axisG
  //   .append("polygon")
  // .attr("points","20,15 0,15 10,0")
  // .style("fill","lime")
  // .style("stroke","black")
  // .attr("transform", "translate("+window.innerWidth*0.1+","+( -15 )+")")
  
  // axisDecorationTextTop = axisG.append("text")
  //   .style("fill","#49AC52")
  //   .attr("y", "1vh")
  //   .attr("x", "9.2vw")
  //   .attr("dy", "1em")

  // axisDecorationYBtm = axisG
  //   .append("polygon")
  // .attr("points","20,0 0,0 10,15")
  // .style("fill","red")
  // .style("stroke","black")
  // .attr("transform", "translate("+window.innerWidth*0.1+","+( window.innerHeight*0.4 )+")")
  
  // axisDecorationTextBtm = axisG.append("text")
  //   .style("fill","#C81B1B")
  //   .attr("y", "36vh")
  //   .attr("x", "9.2vw")
  //   .attr("dy", "1em")
  

  // function decorateYAxis() { //mode
  //   axisDecorationTextTop.html("More").style("font-size", "20px")
  //   .style("opacity", 0).transition().duration(500).style("opacity",1);

  //   axisDecorationTextBtm.html("Less").style("font-size", "20px")
  //   .style("opacity", 0).transition().duration(500).style("opacity",1);

  //   axisDecorationYTop.html("More").style("font-size", "20px")
  //   .style("opacity", 0).transition().duration(500).style("opacity",1);

  //   axisDecorationYBtm.html("Less").style("font-size", "20px")
  //   .style("opacity", 0).transition().duration(500).style("opacity",1);

  // }
console.log("graph mode "+mode)
console.log("current mode "+currentMode)
  switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        // case 1:
        //     // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");
        //     axisY.call(d3.axisLeft(y).ticks(4))
        //     .style("opacity", 0).transition().duration(500).style("opacity",1);
        //     axisX.call(d3.axisBottom(x).ticks(4))
        //     .style("opacity", 0).transition().duration(500).style("opacity",1);

        //     d3.selectAll("text").text("");

        //     axisLabelX.text("Number of Jobs").style("fill","#49AC52").style("font-size", "20px")
        //     .style("opacity", 0).transition().duration(500).style("opacity",1);
        //     axisLabelY.html("Risk of tasks being replaced by machine work (%)").style("fill","#49AC52").style("font-size", "20px")
        //     .style("opacity", 0).transition().duration(500).style("opacity",1);
            
        //     // decorateYAxis();
        //     break;
      // x = Years of Study
      // y = Wage
        case 0:
        case 1:
            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");
            axisY.call(d3.axisLeft(y).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Years of Study").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Wage ($ per hr)").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            // decorateYAxis();
            break;
      // x = Number of Jobs
      // y = Wage
        case 2:
            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");
            axisY.call(d3.axisLeft(y).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("fill","#49AC52").style("font-family", "Raleway").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Wage ($ per hr)").style("fill","#49AC52").style("font-family", "Raleway").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            // decorateYAxis();
            break;
      // x = Number of Jobs
      // y = Automation Risk (when graph mode already on)
        case 3:
            axisY.call(d3.axisLeft(y).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Risk of tasks being replaced by machine work (%)").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            // decorateYAxis();
            break;
      // x = Number of Jobs
        // y = Automation Risk (when future mode already on)
        case 4:
            axisY.call(d3.axisLeft(y).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Risk of job tasks being replaced by machine work (%)").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            // decorateYAxis();
            break;
  }



}





/////////////////// Annotations ////////////////////

// const type = d3.annotationLabel

// const annotations = [{
//   note: {
//     label: "Longer text to show text wrapping",
//     title: "Natural resources and agriculture",
//   },
//   //can use x, y directly instead of data
//   data: { date: "18-Sep-09", close: 185.02 },
//   x: 100, 
//   y: 100,
//   dy: 137,
//   dx: 162,
//   subject: { radius: 50, radiusPadding: 10 },
// }]

// const parseTime = d3.timeParse("%d-%b-%y")
// const timeFormat = d3.timeFormat("%d-%b-%y")

// var width = window.innerWidth/1.5, // set chart dimensions
//     height = window.innerHeight/1.5,
//     compressY = 0.65;
// //Skipping setting domains for sake of example
// const x = d3.scaleLinear().range([0, width*0.75]);
// const y = d3.scaleLinear().range([height*compressY, 0]);



// const makeAnnotations = d3.annotation()
//   .editMode(true)
//   .type(type)
//   //accessors & accessorsInverse not needed
//   //if using x, y in annotations JSON
//   .accessors({
//     x: d => x(parseTime(d.date)),
//     y: d => y(d.close)
//   })
//   .accessorsInverse({
//      date: d => timeFormat(x.invert(d.x)),
//      close: d => y.invert(d.y)
//   })
//   .annotations(annotations)

// d3.select("svg")
//   .append("g")
//   .attr("class", "annotation-group")
//   .call(makeAnnotations)


    // document.fonts.ready.then(function(){
    //   d3.select("svg")
    //     .append("g")
    //     .attr("class", "annotation-group")
    //     .style('font-size', fontSize(ratio))
    //     .call(makeAnnotations)
    // })
function getPointCoords(circle){ 
  thisCircle = d3.select("#circle_"+circle)
  thisCircleQuery = document.getElementById("circle_"+circle)
  var point = document.getElementById('chart').createSVGPoint();
  point.x = thisCircle.attr("cx");//get the circle cx 
  point.y = thisCircle.attr("cy");//get the circle cy
  var newPoint = point.matrixTransform(thisCircleQuery.getCTM());//new point after the transform
  // console.log(pointLawyers);  
  return newPoint;
}

function createAnnotations(mode){
//  http://d3-annotation.susielu.com/
  var xSc = d3.scaleLinear().range([0, width*0.75]);
  var ySc = d3.scaleLinear().range([height*compressY, 0]);

   switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:
               // Scale the range of the data (using globally-stored nodes)
                xSc.domain([0, maxWorkers]); //minmax workers
                ySc.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Years of Study
      // y = Wage
        case 1:
                xSc.domain([0, maxYearsStudy]); //minmax workers
                ySc.domain([0, maxWage]);
            break;
      // x = Number of Jobs
      // y = Wage
        case 2:
                xSc.domain([0, maxWorkers]); //minmax workers
                ySc.domain([0, maxWage]);
            break;
      // x = Number of Jobs
      // y = Automation Risk (when graph mode already on)
        case 3:
                xSc.domain([0, maxWorkers]); //minmax workers
                ySc.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Number of Jobs
      // y = Automation Risk (when future mode already on)
        case 4:
                xSc.domain([0, maxWorkers]); //minmax workers
                ySc.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
        case 5:

            break;
        case 6:

    }

  // graphYtranslate = window.innerHeight*0.12 - 10; // y position of entire graph

  // var axisYtranslate = window.innerHeight*-0.12;
var labels;
var makeAnnotations;
  // first mode: Wage vs Years of Study


  // Lawyers circle_207 Judges 206 Optometrists 170
  var pointLawyers = getPointCoords(207),
      titleLawyers = "Lawyers and Quebec notaries",
      labelLawyers = "$ salary amount";

  var pointJudges = getPointCoords(206),
      titleJudges = "Judges",
      labelJudges = "$ salary amount";

  var pointOptometrists = getPointCoords(170),
      titleOptometrists = "Optometrists",
      labelOptometrists = "$ salary amount";

  var pointSecondTeachers = getPointCoords(203),
      titleSecondTeachers = "Secondary school teachers",
      labelSecondTeachers = "$ salary amount";

  var pointElementTeachers = getPointCoords(204),
      titleElementTeachers = "Elementary school teachers",
      labelElementTeachers = "$ salary amount";

  var pointNurses = getPointCoords(165),
      titleNurses = "Registered nurses",
      labelNurses = "$ salary amount";


  switch (mode) {

    case 0: // Salary vs Study
    case 1:
    // annotate judges, lawyers, optometrists
      labels = [
      {
        note: {
          title: titleJudges,
          label: labelJudges,
          },
          // connector: {},
          x: pointJudges.x,
          y: pointJudges.y,
          dy: -10,
          dx: -20,
      },{
        note: {
          title: titleLawyers,
          label: labelLawyers,
          },
          // connector: {},
          x: pointLawyers.x,
          y: pointLawyers.y,
          dy: -30,
          dx: -60,
      },{
        note: {
          title: titleOptometrists,
          label: labelOptometrists,
          },
          x: pointOptometrists.x,
          y: pointOptometrists.y,
          dy: -30,
          dx: -150,
      }]
      break;

    case 2:
      labels = [
      {
        note: {
          title: titleLawyers,
          label: labelLawyers,
        },
          x: pointLawyers.x,
          y: pointLawyers.y,
          dy: -30,
          dx: 60,
      },{
        note: {
          title: titleElementTeachers,
          label: labelElementTeachers,
        },
          x: pointElementTeachers.x,
          y: pointElementTeachers.y,
          dy: -50,
          dx: -10,
      },{
        note: {
          title: titleSecondTeachers,
          label: labelSecondTeachers,
        },
          x: pointSecondTeachers.x,
          y: pointSecondTeachers.y,
          dy: -50,
          dx: 50,
      }]

      break;

    case 3:
      labels = [
      {
        note: {
          title: titleLawyers,
          label: labelLawyers,
        },
          x: pointLawyers.x,
          y: pointLawyers.y,
          dy: 40,
          dx: 50,
      },{
        note: {
          title: titleElementTeachers,
          label: labelElementTeachers,
        },
          x: pointElementTeachers.x,
          y: pointElementTeachers.y,
          dy: 95,
          dx: -10,
      },{
        note: {
          title: titleNurses,
          label: labelNurses,
        },
          x: pointNurses.x,
          y: pointNurses.y,
          dy: 50,
          dx: -40,
      }]

      break;

    } // end switch

    makeAnnotations = d3.annotation()
      // .editMode(true)
      // .type(type)
      .type(d3.annotationLabel)
      //accessors & accessorsInverse not needed
      //if using x, y in annotations JSON
      .accessors({
        x: d => x(d.yearsStudy),
        y: d => y(d.wage)
      })
      .accessorsInverse({
         yearsStudy: d => x.invert(d.x),
         wage: d => y.invert(d.y)
      })
      .annotations(labels)
      
// const makeAnnotations = d3.annotation()
//   .annotations(annotations)

    d3.select("#chart")
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations)
      .style("opacity",0).transition().duration(500).style("opacity",1)
}
      // },{
      //   note: {
      //     label: "somelabel",
      //     title: "sometitle",
      //     wrap: 150
      //   },
      //   connector: {
      //     // end: "dot",
      //     // type: "curve",
      //     //can also add a curve type, e.g. curve: d3.curveStep
      //     // points: [[100, 14],[190, 52]]
      //   },
      //   x: 350,
      //   y: 150,
      //   dy: 137,
      //   dx: 262
      // },{
      //   //below in makeAnnotations has type set to d3.annotationLabel
      //   //you can add this type value below to override that default
      //   type: d3.annotationCalloutCircle,
      //   note: {
      //     label: "A different annotation type",
      //     title: "d3.annotationCalloutCircle",
      //     wrap: 190
      //   },
      //   //settings for the subject, in this case the circle radius
      //   subject: {
      //     radius: 50
      //   },
      //   x: 620,
      //   y: 150,
      //   dy: 137,
      //   dx: 102
      // }]
      // .map(function (l) {
      //   l.note = Object.assign({}, l.note, { title: "Title: " + l.note.title,
      //     label: "label: " + l.note.label });
      //   return l;
      // })
      // .map(function(d){ d.color = "#E8336D"; return d})







function hideLeftButtons() {
    // hide industry split, shuffle, combine
    d3.select("#split").transition().duration(500).style("opacity", 0);
    setTimeout(function(){d3.select("#split").style("display","none")}, 500);
    d3.select("#shuffle").transition().duration(500).style("opacity", 0);
    setTimeout(function(){d3.select("#shuffle").style("display","none")}, 500);
    d3.select("#combine").transition().duration(500).style("opacity", 0);
    setTimeout(function(){d3.select("#combine").style("display","none")}, 500);
    d3.select(".btn-group").style("padding-left", "0px");
    // hide play/pause as well
    d3.select("#pause").transition().duration(500).style("opacity", 0);
    d3.select("#unpause").transition().duration(500).style("opacity", 0);
    setTimeout(function(){
      d3.select("#pause").style("display", "none");
      d3.select("#unpause").style("display", "none");
    }, 500)
}
function showLeftButtons() {

    d3.select("#split").style("display","inline").transition().duration(500).style("opacity", 1);
    d3.select("#shuffle").style("display","inline").transition().duration(500).style("opacity", 1);
    d3.select(".btn-group").style("padding-left", "0px")

    d3.select("#pause").style("display","inline").transition().duration(500).style("opacity", 1);
    d3.select("#unpause").transition().duration(500).style("opacity", 1);
}



function graphModeOff() {
  // move legend div back
  d3.select(".legend").style("margin-left","0px")

  // clear annotations
  d3.selectAll(".annotation-group").transition().duration(500).style("opacity",0).remove()

  // change available buttons
  d3.select("#btnColours").transition().duration(500).style("opacity",1).style("pointer-events","auto")
  d3.select("#btnSizes").transition().duration(500).style("opacity",1).style("pointer-events","auto")

  d3.select("#btnColours").transition().duration(500).style("margin-left","0px")
  d3.select("#btnSizes").transition().duration(500).style("margin-left","0px")

  d3.select("#splitShuffle").transition().duration(500).style("opacity", 1);
  d3.select("#graphToggle").attr("src","img/toggle-off.png")

    showLeftButtons();
  

  // hide graph modes options
  d3.select("#suggestedViewsDiv").style("display","none");
  
  // remove axes
  axisG.style("opacity", 1).transition().duration(500).style("opacity",0)
  .remove();

    // move sliders back up
    moveBottomUp();
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

    // start the simulation after the transition delay
    setTimeout(function() {
      simulation.alphaTarget(0.001).restart();
    }, 750);

  
  return;

}








// Transition node areas and colours to automationRisk
  var pastPosX = {};
  var pastPosY = {};

///////////// Reset Filters /////////////

d3.select("#resetFilters").on('click', function(d) {
  // if (graphMode == 1) {
  //   graphMode = 0;

  //   graphModeOff();
  // }c
  resetFilters(currentMode);
});

resetFilters = function(mode) {

  // Reset green inset-left on all sliders
  // Main sliders
  for(var i=0; i<sliderArray.length; i++) {

      d3.select("#inset-left_"+i).transition().duration(500).attr("x2", 0 )

  };

  // reset the graph
  graph = store;
  hideAll();
  hideGraphViewCallout();

  // reset the slider positions
  for(var i=0; i<sliderArray.length; i++) {
    handleArray[i].transition().duration(500).attr("cx", sliderScaleArray[i](0)); // move the slider handle
    sliderPositionsArray[i] = 0; // Update the slider positions array
  };

  // reset all circles
  circles = circles.data(store, function(d) { return d.id });
  // ENTER (create the circles with all attributes)
  enterUpdateCircles();
  // restart simulation only if graph mode off
  if (graphMode == 0) {
      resetSimulation();
  } else if (graphMode == 1) {

      switch (mode) {

        case 0:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 })
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 1:
          circles
            // x = Years of Study
          .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;

        case 2:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;
          // x = Number of Jobs
          // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
        case 3:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4})
            // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 4:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4})
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 5: // graph mode off
          circles
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
          .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
          break;
        }


  }
};


function resetSimulation() {
  simulation.nodes(store)
  .force("collide", forceCollide)
  .force("cluster", forceCluster)
  .force("gravity", forceGravity)
  .force("x", forceXCombine)
  .force("y", forceYCombine)
  .on("tick", tick);

  restartSimulation();
}

function restartSimulation(){
  simulation.alpha(0.25).alphaTarget(0.001).restart();
}

/////// Tooltips (post-filter)

enterUpdateCircles = function() {
    var newCircles = circles.enter().append("circle")
    .attr("r", function(d) { return d.radius }) // start at full radius
    .attr("transform", "translate("+window.innerWidth*0.5+","+ (120 + window.innerHeight*0.2) +")") //flag! need to make equation for width/height ratio
    .style("fill", function(d) { 
      if(circleExpanded[d.id] != 1){
        return color(d.cluster); 
      }else { return "url(#pattern_"+d.id+")" }
     })
    .attr("class","jobCircle")
    .attr("id",function(d) { return "circle_"+d.id })
    .attr("opacity",
      function(d) { // make filtered circles transparent
        // if the industry is on the list, transparent
        if( filteredIndustries.includes(+d.industryNum) ) { 
          return 0.1 }
        else{ 
          return 1 }
    })  


    // newCircles.attr("r",0).transition().duration(500).attr("r", function(d) { return d.radius })

    // Tooltips
 // Tooltips
    .on("mouseenter", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.selectAll("circle").attr("stroke", "none");
      d3.select(this)
        .style("fill", "url(#pattern_"+d.id+")" )
        // .attr("stroke", "black")
        .style("stroke-width", 2)
        .attr("stroke", color(d.cluster));
      showToolTip(0);
      tooltipMouseover(d);
      hoverTimeout = setTimeout(function(){
        tooltipLarge(d)
        clicked = 1
      }, 1750)
      })
    .on("mouseout", function(d) {

      if(!circleExpanded[d.id] == 1){
        d3.select(this)
          .style("fill", color(d.cluster) )
          // .attr("stroke", "black")
          .style("stroke-width", 2)
          .attr("stroke", color(d.cluster));
      }

      clearTimeout(hoverTimeout)
      if (clicked == 1) return;
      clicked = 0;
      hideToolTip(500)
      d3.select(this).attr("stroke", "none");
      // div.transition().duration(500).style("opacity", 0)

    })
    .on("click", function(d) {
      clearTimeout(hoverTimeout)
      // click-off
      if (clicked == 1) { 
        clicked = 0
        hideToolTip(500)
      // click-on
      } else if (clicked == 0) {
        clicked = 1;
        tooltipLarge(d);
       }
      // hideToolTip(0);
      // if(typeof div2 != "undefined") div2.transition().duration(250).style("height","0px").remove();
      // tooltipSmall(d);}
      })

  drag_handler(newCircles);
  //  ENTER + UPDATE
  if(graphMode == 1){ // transition in radii in graph mode
    circles = circles.merge(newCircles.attr("r",0).transition().duration(500).attr("r", function(d) { return d.radius }));
  }else if(graphMode == 0){
    circles = circles.merge(newCircles);
  }
  

}











///////////////////////////////// Filters ////////////////////////////////////
var sliderSideTranslate = 9;
if(window.innerWidth >= 1007) {
  sliderSideTranslate = window.innerWidth*0.01
  d3.select("#titleBar").style("margin-left", window.innerWidth*0.01 + "vw")
  d3.select(".search-div").style("right", window.innerWidth*0.0094 + "vw")
}
var sliderHeightTranslate = 9;
// d3.select("#titleBar").style("margin-left","14vw")
//////////////// Filter Sliders 2: Multiple Sliders from an Array //////////////////////

createSliders(sliderArrayMain, sliderTitlesArrayMain);

// createSliders(sliderArrayLang, sliderTitlesArrayLang);

function createSliders(createSliderArray, sliderTitlesArray){
// For Each Slider create the slider
  for(var i=0; i<createSliderArray.length; i++) {
    
    var sub_xtranslate = 3,
        xtrans,
        ytrans;
    var leftOrRight, topOrBottom;

  // Top row
  if(["Language skills", "Logic skills"].includes(sliderTitlesArray[i])){
    xtrans = sliderSideTranslate;
    ytrans = sliderHeightTranslate;
    topOrBottom = "top";
  }
	// Right column
	if(["Math skills", "Logic skills"].includes(sliderTitlesArray[i])){
		// xtrans = sliderSideTranslate;
    leftOrRight = "right";
    // posn = "fixed";
	}
   // Bottom row
  if(["Math skills", "Computer skills"].includes(sliderTitlesArray[i])){
    xtrans = sliderSideTranslate;
    ytrans = sliderHeightTranslate;
    topOrBottom = "bottom";
  }
  // Left column
  if(["Language skills", "Computer skills"].includes(sliderTitlesArray[i])){
    leftOrRight = "left";
  }

  // Title & SVG
  var sliderButtonArrows = ["&#9660", "&#9660", "&#9650", "&#9650"];
  var sliderButtonPositions = [];

  sliderSVGArray[i] = d3.select("body")
  .append("div")
    .attr("id", "sliderDiv_"+sliderArrayMain[i]) // sliderDiv_skillsLang
    .style("position", "fixed")
    .style(leftOrRight, xtrans+"vw")
    .style(topOrBottom, ytrans+"vh")
    // lg and xl
    .html("<div class='d-none d-sm-none d-md-none d-lg-inline d-xl-inline' align='left' style='margin-left: "+(sub_xtranslate+2)+"%;"
    	+"font-size: 150%; font-weight: bold;"
    	+" color:  #49AC52; font-family: Raleway'>"
      +sliderTitlesArray[i] // "Language skills"
      +"<img id=question_"+i+" class='img-question d-none d-sm-inline d-md-inline d-lg-inline d-xl-inline' src='img/question.png' "
      +"alt='help' height='21' width = '24'>"
      +"</div>"
    // md sm and xs
  +"<div class='d-inline d-sm-inline d-md-inline d-lg-none d-xl-none' align='left' style='margin-left: "+(sub_xtranslate)+"%;"
      +"font-size: 150%; font-weight: bold;"
      +" color:  #49AC52; font-family: Raleway'>"
      +sliderTitlesArray[i].substring(0,sliderTitlesArray[i].length - 7) // "Language skills"
      +"<img class='d-none d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
      +"alt='help' height='21' width = '24'>"
      +"</div>"
    // sm and xs
  // +"<div class='d-inline d-sm-inline d-md-none d-lg-none d-xl-none' align='left' style='margin-left: "+(sub_xtranslate)+"%;"
  //     +"font-size: 100%; font-weight: bold;"
  //     +" color:  #49AC52; font-family: Raleway'>"
  //     +sliderTitlesArray[i].substring(0,sliderTitlesArray[i].length - 7) // "Language skills"
  //     +"<img style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
  //     +"alt='help' height='21' width = '24'>"
  //     +"</div>"
      )

  // Not Much       Lots
  .append("div")
    .attr("align", "left")
    .style("position", "relative")
    .style("margin-top", "15.5%")
    .style("margin-left", (sub_xtranslate)+"%")
    .style("color", "#49AC52")
    .style("font-weight", "bold")
    .style("font-family", "Raleway")
    .html("<div id='notmuchlots_"+i+"' style='margin-left: 5px; margin-top: -4px'>"
      +"Not&nbspmuch"
      +"<span id='notmuchSpan_"+i+"' style='margin-left: "+137+"px'></span>"
      +"Lots</div>"+
      "<div id=subSliderDiv_"+i+">"+
      "<span>"+
        "<button id='btnSubsliders_"+i+"' class='expand-sliders-btn' style='width: 250px; margin-top: 10px; margin-left: 1px; fill: white; z-index: 99;' "+
        "onclick='expandSliders("+i+")' type='button'>"+
          "<span id='spanSubsliders_"+i+"' style='font-family: Raleway; font-size: 15; font-weight: bold; color: #49AC52;'>"+sliderButtonArrows[i]+" view "+sliderTitlesArrayMain[i].toLowerCase()+" "+sliderButtonArrows[i]+"</span>"+
        "</button>"+
      "</span></div>")
    .select(function() {
    return this.parentNode;
  	})
  // Slider svg
  .append("svg")
  	.style("z-index", 99)
  	// .attr("viewBox", "0 3 "+230+" "+50)
    .style("position", "absolute")
    .style("top", 32+"px") // y position
    // .style("margin-left", -sub_xtranslate+"%") // x position
    .attr("id", "slider_"+i)
    .attr("width", 250)
    .attr("height", 50);


  sliderSVGArray[i].attr("class", "d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline")
  var mainSlidersWidth = 223;
  var reductionFactor = 0.7;

  // Scale
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){ return d[sliderArrayMain[i]]}) * reductionFactor ]) // lower the maximum for all skills by 20% to prevent filtering down to 0
    .range([0, mainSlidersWidth]) // Width of slider is 200 px
    .clamp(true);
  // Bugfix: math max not working
  if(["Math skills"].includes(sliderTitlesArray[i])) {
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, 59 * reductionFactor])
    .range([0, mainSlidersWidth]) // Width of slider is 200 px
    .clamp(true);
  }

  // Move Wage, Number of Jobs down
    // Slider
  sliderMulti[i] = sliderSVGArray[i].append("g") // switch to SVG with viewBox?
  .attr("class", "slider")
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

  // track
  sliderMulti[i].append("line")
  .attr("class", "track")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .select(function() {
    return this.parentNode;
  }) // inset
  .append("line")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .attr("class", "track-inset")
  .select(function() {
    return this.parentNode;
  }) // inset-left (fills up green on drag)
  .append("line")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[0])
  .attr("class", "track-inset-left")
  .attr("id","inset-left_"+i)
  .select(function() {
    return this.parentNode;
  }) // overlay
  .append("line")
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .attr("class", "track-overlay")
  .attr("id", i)
  .on("mouseover", function() {
    d3.select("#handle_"+this.id).style("fill","#eaeaea")
  })
  .on("mouseout", function() {
    d3.select("#handle_"+this.id).style("fill","white")
    if(typeof miniTooltip != "undefined"){
      miniTooltip.transition().duration(500)
      .style("opacity",0)
    }
  })
  .call(d3.drag()
    .on("start.interrupt", function() {
      sliderMulti[event.target.id].interrupt();
    }) // drag update function
    .on("start drag", function() {
      if(typeof miniTooltip == "undefined"){
        miniTooltip = d3.select("body").append("div")
          .attr("class", "minitooltip")
          .style("opacity", 0);
      }
      // show mini tooltip indicating how many job groups remain
      
      miniTooltip.transition().duration(200)
      .style("opacity",.9)
      miniTooltip.html(graph.length + " job groups<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;remain")
      // .style("left", (event.pageX - 64) + "px")
      
      if($(event.target).attr('class') == 'track-overlay'){
        miniTooltip.style("top", (event.target.getBoundingClientRect().top - 90) + "px")
      }
                  // (d3.select("#handle_"+this.id)
      if(graph.length >= 10){ 
        miniTooltip.style("left", (document.getElementById("handle_"+this.id).getBoundingClientRect().left - 55) + "px") 

      }
      graph.length <= 50 ? miniTooltip.style("color","#FEB22E") : miniTooltip.style("color", "white")
      if(graph.length <= 25){ 
        miniTooltip.style("color","#FE2E2E") 





  // .append("image").attr("xlink:href","/img/NOC_images/"+d.noc+".jpg")
    // .attr("cy",d3.select(function(){return this.parentNode}).attr("cy"))
    // .attr("r",d3.select(function(d){return d.r}))
        // .transition().duration(350)
        // .attr("r","60px")

        expandCircleImages()


        // currentSize = "Number of Jobs"
        // document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
        // mouseEnterOff() // turn off until mouseleave
        // setSizes("workers")






      } else { collapseCircleImages(); }

      if(graph.length >= 175){
        forceGravity = d3.forceManyBody().strength(function(d) { return -10 * d.radius });

        simulation
        .force("collide", d3.forceCollide(function(d) { return d.radius }))
        .force("cluster", forceCluster)
        .force("gravity", forceGravity)
        .force("x", forceXCombine)
        .force("y", forceYCombine)
        .on("tick", tick);

        if(graphMode == 0){
          simulation.alpha(0.15).alphaTarget(0.001).restart();
        }

      }

      updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x), currentMode); // pass the current line id to update function
      // }
    
    })
  );

  handleArray[i] = sliderMulti[i].insert("circle", ".track-overlay")
    .attr("class", "handle")
    .style("z-index", 99)
    .attr("r", 9)
    .attr("id","handle_"+i);

    // Bugfix: lang slider not on top
  // if(["Language Skills"].includes(sliderTitlesArray[i])) {
  //   d3.select("#"+i).style("z-index", 99);
  // }

};




//////////////////////// Create Sub Sliders ///////////////////////////////

// for each slider_1-4,                           (1: Language 2: Logic 3: Math 4: Computer)
//  for each subskill in that skill
//    append/create a subslider with that subskill's y-translate height

// TODO: append divs to appropriate parents

// y-translate map
// map slider name to x,y position
var sliderYTranslateMap = new Map();
var sliderXTranslateMap = new Map();
var sliderLeftRightMap = new Map();
var fontSizeMap = new Map();

for (var i = sliderTitlesArray.length - 1; i >= 0; i--) {
  fontSizeMap.set(sliderTitlesArray[i], 100)
}
// Lang X, Y
for (var i = sliderTitlesArrayLang.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayLang[i], 1.5) // X
  sliderYTranslateMap.set(sliderTitlesArrayLang[i], window.innerHeight*0.08*i-170) // Y
  // sliderLeftRightMap.set(sliderTitlesArrayLang[i], "left")
  // shrink longer titles
  if(["Job Task Planning and Organizing","Measurement and Calculation",
    "Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayLang[i])){
      fontSizeMap.set(sliderTitlesArrayLang[i], 100)
  }
}
// Logi X, Y
for (var i = sliderTitlesArrayLogi.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayLogi[i], 1.5) // X
  sliderYTranslateMap.set(sliderTitlesArrayLogi[i], window.innerHeight*0.08*i-170) // Y
  // sliderLeftRightMap.set(sliderTitlesArrayLogi[i], "right")
  // shrink longer titles
  if(["Job Task Planning and Organizing","Measurement and Calculation",
    "Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayLogi[i])){
      fontSizeMap.set(sliderTitlesArrayLogi[i], 100)
  }
}
// Math X, Y
for (var i = sliderTitlesArrayMath.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayMath[i], 1.5) // X
  sliderYTranslateMap.set(sliderTitlesArrayMath[i], window.innerHeight*0.08*i-170) // Y
  // sliderLeftRightMap.set(sliderTitlesArrayMath[i], "right")
  // shrink longer titles
  if(["Job Task Planning and Organizing","Measurement and Calculation"].includes(sliderTitlesArrayMath[i])){
      fontSizeMap.set(sliderTitlesArrayMath[i], 100)
  } else if(["Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayMath[i])){
      fontSizeMap.set(sliderTitlesArrayMath[i], 100)
  }
}
// Comp X, Y
for (var i = sliderTitlesArrayComp.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayComp[i], 1.5) // X
  sliderYTranslateMap.set(sliderTitlesArrayComp[i], window.innerHeight*0.08*i-170) // Y
  // sliderLeftRightMap.set(sliderTitlesArrayComp[i], "left")
  // resize larger titles
  if(["Job Task Planning and Organizing","Measurement and Calculation",
    "Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayComp[i])){
      fontSizeMap.set(sliderTitlesArrayComp[i], 100)
  }
}



createSubSliders(sliderArrayLang, sliderTitlesArrayLang, 4, 0);

createSubSliders(sliderArrayLogi, sliderTitlesArrayLogi, 7, 1);

createSubSliders(sliderArrayMath, sliderTitlesArrayMath, 11, 2);

createSubSliders(sliderArrayComp, sliderTitlesArrayComp, 15, 3);




function createSubSliders(subSliderArray, subSliderTitlesArray, indexIn_sliderArray, appendToDiv){
  
  // For Each Slider create the slider
  for(var i=0; i<subSliderArray.length; i++) {
    
    // sliderPositionsArray, 
    // sliderScaleArray, and handleArray
    // are used in filterAll() and updateMulti() 
    // so they must include all sliders 
    // --> increment i by j
    var j = indexIn_sliderArray;

    var xtranslate, ytranslate;
    // Left column

    ytranslate = sliderYTranslateMap.get(subSliderTitlesArray[i])
    xtranslate = sliderXTranslateMap.get(subSliderTitlesArray[i])
    // var leftOrRight = sliderLeftRightMap.get(subSliderTitlesArray[i])

    // Title & SVG
    sliderSVGArray[(i+j)] = d3.select("#btnSubsliders_"+appendToDiv)
      .append("div").style("display","inline")
        .attr("id", "sliderDiv_"+subSliderArray[i]) // sliderDiv_skillsLang
        .style("position", "absolute")
        .style("left", xtranslate+"%")
        .style("top", ytranslate+220+"px")
        // lg and xl
        .html("<div class='d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline' align='left' style='"+
          "position: absolute; left: "+(xtranslate+3)+"%; width: 400px;"
          +" font-size: "+fontSizeMap.get(subSliderTitlesArray[i])+"%; font-weight: bold;"
          +" color:  #49AC52; font-family: Raleway'>"
          +subSliderTitlesArray[i] // Skill title
          +"</div>"
        // md sm and xs
      // +"<div class='d-inline d-sm-inline d-md-inline d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
      //     +"font-size: 115%; font-weight: bold;"
      //     +" color:  #49AC52; font-family: Raleway'>"
      //     +subSliderTitlesArray[i].substring(0,subSliderTitlesArray[i].length - 7)+"..." // "Language skills"
      //     +"</div>"
        // sm and xs
      // +"<div class='d-inline d-sm-inline d-md-none d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
      //     +"font-size: 100%; font-weight: bold;"
      //     +" color:  #49AC52; font-family: Raleway'>"
      //     +subSliderTitlesArray[i].substring(0,subSliderTitlesArray[i].length - 7) // "Language skills"

      //     +"</div>"
          )

      .append("div").attr("id", "sliderDiv2_"+subSliderArray[i])
        .attr("align", "left")
        .style("position", "relative")
        .style("margin-top", "19%")
        .style("margin-left", 13+"%")
        .style("color", "#49AC52")
        .style("font-weight", "bold")
        .style("font-family", "Raleway")
        .html("<div id='notmuchlots_"+(i+j)+"' class='d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='font-family: Raleway'>Not&nbspmuch"
          +"<span id='notmuchSpan_"+(i+j)+"' style='margin-left: "+window.innerWidth*0.135+"px'></span>"
          +"Lots</div>")
        .select(function() {
        return this.parentNode;
        })

      .append("svg").attr("id", "sliderSvg_"+subSliderArray[i])
        .style("z-index", 99)
        .style("left", xtranslate+"%")
        // .attr("viewBox", "0 10 "+250+" "+50)
        .style("position", "absolute")
        .style("top", window.innerHeight*0.0215+"px") // y position
        // .style("margin-left", -xtranslate+"%") // x position
        .attr("id", "slider_"+(i+j))
        .attr("width", 280)
        .attr("height", 50);


     
    // sliderSVGArray[(i+j)].attr("class", "d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline")

    // hide until shown
    sliderSVGArray[(i+j)].style("display","none")
    // d3.select("#sliderDiv2_"+sliderArray[(i+j)]).style("visibility", "hidden")
    d3.select("#notmuchlots_"+(i+j)).style("visibility", "hidden")
    d3.select("#sliderDiv_"+subSliderArray[i]).style("visibility", "hidden")

    var slidersWidth = 230;
    var reductionFactorSubskills = 0.6; // reduce the subskill slider ranges to 60% to avoid over-filtering

    // Scale
    sliderScaleArray[(i+j)] = d3.scaleLinear()
      .domain([0, d3.max(nodes, function(d){ return d[subSliderArray[i]]}) * reductionFactorSubskills ])
      .range([0, slidersWidth]) // Width
      .clamp(true);

    if(["Oral Communication"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 43 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Reading"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 49 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Writing"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 55 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Job Task Planning and Organizing"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 23 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Critical Thinking"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 20 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Problem Solving"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 23 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Document Use"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 33 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Data Analysis"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 25 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Finding Information"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 20 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Digital Technology"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 58 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Measurement and Calculation"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 31 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Scheduling or Budgeting and Accounting"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 28 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Numerical Estimation"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[(i+j)] = d3.scaleLinear()
        .domain([0, 11 * reductionFactorSubskills ])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    // Bugfix: math max not working
    // if(["Math skills"].includes(subSliderTitlesArray[i])) {
    // sliderScaleArray[i] = d3.scaleLinear()
    //   .domain([0, 59])
    //   .range([0, 200]) // Width of slider is 200 px
    //   .clamp(true);
    // }
   
   // Slider
    sliderMulti[(i+j)] = sliderSVGArray[(i+j)].append("g") // switch to SVG with viewBox?
      .attr("class", "slider")
      // .style("z-index", 99)
      .attr("transform", "translate(" + (15+xtranslate) + "," + 25 + ")");

      // track
      sliderMulti[(i+j)].append("line")
      .attr("class", "track")
      // .style("z-index", 98)
      .attr("x1", sliderScaleArray[(i+j)].range()[0])
      .attr("x2", sliderScaleArray[(i+j)].range()[1])
      .select(function() {
        return this.parentNode;
      }) // inset
      .append("line")
      // .style("z-index", 98)
      .attr("x1", sliderScaleArray[(i+j)].range()[0])
      .attr("x2", sliderScaleArray[(i+j)].range()[1])
      .attr("class", "track-inset")
      .select(function() {
        return this.parentNode;
      }) // inset-left (fills up green on drag)
      .append("line")
      .attr("x1", sliderScaleArray[(i+j)].range()[0])
      .attr("x2", sliderScaleArray[(i+j)].range()[0])
      .attr("class", "track-inset-left")
      .attr("id","inset-left_"+(i+j))
      .select(function() {
        return this.parentNode;
      }) // overlay
      .append("line")
      // .style("z-index", 99)
      .attr("x1", sliderScaleArray[(i+j)].range()[0])
      .attr("x2", sliderScaleArray[(i+j)].range()[1])
      .attr("class", "track-overlay")
      .attr("id", (i+j))
      .on("mouseover", function() {
        d3.select("#handle_"+this.id).style("fill","#eaeaea")
      })
      .on("mouseout", function() {
        d3.select("#handle_"+this.id).style("fill","white")
        if(typeof miniTooltip != "undefined"){
          miniTooltip.transition().duration(500)
          .style("opacity",0)
        }
      })

      .call(d3.drag()
        .on("start.interrupt", function() {
          sliderMulti[event.target.id].interrupt();
        }) // drag update function
        .on("start drag", function() {
          if(typeof miniTooltip == "undefined"){
            miniTooltip = d3.select("body").append("div")
            .attr("class", "minitooltip")
            .style("opacity", 0);
          }
          // show mini tooltip indicating how many job groups remain
          miniTooltip.transition().duration(200)
          .style("opacity",.9)
          miniTooltip.html(graph.length + " job groups<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;remain")
          .style("left", (event.pageX - 64) + "px")
          .style("top", (event.target.getBoundingClientRect().top - 88) + "px")

          if(graph.length >= 10){ miniTooltip.style("left", (document.getElementById("handle_"+this.id).getBoundingClientRect().left - 55) + "px") }
          graph.length <= 30 ? miniTooltip.style("color","#FEB22E") : miniTooltip.style("color", "white")
          if(graph.length <= 25){ 
            miniTooltip.style("color","#FE2E2E") 
            expandCircleImages();
          } else {

            collapseCircleImages();
          }
          // if(graph.length >= 16){
          // }
          if(graph.length >=175){

            forceGravity = d3.forceManyBody().strength(function(d) { return -10 * d.radius });

            simulation
            .force("collide", d3.forceCollide(function(d) { return d.radius }))
            .force("cluster", forceCluster)
            .force("gravity", forceGravity)
            .force("x", forceXCombine)
            .force("y", forceYCombine)
            .on("tick", tick);

            simulation.alpha(0.15).alphaTarget(0.001).restart();

          }

          updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x), currentMode); // pass the current line id to update function
        
        }));

    handleArray[(i+j)] = sliderMulti[(i+j)].insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("id","handle_"+(i+j))
      // .style("z-index", 99)
      .style("box-shadow", "3px 3px 3px black")
      .attr("r", 9);

      // Bugfix: lang slider not on top
    // if(["Language Skills"].includes(subSliderTitlesArray[i])) {
    //   d3.select("#"+i).style("z-index", 99);
    // }

  } //end for
};//end createSubSliders

function collapseCircleImages() {

  if(circlesExpanded == 1){
    circlesExpanded = 0;

    circles.transition().duration(700)
    .delay(function(d, i) { return i * 5})
    .attrTween("r", function(d) {
      var i = d3.interpolate(40, 10);
      return function(t) { return d.radius = i(t); };
    }) 

    if(graphMode == 0) {
      setTimeout(function() { 
          simulation
          .force("collide", d3.forceCollide(function(d) { return d.radius + 1 }))
          .force("cluster", forceCluster)
          // .force("gravity", forceGravity)
          .force("x", forceXCombine)
          .force("y", forceYCombine)
          .on("tick", tick);

          simulation.alpha(0.15).alphaTarget(0.001).restart();

      }, 0);
      // setTimeout(function() { resetSimulation() }, 700);

      // setTimeout(function() { enterUpdateCircles();
        
        forceGravity = d3.forceManyBody().strength(function(d) { return -22 * d.radius });

        simulation
        .force("gravity", // default strength = -30, negative strength = repel, positive = attract
                forceGravity)
        // .force()
        .force("collide", d3.forceCollide(function(d) { return d.radius + 20 }))
        .alpha(0.6).alphaTarget(0.001).restart(); 
    }
  } else if (circlesExpanded == 0){

  }
}

function expandCircleImages() {

  //bookmark
  //modify: toggle-on, toggle-off, shrink back down
  if (circlesExpanded == 0) {
        
        circlesExpanded = 1;

        circles.transition().duration(500)
          .delay(function(d, i) { return i * 5})
          .attrTween("r", function(d) {
            var i = d3.interpolate(10, 40);
            return function(t) { return d.radius = i(t); };
          })
          // transition the job images into the fill pattern

            circles.style("fill", function(d) { 
              circleExpanded[d.id] = 1;
              return "url(#pattern_"+d.id+")" })
              .style("stroke-width","2px")
              .style("stroke", function(d) { return color(d.cluster)})



          // .attr("fill", function(d) { return "url(#pattern_"+d.id+")" })

        if(graphMode == 0) {
          setTimeout(function() { 
            forceGravity = d3.forceManyBody().strength(function(d) { return -30 * d.radius });

              simulation
              .force("collide", d3.forceCollide(function(d) { return 42 }))
              .force("cluster", forceCluster)
              .force("gravity", forceGravity)
              .force("x", forceXCombine)
              .force("y", forceYCombine)
              .on("tick", tick);

              simulation.alpha(0.15).alphaTarget(0.001).restart();

          }, 500);
          // setTimeout(function() { resetSimulation() }, 700);

          // setTimeout(function() { enterUpdateCircles();
            
            // .force("collide", d3.forceCollide(function(d) { return d.radius + 20 }))
            // .alpha(0.6).alphaTarget(0.001).restart(); 
          // }, 200);
        }
      } else if (circlesExpanded == 1) {

      }

}




// Update function which detects current slider
//  general update pattern for updating the graph
function updateMulti(h, mode) {
 
  // using the slider handle
  var sliderID = event.target.id;
  // jam sliders at n <= 10
    // jamSliders()
    handleArray[sliderID].attr("cx", sliderScaleArray[sliderID](h)); // move the slider handle
  // }

  // Update the slider positions array
  sliderPositionsArray[sliderID] = sliderScaleArray[event.target.id].invert(d3.event.x);

  
  var filteredNodes = filterAll()
  //  UPDATE
  circles = circles.data(filteredNodes, function(d) { return d.id });
    
  // EXIT
  circles.exit().transition().duration(500)
  // exit transition: "pop" radius * 1.5 + 5 & fade out
  .attr("r", function(d) { return d.radius * 2.1 + 5 })
  .attrTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return d.opacity = i(t); };
  })
  .remove();

  // ENTER (create the circles with all attributes)
  enterUpdateCircles();

  //bookmarklet : resetSimulation()?

  // reset simulation if graph mode = off
  if (graphMode == 0) {
    simulation.nodes(filteredNodes)
    .force("collide", forceCollide)
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);
    restartSimulation();

    } else if (graphMode == 1) { // else reposition nodes on graph
  
      switch (mode) {

        case 0:
        case 1:
          circles
            // x = Years of Study
          .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;

        case 2:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;
          // x = Number of Jobs
          // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
        case 3:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4})
            // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 4:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4})
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 5: // graph mode off
          circles
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
          .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
          break;
        }

  }
// } // end if graph length > 10
};//end updateMulti



// Graph View Callout

// show
graphViewCallout = function() {
  // d3.select("#graphCallout").transition().duration(400).style("width","300px")
  d3.select("#graph").style("box-shadow","0px 0px 17px 7px #E6E447")  
  d3.select("#graphCallout").transition().duration(400).style("opacity",1)
  // d3.select("#graphCallout2").transition().duration(400).style("opacity",1)
  d3.select("#resetFilters").style("box-shadow","0px 0px 17px 7px #E6E447")  
}

// hide
hideGraphViewCallout = function() {
  d3.select("#graph").style("box-shadow","3px 3px 17px grey")
  d3.select("#resetFilters").style("box-shadow","3px 3px 17px grey")  
  d3.select("#graphCallout").transition().duration(400).style("opacity",0).style("pointer-events","none")
  // d3.select("#graphCallout2").transition().duration(400).style("opacity",0).style("pointer-events","none")
}

// the size of the current set
var filteredSet = nodes.length;

// the minimum set size to trigger the graph view callout
var minimumSet = 10;

// on each filter,
// calloutCheck()

function calloutCheck() {
  // find the current size of the filtered set
  filteredSet = graph.length

  if(graphMode == 0){
    if (filteredSet <= minimumSet) {
      graphViewCallout()
    // disable filter sliders
    } else {
      hideGraphViewCallout()
    // enable filter sliders
    }
  }
}

//end graph view callout




//////////////// Filter Functions 3: filter on all variables at once //////////////////////


filterAll = function() {
  
  // first, clear the list
  var listToDeleteMulti = [];
  
  // reset the graph
  graph = [];

  // var currentSlider = sliderPositionsArray[event.target.id]

  store.forEach(function(d){ // for each circle

    // put you on the list if the slider position is above your value:
    
    // for current slider only
    for(var s in sliderPositionsArray){        
      // if the slider position is above your value  &  if you're not already on the list
      if(d[sliderArray[s]] < sliderPositionsArray[s] && !listToDeleteMulti.includes(d[sliderArray[s]])) {
        // put you on the list
        listToDeleteMulti.push(d.id);
      }
    }
      
    // // for each slider
    // for(var s in sliderPositionsArray){        
    //   // if the slider position is above your value  &  if you're not already on the list
    //   if(d[sliderArray[s]] < sliderPositionsArray[s] && !listToDeleteMulti.includes(d[sliderArray[s]])) {
    //     // put you on the list
    //     listToDeleteMulti.push(d.id);
    //   }
    // }

  })
  
  // update the graph based on the filter list
  store.forEach(function(n) {
    // if you're not on the filter list
    if (!listToDeleteMulti.includes(n.id)) {
      // put you on the graph         (start graph empty? or check)
      graph.push(n);
    // if you're on the list
    } else if (listToDeleteMulti.includes(n.id)) {
      // for each graph item
      graph.forEach(function(d, p) { // p = position
        if (n.id === d.id) {
          graph.splice(p, 1); // get you off of there!
        }

      })
    };
  });

  // move all slider handles to new minimums for the filtered set (to avoid wasted motion)
  // todo: separate main and subslider for loops

  // var sliderArray = [
  // "skillsLang", "skillsLogi", "skillsMath", "skillsComp",
  //     // subskills
  //     "s8OralCommunication","s10Reading","s14Writing",
      
  //     "s4JobTaskPlanningandOrganizing","s9ProblemSolving","s15CriticalThinking","s2DecisionMaking",
      
  //     "s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s11SchedulingorBudgetingandAccounting",
        
  //     "s1DataAnalysis","s3FindingInformation","s12DigitalTechnology","s13DocumentUse"
  // ];

  // Update all sliders when dragging any one slider

  // Main sliders
  for(var i=0; i<4; i++) {

    if(event.target.id != i) {
      // find the minimum of each slider on the current graphed set
      var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArrayMain[i]]) })
      // move the slider handle
      handleArray[i].attr("cx", thisMinimum);
      // fill the left side green
      d3.select("#inset-left_"+i).attr("x2", thisMinimum )

    }else if(event.target.id == i) {
      var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArrayMain[i]]) })
      // fill the left side green (using mouse position on current slider)

      d3.select("#inset-left_"+i).attr("x2", function() {
        if (sliderScaleArray[0].invert(d3.event.x) <= 0) { return sliderScaleArray[0](sliderPositionsArray[0]) }
        else { 
          return d3.event.x }
        } )
    }
  };

  // Subskill sliders
  for(var i=4; i<sliderArray.length; i++) {
    if(event.target.id != i) {
      var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArray[i]]) })
      handleArray[i].attr("cx", thisMinimum); // move the slider handle
      // fill the left side green
      d3.select("#inset-left_"+i).attr("x2", thisMinimum )

    }else if(event.target.id == i) {
      var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArray[i]]) })
      // fill the left side green (using mouse position on current slider)
      d3.select("#inset-left_"+i).attr("x2", d3.event.x )
    }
  };

  calloutCheck()


  return graph;
}

// old version

// filterAll = function() {
//   calloutCheck()
//   // h = sliderScaleArray[event.target.id].invert(d3.event.x)
//   // START by filtering out nodes under the minimums
//   store.forEach(function(d) {
//     // INEFFICIENT -- TODO: fewer loops

//       // first, take all nodes off the list              OR loop through sliders removing, then loop through adding?
//       if (listToDeleteMulti.includes(d.id)) listToDeleteMulti.splice(listToDeleteMulti.indexOf(d.id),1);

//       // then loop through the sliders array and put you on the list
//       for(var s=0; s<sliderPositionsArray.length; s++){
//         // if the slider position is above your value, put you on the list
//         var checkMin = sliderPositionsArray[s];
//         if(d[sliderArray[s]] < checkMin && !listToDeleteMulti.includes(d[sliderArray[s]])) {
//           listToDeleteMulti.push(d.id);
//         }

//       }
      
//     })
//     // reset the graph
//   graph = [];
//   // THEN update the graph based on the filter list
//   store.forEach(function(n) {
//     // if you're not on the filter list
//     if (!listToDeleteMulti.includes(n.id)) {
//       // put you on the graph         (start graph empty? or check)
//       graph.push(n);
//     // if you're on the list
//     } else if (listToDeleteMulti.includes(n.id)) {
//       graph.forEach(function(d, p) {
//         if (n.id === d.id) {
//           graph.splice(p, 1); // get you off of there!
//         }
//       })
//     };
//   });
//   return graph;
// }


};// Update function which detects current slider





/////////////////////////// Skillset Explainer Divs /////////////////////////////////

var explainerDivs = [

"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Oral Communication</strong>: Verbally expressing ideas and information to others.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Reading</strong>: Understanding written materials.</p>" +
"<p style='margin-top: 0px; margin-bottom: 0px;'><strong>Writing</strong>: Expressing ideas in writing.</p>",

"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Decision Making</strong>: Making a choice from different options by using information.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Job Task Planning and Organizing</strong>: Planning and organizing one’s own work.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Problem Solving</strong>: Identifying and solving problems.</p>" +
"<p style='margin-top: 0px; margin-bottom: 0px;'><strong>Critical Thinking</strong>: Making judgments by using standards to evaluate ideas and information and the related results.</p>",

"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Measurement and Calculation</strong>: Measuring and calculating amounts, areas, volumes, distances.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Money Math</strong>: Using math skills to deal with money, such as handling cash, preparing bills, and making payments.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Number Estimation</strong>: Quickly guessing answers to arithmetic questions (addition, subtraction, multiplication, and division)</p>" +
"<p style='margin-top: 0px; margin-bottom: 0px;'><strong>Scheduling, Budgeting, Accounting</strong>: Planning for the best use of time and money, and monitoring the use of time and money.</p>",

"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Data Analysis</strong>: Gathering and analyzing numerical data.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Finding Information</strong>: Finding information from a variety of sources to complete a task.</p>" +
"<p style='margin-top: 0px; margin-bottom: 10px;'><strong>Digital Technology</strong>: Using any type of digital technology.</p>" +
"<p style='margin-top: 0px; margin-bottom: 0px;'><strong>Document Use</strong>: Using different types of material (labels, signs, lists, tables, graphs, forms, diagrams, blueprints, and other materials) to gather information.</p>",

]

// positions relative to question mark icons

var offsetDown = 0
var eTops = [document.getElementById("question_0").getBoundingClientRect().top + offsetDown,
			 document.getElementById("question_1").getBoundingClientRect().top + offsetDown, 
			 document.getElementById("question_2").getBoundingClientRect().top - 80, // math
			 document.getElementById("question_3").getBoundingClientRect().top - 80] // comp

var offsetRight = 55
var eLefts = [document.getElementById("question_0").getBoundingClientRect().left + offsetRight,
			  document.getElementById("question_1").getBoundingClientRect().left - 7*offsetRight,
			  document.getElementById("question_2").getBoundingClientRect().left - 7*offsetRight, // math
			  document.getElementById("question_3").getBoundingClientRect().left + offsetRight] // comp

for (var i = 0; i < explainerDivs.length; i++) {
  
  var question = d3.select("#question_"+i)

  question.on("mouseenter", function(){

  	var thisNum = event.target.id.substring(9,10)

    d3.select("body").append("div")
    .style("height","auto").style("width","350px")
    .style("position","fixed")
    .style("z-index","99")
    .style("padding","10px")
    .style("border", "1px solid #49AC52")
    .style("border-radius", "8px")
    .style("font-family","Raleway")
    .style("font-size","18px")
  	.style("background","white")
    .style("line-height", "19px")
  	.style("color","#49AC52")
  	.style("box-shadow","3px 3px 17px grey")
    .style("top",eTops[thisNum]+"px")
    .style("left",eLefts[thisNum]+"px")
    .attr("id","answer_"+thisNum)
    .html(explainerDivs[thisNum])
    .style("opacity",0).transition().duration(200).style("opacity",1)

  })
  question.on("mouseout", function(){
  	var thisNum = event.target.id.substring(9,10)
    d3.select("#answer_"+thisNum).transition().duration(275).style("opacity",0).remove()
  })

}



})
} // end of d3.csv



















      ///////////////////// Search ///////////////////////
var searchExpanded = 0;

          // <!-- search button -->
          // <div class="search-div">
          //   <span class="input-group-btn">
          //     <!-- <input type="text" class="col-4 form-control" placeholder="Search Jobs by Title or Keyword"></input> -->
          //     <button id="searchbuttonPC" class="search-btn">
          //       <img id="searchImg" class="search-img" src="img/search.png" onclick="expandSearch()" alt='help' height='40' width = '40'>
          //     </button>
          //   </span>
          // </div>

d3.select("body").append("div")
  .attr("class", "search-div")
  .style("position","absolute")
  .style("right","9%")
  .append("span")
    .append("button").attr("id","searchButtonPC").attr("class","search-btn")
      .append("img").attr("id","searchImg").attr("class","search-img")
        .attr("src","img/search.png")
        .attr("height","40")
        .attr("width","40")
        // .on("mouseenter", function(){expandSearch()})
        .on("click", function(){expandSearch()})

var searchDiv = d3.select("body")
  .append("div").attr("id","searchDiv")
    .style("width", "0px")
    .style("height", "39px")
    .style("position", "absolute")
    .style("top", "32px")
    .style("right", "102px")
    // .style("background-color", "black")
    // .style("border", "1px solid grey")
    .style("border-radius", "7px")
    .style("opacity", 0)
    // .style("visibility", "visible")
    .html("<input id='jobTitle' placeholder='Search job titles' align='right' class='d-inline form-control' "+
           "style='margin-right: -69px; padding-bottom: 8px; width: 100%; opacity: 1' type='text' "+
           "onkeydown='if (event.keyCode == 13) searchJobTitles()'>"+
          "<button id='searchSubmitBtn' style='opacity: 1; margin-top: -1px;' class='submit-btn btn btn-sm' "+
          "onclick='searchJobTitles()'>Submit</button>"
          )




var searchExpanded = 0;


function expandSearch() {

  if(searchExpanded == 0){
    d3.select("#searchDiv")
      .transition().duration(500).style("width", window.innerWidth/2 - 60 + "px").style("opacity", 1)
    d3.select("#jobTitle").transition().duration(500).style("opacity","1")
    // d3.select("#searchSubmitBtn").style("opacity",0).transition().duration(3500).style("opacity","1")
    searchExpanded = 1;

  } else if(searchExpanded==1){
    d3.select("#searchDiv")
      .transition().duration(500).style("width", 0 + "px").style("opacity", 0)
    d3.select("#jobTitle").transition().duration(500).style("opacity","1")
    searchExpanded = 0;
  }
}

function searchJobTitles() {

  resetFilters();

  //  UPDATE
  circles = circles.data(filterBySearch(), function(d) { return d.id });
  
  // EXIT
  circles.exit().transition().duration(500)
  // exit transition: "pop" radius * 1.5 + 5 & fade out
  .attr("r", function(d) { return d.radius * 0 })
  .attrTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return d.opacity = i(t); };
  })
  .remove();

  // ENTER (create the circles with all attributes)
  enterUpdateCircles();

  // reset simulation if graph mode = off
  if (graphMode == 0) {
    simulation.nodes(filterBySearch())
    .force("collide", forceCollide)
    .force("cluster", forceCluster)
    .force("gravity", forceGravity)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .on("tick", tick);
    simulation.alphaTarget(0.001).restart();
  } else if (graphMode == 1) { // else reposition nodes on graph
    circles
    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
    .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
  }

  // if no search results, display warning message
  if (graph.length == 0) {
    // display warning message
    d3.select("body").append("div").attr("id","warningMsg")
      .style("position","fixed").style("top","40%").style("left","41%")
      .style("width","250px").style("height","115px")
      .style("font-size","24px")
      .attr("class","alert")
      .html("No search results!<br>Resetting...")
    
    // reset and remove message
    setTimeout(function() {
      resetFilters(currentMode)
      d3.select("#warningMsg").transition().duration(500).style("opacity",0).remove()
    }, 1500)

  }

}


function filterBySearch() {
// get the search query
var query = document.getElementById("jobTitle").value;

  // START by filtering out nodes under the minimums
  store.forEach(function(d) {
    // INEFFICIENT -- TODO: fewer loops

      // first, take all nodes off the list              OR loop through sliders removing, then loop through adding?
      if (listToDeleteMulti.includes(d.id)) {
        listToDeleteMulti.splice(listToDeleteMulti.indexOf(d.id),1);
      }

      // then if each job contains the query, add to the list
      //indexOf returns the position of the string in the other string. If not found, it will return -1.
      if(d.allTitles.indexOf(query) == -1 && !listToDeleteMulti.includes(d.id)) {
          listToDeleteMulti.push(d.id);
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












function filterIndustry(input) { //bookmark

  // var industry = industriesArray[input];
  input = +input;

  // update the filtered industries list:

    // if the industry is not on the list
    if(!filteredIndustries.includes(input)) {
      // put it on the list
      filteredIndustries.push(input);
    }
    // if the input is already on the list
    else if(filteredIndustries.includes(input)) {
      // take it off the list
      filteredIndustries.splice(filteredIndustries.indexOf(input),1)
    }


// fade the graph circles
circles.attr("opacity",
  function(d) { // make filtered circles transparent
    // if the industry is on the list, transparent
    if( filteredIndustries.includes(+d.industryNum) ) { 
      return 0.1 }
    else{ 
      return 1 }
  })  

// fade the legend circles
d3.selectAll(".legendCirc").attr("opacity",
  function(d,i) {
    if( filteredIndustries.includes(+i) ) { 
      return 0.1 }
    else{ 
      return 1 }
  })

}


  // var currentSlider = sliderPositionsArray[event.target.id]

//   store.forEach(function(d){ // for each circle

//     // put you on the list if the slider position is above your value:
    
//     // for current slider only
//     for(var s in sliderPositionsArray){        
//       // if the slider position is above your value  &  if you're not already on the list
//       if(d[sliderArray[s]] < sliderPositionsArray[s] && !listToDeleteMulti.includes(d[sliderArray[s]])) {
//         // put you on the list
//         listToDeleteMulti.push(d.id);
//       }
//     }
      
//     // // for each slider
//     // for(var s in sliderPositionsArray){        
//     //   // if the slider position is above your value  &  if you're not already on the list
//     //   if(d[sliderArray[s]] < sliderPositionsArray[s] && !listToDeleteMulti.includes(d[sliderArray[s]])) {
//     //     // put you on the list
//     //     listToDeleteMulti.push(d.id);
//     //   }
//     // }

//   })
  
//   // update the graph based on the filter list
//   store.forEach(function(n) {
//     // if you're not on the filter list
//     if (!listToDeleteMulti.includes(n.id)) {
//       // put you on the graph         (start graph empty? or check)
//       graph.push(n);
//     // if you're on the list
//     } else if (listToDeleteMulti.includes(n.id)) {
//       // for each graph item
//       graph.forEach(function(d, p) { // p = position
//         if (n.id === d.id) {
//           graph.splice(p, 1); // get you off of there!
//         }

//       })
//     };
//   });

//   // move all slider handles to new minimums for the filtered set (to avoid wasted motion)
//   // todo: separate main and subslider for loops

//   // var sliderArray = [
//   // "skillsLang", "skillsLogi", "skillsMath", "skillsComp",
//   //     // subskills
//   //     "s8OralCommunication","s10Reading","s14Writing",
      
//   //     "s4JobTaskPlanningandOrganizing","s9ProblemSolving","s15CriticalThinking","s2DecisionMaking",
      
//   //     "s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s11SchedulingorBudgetingandAccounting",
        
//   //     "s1DataAnalysis","s3FindingInformation","s12DigitalTechnology","s13DocumentUse"
//   // ];

//   // Update all sliders when dragging any one slider

//   // Main sliders
//   for(var i=0; i<4; i++) {

//     if(event.target.id != i) {
//       // find the minimum of each slider on the current graphed set
//       var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArrayMain[i]]) })
//       // move the slider handle
//       handleArray[i].attr("cx", thisMinimum);
//       // fill the left side green
//       d3.select("#inset-left_"+i).attr("x2", thisMinimum )

//     }else if(event.target.id == i) {
//       var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArrayMain[i]]) })
//       // fill the left side green (using mouse position on current slider)

//       d3.select("#inset-left_"+i).attr("x2", function() {
//         if (sliderScaleArray[0].invert(d3.event.x) <= 0) { return sliderScaleArray[0](sliderPositionsArray[0]) }
//         else { 
//           return d3.event.x }
//         } )
//     }
//   };

//   // Subskill sliders
//   for(var i=4; i<sliderArray.length; i++) {
//     if(event.target.id != i) {
//       var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArray[i]]) })
//       handleArray[i].attr("cx", thisMinimum); // move the slider handle
//       // fill the left side green
//       d3.select("#inset-left_"+i).attr("x2", thisMinimum )

//     }else if(event.target.id == i) {
//       var thisMinimum = d3.min(graph, function(d){ return sliderScaleArray[i](d[sliderArray[i]]) })
//       // fill the left side green (using mouse position on current slider)
//       d3.select("#inset-left_"+i).attr("x2", d3.event.x )
//     }
//   };

//   calloutCheck()


//   return graph;






//   // reset the list to delete
//   listToDeleteMulti = [];

//   // START by filtering out nodes under the minimums
//   store.forEach(function(d) {

//       // then if each job contains the query, add to the list
//       //indexOf returns the position of the string in the other string. If not found, it will return -1.
//       if(d.allTitles.indexOf(query) == -1 && !listToDeleteMulti.includes(d.id)) {
//           listToDeleteMulti.push(d.id);
//       }
//     });
//     // reset the graph
//   graph = [];
//   // THEN update the graph based on the filter list
//   store.forEach(function(n) {
//     // if you're not on the filter list
//     if (!listToDeleteMulti.includes(n.id)) {
//       // put you on the graph         (start graph empty? or check)
//       graph.push(n);
//     // if you're on the list
//     } else if (listToDeleteMulti.includes(n.id)) {
//       graph.forEach(function(d, p) {
//         if (n.id === d.id) {
//           graph.splice(p, 1); // get you off of there!
//         }
//       })
//     };
//   });
//   return graph;
// }




// subskill slider expansion

/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////

// (1: Language 2: Logic 3: Math 4: Computer)

// create 4 empty subslider divs 
var subSliderDivLang;
var subSliderDivLogi;
var subSliderDivMath;
var subSliderDivComp;

  // Lang
  subSliderDivLang = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_0")
      .style("width", "250px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.20+"px")
      .style("left", window.innerWidth*0.025+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")
      .style("background", "white")

  // Logi
  subSliderDivLogi = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_1")
      .style("width", "265px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.20+"px")
      .style("right", window.innerWidth*0.025+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")
      .style("background", "white")

  // Comp
  subSliderDivComp = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_2")
      .style("width", "250px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.85+"px")
      .style("left", window.innerWidth*0.025+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")
      .style("background", "white")

  // Math
  subSliderDivMath = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_3")
      .style("width", "275px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.85+"px")
      .style("right", window.innerWidth*0.020+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")
      .style("background", "white")

// div heights
var heightLang = window.innerHeight*0.24,
    heightLogi = window.innerHeight*0.32,
    heightComp = window.innerHeight*0.29,
    heightMath = window.innerHeight*0.29;

var widthAll = 300;

var slidersExpanded = [0,0,0,0];

function expandSliders(sliderGroup) { // (1: Language 2: Logic 3: Math 4: Computer)
  // toggle
  slidersExpanded[sliderGroup] = 1-slidersExpanded[sliderGroup];

  switch (sliderGroup) {

    case 0: // showLanguage

      if(slidersExpanded[0] == 1){ // on
        
        //if any others are on, turn them off
        if(slidersExpanded[1] == 1){
          slidersExpanded[1] = 0;
          hideLogi() 
          // if there is already a legend, unhide the legend
          // unhideLegend()
        }
        if(slidersExpanded[2] == 1){ 
          slidersExpanded[2] = 0;
          hideMath() 
          // if there is already a legend, unhide the legend
          // unhideLegend()
        }
        if(slidersExpanded[3] == 1){ 
          slidersExpanded[3] = 0;
          hideComp() }

        // expand subsliders button and turn off
        d3.select("#btnSubsliders_0")
          .transition().duration(350).style("height", heightLang+20+"px").style("width",widthAll*0.95+"px")
          .style("pointer-events","none")
          .attr("class","expand-sliders-btn-expanded")
        // append "hide skills" button
        d3.select("#btnSubsliders_0").append("button")
          .attr("id","btnSubsliders_0Close").attr("class","close-sliders-btn").style("border-width","0px").style("background","none").style("pointer-events","none")
            // .style("border-top-right-radius","0px")
            // .style("border-top-left-radius","0px")
          .style("width",widthAll*0.93+"px")
          .style("margin-left",-widthAll*0.017+"px")
          .html(
            "&#9650 hide language skills &#9650"
            ).style("color", "#49AC52")
        // move "hide skills" button down
        d3.select("#btnSubsliders_0Close")
          .style("margin-top",0+"px").transition().duration(350)
          .style("margin-top",heightLang-6+"px")

        d3.select("#spanSubsliders_0")
          .transition().duration(350).style("opacity", 0)

        setTimeout(function() {
          for(var i=4; i<7; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 250);
      }
      if(slidersExpanded[0] == 0){ // off
        hideLang()
      }
      
    case 1: // showLogic

      if(slidersExpanded[1] == 1){ // on

        // if there is already a legend, hide the legend
        // hideLegend()
        //if any others are on, turn them off
        if(slidersExpanded[0] == 1){
          slidersExpanded[0] = 0;
          hideLang() }
        if(slidersExpanded[2] == 1){ 
          slidersExpanded[2] = 0;
          hideMath() // but keep legend hidden
        }
        if(slidersExpanded[3] == 1){ 
          slidersExpanded[3] = 0;
          hideComp() }

                  // expand subsliders button and turn off
        d3.select("#btnSubsliders_1")
          .transition().duration(350).style("height", heightLogi+20+"px").style("width", widthAll*0.95+"px")
          .style("pointer-events","none")
          .attr("class","expand-sliders-btn-expanded")

                  // append "hide skills" button
                  d3.select("#btnSubsliders_1").append("button")
                    .attr("id","btnSubsliders_1Close").attr("class","close-sliders-btn").style("border-width","0px").style("background","none").style("pointer-events","none")
                      // .style("border-top-right-radius","0px")
                      // .style("border-top-left-radius","0px")
                    .style("width",widthAll*0.93+"px")
                    .style("margin-left",-widthAll*0.017+"px")
                    .html(
                      "&#9650 hide logic skills &#9650"
                      ).style("color", "#49AC52")
                  // move "hide skills" button down
                  d3.select("#btnSubsliders_1Close")
                    .style("margin-top",0+"px").transition().duration(350)
                    .style("margin-top",heightLogi-6+"px")

        d3.select("#spanSubsliders_1")
          .transition().duration(350).style("opacity", 0)

        setTimeout(function() {
          for(var i=7; i<11; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 250);
      }

      else if(slidersExpanded[1] == 0){ // off
        hideLogi()
        // if there is already a legend, unhide the legend
        // unhideLegend()
      }
      
    case 2: // showMath

      if(slidersExpanded[2] == 1){ // on

        // if there is already a legend, hide the legend
        // hideLegend()

        //if any others are on, turn them off
        if(slidersExpanded[0] == 1){
          slidersExpanded[0] = 0;
          hideLang() }
        if(slidersExpanded[1] == 1){ 
          slidersExpanded[1] = 0;
          hideLogi() // but keep legend hidden
        }
        if(slidersExpanded[3] == 1){ 
          slidersExpanded[3] = 0;
          hideComp() }


                  // expand subsliders button and turn off
        d3.select("#btnSubsliders_2")
          .transition().duration(350).style("height", heightMath+50+"px").style("width", widthAll*0.97+"px")
          .style("pointer-events","none")
          .attr("class","expand-sliders-btn-expanded")

                  // append "hide skills" button
                  d3.select("#btnSubsliders_2").append("button")
                    .attr("id","btnSubsliders_2Close").attr("class","close-sliders-btn").style("border-width","0px").style("background","none")
                    .style("pointer-events","none")
                      // .style("border-bottom-right-radius","0px")
                      // .style("border-bottom-left-radius","0px")
                    .style("width",widthAll*0.93+"px")
                    .style("margin-left",-widthAll*0.017+"px")
                    .html(
                      "&#9660 hide math skills &#9660"
                      ).style("color", "#49AC52")
                    // .on("click",function(){hideMath()})
                  // move "hide skills" button down
                  d3.select("#btnSubsliders_2Close")
                    .style("margin-top",0+"px").transition().duration(350)
                    .style("margin-top",heightMath+20+"px")
                  
        d3.select("#spanSubsliders_2")
          .transition().duration(350).style("opacity", 0)

        setTimeout(function() {
          for(var i=11; i<15; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 250);
      }

      else if(slidersExpanded[2] == 0){ // off
        hideMath()
        // if there is already a legend, unhide the legend
        // unhideLegend()
      }
      
    case 3: // showComputers

      if(slidersExpanded[3] == 1){ // on

        //if any others are on, turn them off
        if(slidersExpanded[0] == 1){
          slidersExpanded[0] = 0;
          hideLang() }
        if(slidersExpanded[2] == 1){ 
          slidersExpanded[2] = 0;
          hideMath() 
          // if there is already a legend, unhide the legend
          // unhideLegend()
        }
        if(slidersExpanded[1] == 1){ 
          slidersExpanded[1] = 0;
          hideLogi() 
          // if there is already a legend, unhide the legend
          // unhideLegend()
        }
                  // expand subsliders button and turn off
        d3.select("#btnSubsliders_3")
          .transition().duration(350).style("height", heightComp+50+"px").style("width", widthAll*0.95+"px")
          .style("pointer-events","none")
          .attr("class","expand-sliders-btn-expanded")
                  // append "hide skills" button
                  d3.select("#btnSubsliders_3").append("button")
                    .attr("id","btnSubsliders_3Close").attr("class","close-sliders-btn").style("border-width","0px").style("background","none")
                    .style("pointer-events","none")
                      // .style("border-bottom-right-radius","0px")
                      // .style("border-bottom-left-radius","0px")
                    .style("width",widthAll*0.93+"px")
                    .style("margin-left",-widthAll*0.017+"px")
                    .html(
                      "&#9660 hide computer skills &#9660"
                      ).style("color", "#49AC52")
                    // .on("click",function(){hideComp()})
                  // move "hide skills" button down
                  d3.select("#btnSubsliders_3Close")
                    .style("margin-top",0+"px").transition().duration(350)
                    .style("margin-top",heightComp+20+"px")
                  


        d3.select("#btnSubsliders_3")
          .transition().duration(350).style("height", heightComp+50+"px").style("width",widthAll*0.95+"px")
        d3.select("#spanSubsliders_3")
          .transition().duration(350).style("opacity", 0)

        setTimeout(function() {
          for(var i=15; i<19; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 250);
      }
      if(slidersExpanded[3] == 0){ // off
        hideComp()
      }
      
  }
}




function hideLang() {

  d3.select("#btnSubsliders_0").transition().duration(500).style("height", "30px").style("width", 250+"px")
  .style("pointer-events","auto")
  .attr("class","expand-sliders-btn")

  d3.select("#spanSubsliders_0").transition().duration(350).style("opacity", 1)
  d3.select("#btnSubsliders_0Close").transition().duration(500).style("opacity",0).style("margin-top",0+"px").remove()
    // .style("top", window.innerHeight*0.20+"px");

  // setTimeout(function() {
  //     subSliderDivLang.style("visibility", "hidden");
  //   }, 500);

  for(var i=4; i<7; i++){
    sliderSVGArray[i].style("display", "none");
    handleArray[i].style("display", "none");
    sliderMulti[i].style("display", "none");
    d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "hidden");
    // d3.select("#notmuchlots_"+i+4).style("visibility", "hidden");
    d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "hidden");
  }
}

function hideLogi() {

  d3.select("#btnSubsliders_1").transition().duration(500).style("height", "30px").style("width","250px")
  .style("pointer-events","auto")
  .attr("class","expand-sliders-btn")

  d3.select("#spanSubsliders_1").transition().duration(350).style("opacity", 1)
  d3.select("#btnSubsliders_1Close").transition().duration(500).style("opacity",0).style("margin-top",0+"px").remove()


  setTimeout(function() {
      subSliderDivLogi.style("visibility", "hidden");
    }, 500);

  for(var i=7; i<11; i++){
    sliderSVGArray[i].style("display", "none");
    handleArray[i].style("display", "none");
    sliderMulti[i].style("display", "none");
    d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "hidden");
    // d3.select("#notmuchlots_"+i+4).style("visibility", "hidden");
    d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "hidden");
  }
}

function hideMath() {

  d3.select("#btnSubsliders_2").transition().duration(500).style("height", "30px").style("width", 250+"px")
  .style("pointer-events","auto")
  .attr("class","expand-sliders-btn")

  d3.select("#spanSubsliders_2").transition().duration(350).style("opacity", 1)
  d3.select("#btnSubsliders_2Close").transition().duration(500).style("opacity",0).style("margin-top",0+"px").remove()

  setTimeout(function() {
      subSliderDivMath.style("visibility", "hidden");
    }, 500);

  for(var i=11; i<15; i++){
    sliderSVGArray[i].style("display", "none");
    handleArray[i].style("display", "none");
    sliderMulti[i].style("display", "none");
    d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "hidden");
    // d3.select("#notmuchlots_"+i+4).style("visibility", "hidden");
    d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "hidden");
  }
}

function hideComp() {

  d3.select("#btnSubsliders_3").transition().duration(500).style("height", "30px").style("width","250px")
  .style("pointer-events","auto")
  .attr("class","expand-sliders-btn")

  d3.select("#spanSubsliders_3").transition().duration(350).style("opacity", 1)
  d3.select("#btnSubsliders_3Close").transition().duration(500).style("opacity",0).style("margin-top",0+"px").remove()

  setTimeout(function() {
      subSliderDivComp.style("visibility", "hidden");
    }, 500);

  for(var i=15; i<19; i++){
    sliderSVGArray[i].style("display", "none");
    handleArray[i].style("display", "none");
    sliderMulti[i].style("display", "none");
    d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "hidden");
    // d3.select("#notmuchlots_"+i+4).style("visibility", "hidden");
    d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "hidden");
  }
}

function hideAll() {
  hideLang()
  hideLogi()
  hideMath()
  hideComp()
}










