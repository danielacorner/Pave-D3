var circles, drag_handler, enterUpdateCircles, graphMode, futureMode, simulation, listToDeleteMulti,
forceCollide, forceXCombine, forceYCombine, forceGravity, forceXSeparate, forceYSeparate, 
forceXSeparateRandom, forceYSeparateRandom, forceCluster, tick, legend, graphYtranslate, currentMode, resetFilters;

var legendCreated = 0;

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
d3.csv("NOC_403.csv", function(error, datapoints) {
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
var width = window.innerWidth/1.5, // set chart dimensions
    height = window.innerHeight/1.5,
    maxRadius = 30; // Max circle radius


///////////////// TODO: Mobile version /////////////////
// ontouch instead of onclick
// stack filters below break poin

resize();
d3.select(window).on("resize", resize);
// resize the window
function resize() {
  width = window.innerWidth/1.5, // set chart dimensions
  height = window.innerHeight/1.5;

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
// //   // width = d3.select("#chart").attr("width"), // set chart dimensions
// //   // height = d3.select("#chart").attr("height");

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
  r = radiusScale(el.workers),
  d = {
    id: +el.id,
    favourite: 0,
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
var maxWorkers = d3.max(nodes, function(d){ return d.workers});


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
.strength(function(d) { return -7 * d.radius })
// var forceFutureMode = d3.forceManyBody()
// .strength(function(d) { return -7 * automationRadiusScale(d.automationRisk) })
// var forceCollideFutureMode = d3.forceCollide(function(d) { return automationRadiusScale(d.radius) + 25 })
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
function forceCluster(alpha) {
  for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.1; i < n; ++i) {
    node = nodes[i];
    cluster = clusters[node.cluster];
    node.vx -= (3*node.x - cluster.x) * k;
    node.vy -= (3*node.y - cluster.y) * k;
  }
  }
    // Update the positions each tick
tick = function() {
  circles
  .attr("cx", function(d) { return d.x; })
  .attr("cy", function(d) { return d.y; });
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
// .style("z-index", 99)
// .style("position", "absolute")
// .style("opacity", 0);

// var div2 = d3.select("body").append("div")
// .style("opacity", 0)
// .attr("transform", "translate(0," + 200 + ")");

// Append a group element to the svg & move to center
var svg = d3.select("#chart")
.append('svg').style("position","absolute").style("z-index", "-1")   
.attr("viewBox", "-"+0+" -"+65+" "+window.innerWidth/1.5+" "+window.innerHeight/1.5+"");

// .attr('transform', 'translate('+width/2+','+height/2+')');


var stretch_y = 1.7;
var compress_y = 0.7;
var skillsBarsXtranslate = -15;
var skillsBarsYtranslate = 80;
// TODO: merge pre, post-filtering
///////////////////////// Circles, Tooltips (pre-filtering) /////////////////////////////
// Add the circles with tooltips
circles = svg.selectAll("circle")
.data(nodes)
.enter().append("circle")
    .attr("r", 0) // start at 0 radius and transition in
    .attr("transform", "translate("+window.innerWidth/3+","+window.innerHeight/5+")") //flag! need to make equation for width/height ratio
    .attr("id",function(d) { return "circle_"+d.id })
    .style("z-index", -1)
    .style("fill", function(d) { return color(d.cluster); })
    // Tooltips
    .on("mouseenter", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.selectAll("circle").attr("stroke", "none");
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      showToolTip(0);
      tooltipMouseover(d);
      hoverTimeout = setTimeout(function(){
        tooltipLarge(d)
        clicked = 1
      }, 1750)
      })
    .on("mouseout", function(d) {
      clearTimeout(hoverTimeout)
      if (clicked == 1) return;
      clicked = 0;
      hideToolTip(500)
      d3.select(this).attr("stroke", "none");
      // div.transition().duration(500).style("opacity", 0)

      // div
      // .style("opacity", 0);
      // setTimeout(function(){
      // //   if(typeof div2 != "undefined") div2.remove();
      //   if(typeof div != "undefined") div.remove();
      // },250)
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
  hideAll()
  // if clicked off of a circle
  if (clicked == 1) { 
    if (d3.event.target.nodeName == "circle") {
      return
    } else if (d3.event.target.nodeName == "svg") { clicked = 0
    hideToolTip(500) }
  }
})



function showToolTip(duration) {
      // d3.select("#tooltip").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip0").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip1").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip2").transition().duration(duration).style("opacity",1)
      d3.select("#tooltip3").transition().duration(duration).style("opacity",1)
      d3.select("#tooltipBottomDiv").transition().duration(duration).style("opacity",1)
      d3.select("#tooltipBottomDiv2").transition().duration(duration).style("opacity",1)

}

function hideToolTip(duration) {
      // fade out each tooltip contents object
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

      var divLeft;
      var divTop = window.innerHeight*0.3 + ((window.innerHeight-300)*(d.y/window.innerHeight));
      
      if(graphMode == 0) {
        if(d3.event.pageX < window.innerWidth/2) { // left side
          divLeft = window.innerWidth*0.5 + (d.x) + 5;
        } else if (d3.event.pageX >= window.innerWidth/2) { // right side
          divLeft = window.innerWidth*0.5 + (d.x) - 355;
          divTop = window.innerHeight*0.3 + ((window.innerHeight-300)*(d.y/window.innerHeight));
        }
      }else if(graphMode == 1) {
        divLeft = d.cx + window.innerWidth/2;
        divTop = d.cy + window.innerHeight*0.4;
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
        "JobBank Info Page</a><br>"+

        "<a id='btnVolunteer' class='btn btn-sm' "+
        "style='margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        "' target='_blank' href='"+"https://youth.volunteer.ca/"+"'>"+
        "Volunteer Canada</a><br>"+

        "<br><br><span style='margin-left: -20px; color: white;'>"+
        "View listings for this job:</span>"+

        "<div align='right' style='margin: 10px 0px 20px 0px'>"+
        "<a id='btnIndeed' class='btn btn-sm' "+
        "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        "' target='_blank' href='"+"https://www.indeed.ca/jobs?q="+d.job+"'>"+
        "&nbspIndeed.ca&nbsp</a><br>"+

        "<a id='btnGlassdoor' class='btn btn-sm' "+
        "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        "' target='_blank' href='"+"https://www.glassdoor.ca/Job/"+d.job.split(' ').join('-')+"-jobs-SRCH_KO0,19.htm'>"+
        "&nbspGlassdoor.ca&nbsp</a><br>"+

        "<a id='btnMonster' class='btn btn-sm' "+
        "style='border-radius: 4px; margin-bottom: 10px; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +
        "' target='_blank' href='"+"https://www.monster.ca/jobs/search/?q="+d.job.split(' ').join('-')+"'>"+
        "&nbspMonster.ca&nbsp</a><br>"+

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

drag_handler = d3.drag()
.on("start", dragstarted)
.on("drag", dragged)
.on("end", dragended);

drag_handler(circles);



///////////////////////////////// Buttons ////////////////////////////////////

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

d3.select("#btnLegend").on("mouseenter", function() {

  // shrink Size Legend button 
  d3.select("#btnSizes").transition().duration(250).style("opacity",0).style("height","0px").style("width","0px").style("border-width","1px")

  // expand colour legend
  d3.select("#btnLegend").transition().duration(375)
  .style("width", "325px")
  .style("height", "425px").style("border-width","0px")
  // .text("")

  svgLegend = d3.select("#btnLegend")
      .html("")
      .append("svg").attr("id","svgLegend")
        .attr("width","325px")
        .attr("height","425px")
        .style("margin-top","5px")
        // .style("background","#eaeaea")
    
  legendCircles = svgLegend.selectAll("circle").data(industriesArray).enter().append("circle")
      .attr("r", 0) // start at 0 radius and transition in
      .transition().duration(450).attr("r", 10)
      .attr("transform", function(d,i) { return "translate("+"14"+","+(45+i*37)+")" } ) //flag! need to make equation for width/height ratio
      .style("fill", function(d,i) { return color(i); })

  legendTexts = d3.select("#svgLegend").selectAll("text").data(industriesArray).enter().append("text")
      .attr("text-anchor","left")
      .attr("transform", function(d,i) { return "translate("+"38"+","+(50+i*37)+")" } ) //flag! need to make equation for width/height ratio
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

})

d3.select("#btnLegend").on("mouseleave", function() {

  // reset Size Legend button
  d3.select("#btnSizes").transition().duration(300).style("opacity",1).style("height","70px").style("width","100px").style("border-width","1px")

  d3.select("#btnLegend").transition().duration(300).style("border-width","1px")
  .style("width", "100px")
  .style("height", "70px")

  svgLegend.selectAll("circle").transition().duration(400).attr("r", 0)

  d3.select("#svgLegend").selectAll("text").transition().duration(300).style("opacity",0).remove()
  // legendTexts.selectAll("text").style("opacity",0).remove()

  setTimeout(function() {
    d3.select("#btnLegend")
    .html("Colour<br>Legend")
    }, 400);

})




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

setSizes("workers")

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
    break;
  }

}

var currentSize = "Number of Jobs"
var btnSizesDims = ["275px","300px"] // width, height

mouseEnterOn()

function mouseEnterOn() {

  d3.select("#btnSizes").on("mouseenter", function() {
    mouseEnterFn()
  })
}

function mouseEnterFn() {

    // shrink Colour Legend button and Sizes dropdown
    d3.select("#btnLegend").transition().duration(300).style("opacity",0).style("height","0px").style("width","0px")

    d3.select("#btnSizes").transition().duration(300).style("border-width","0px")
    .style("width", btnSizesDims[0])
    .style("height", btnSizesDims[1])
    // .text("")

    svgLegend = d3.select("#btnSizes")
      .html("")
      .append("svg").attr("id","svgLegend")
        .attr("width",btnSizesDims[0])
        .attr("height",btnSizesDims[1])
        .style("margin-top","5px")
        // .style("background","#eaeaea")
      
    sizeCircles = svgLegend.selectAll("circle").data(sizesArray).enter().append("circle")
        .attr("r", 0) // start at 0 radius and transition in
        .transition().duration(400).attr("r",  function(d,i) { return sizesArray[i] })
        .attr("transform", function(d,i) { return "translate("+"25"+","+(45 + i*5 + Math.pow(sizesArray[i], 1.6))+")" } ) 
        .style("fill", "#B5ADAD")

    legendTexts = d3.select("#svgLegend").selectAll("text").data(sizesValuesArray).enter().append("text")
        .attr("text-anchor","left")
        .attr("transform", function(d,i) { return "translate("+"55"+","+(49 + i*5 + Math.pow(sizesArray[i], 1.6))+")" } ) 
        .text(function(d) { return d })
        .style("opacity",0).transition().duration(600).style("opacity",1)
    
    legendTitle = d3.select("#svgLegend").append("text")
      .attr("transform","translate(54,17)")

      .text(currentSize) // must change this when size dropdown activated
      .style("font-size","22px").style("fill","#49AC52")

    sizesDropdown = d3.select("#btnSizes").append("div").attr("id","sizeDropdownDiv")
        .attr("class","dropup")
        .style("position","absolute")
        .style("right","3%")
        .style("bottom","12%")
        .append("button")
          .attr("id","sizeDropdownButton")
          .attr("class","btn btn-grey btn-primary dropdown-toggle")
          .attr("type","button")
          .attr("data-toggle","dropdown")
          .style("height","50px")
          .style("border-width","0px")
          .html("Size by<br>"+currentSize+"<span class='caret'></span>")
          .append("ul").attr("class","dropdown-menu").style("padding-left", "5px")
          .html("<li><a id='workLink' href='#'>Number of Jobs</a></li>" +
                "<li><a id='wageLink' href='#'>Wage ($ per hr)</a></li>" +
                "<li><a id='yearLink' href='#'>Years of study</a></li>" +
                "<li><a id='equaLink' href='#'>Equal sizes</a></li>")

    d3.select("#workLink").on("click", function() {

      circles.transition().duration(100)
        .delay(function(d, i) { return i * 1})
        .attrTween("r", function(d) {
          var i = d3.interpolate(d.radius, radiusScale(d.workers));
          return function(t) { return d.radius = i(t); };
        });

      if(graphMode == 0 && futureMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);

        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0).restart(); }, 200);
      }

      currentSize = "Number of Jobs"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      mouseEnterOff() // turn off until mouseleave
      setSizes("workers")
      mouseEnterFn()
      // mouseLeaveFn()
    })

    d3.select("#wageLink").on("click", function() {

      circles.transition().duration(100)
      .delay(function(d, i) { return i * 1})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, wageRadiusScale(d.wage)/1.2);
        return function(t) { return d.radius = i(t); };
      });

      if(graphMode == 0 && futureMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);
        
        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0).restart(); }, 200);
      }

      currentSize = "Wage"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      mouseEnterOff()
      setSizes("wage")
      mouseEnterFn()
      // mouseLeaveFn()
    })

    d3.select("#yearLink").on("click", function() {

      circles.transition().duration(100)
      .delay(function(d, i) { return i * 1})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, yearRadiusScale(d.yearsStudy));
        return function(t) { return d.radius = i(t); };
      });
      if(graphMode == 0 && futureMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);

        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0).restart(); }, 200);
      }

      currentSize = "Years of Study"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      mouseEnterOff()
      setSizes("yearsStudy")
      mouseEnterFn()
      // mouseLeaveFn()
    })

    d3.select("#equaLink").on("click", function() {
    
      circles.transition().duration(100)
      .delay(function(d, i) { return i * 1})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, 10);
        return function(t) { return d.radius = i(t); };
      });
      if(graphMode == 0 && futureMode == 0) {
        setTimeout(function() { resetSimulation() }, 600);
        setTimeout(function() { resetSimulation() }, 700);

        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0).restart(); }, 200);
      }

      currentSize = "nothing"
      document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      mouseEnterOff()
      setSizes("none")
      mouseEnterFn()
      // mouseLeaveFn()
    })

    // fade in dropdown
    d3.select("#sizeDropdownDiv").style("opacity",0).transition().duration(700).style("opacity",1)
}


function mouseEnterOff() {
  d3.select("#btnSizes").on("mouseenter", "")
}

mouseLeaveOn();

function mouseLeaveOn() {
  d3.select("#btnSizes").on("mouseleave", function() {
    mouseEnterOn()
    mouseLeaveFn()
  })
}

function mouseLeaveFn() {
    // reset Colour Legend button and Sizes dropdown
    d3.select("#btnLegend").transition().duration(400).style("opacity",1).style("height","70px").style("width","100px").style("border-width","1px")
    d3.select("#sizeDropdownDiv").style("opacity",1).transition().duration(200).style("opacity",0).remove()

    d3.select("#btnSizes").transition().duration(500)
    .style("width", "100px")
    .style("height", "70px").style("border-width","1px")

    svgLegend.selectAll("circle").transition().duration(400).attr("r", 0)

    d3.select("#svgLegend").selectAll("text").transition().duration(300).style("opacity",0).remove()
    // legendTexts.selectAll("text").style("opacity",0).remove()

    setTimeout(function() {
      d3.select("#btnSizes")
      .html("Size<br>Legend")
      }, 400);
    mouseEnterOn()
}

function mouseLeaveOff() {
    d3.select("#btnSizes").on("mouseleave", "")
}



//////////// Industry Split ////////////////

d3.select("#split").on('click', function() {
  if (graphMode == 1 || futureMode == 1) return;
  simulation
  .force("x", forceXSeparate).alpha(0.4)
  .force("y", forceYSeparate).alpha(0.4)
    .alphaTarget(0) // after click, cool down to minimal temperature
    .restart()

  // d3.select("#split").style("display","none");
  // d3.select("#shuffle").style("display","none");

  // d3.select("#combine").style("display", "inline");

  // legend.transition().duration(500).style("opacity", 0).remove();
  })

d3.select("#shuffle").on('click', function() {
  // legend.transition().duration(500).style("opacity", 0).remove();
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

function smashTogether(force, temp) {
  simulation
  .force("x", d3.forceX().strength(force)).alpha(temp)
  .force("y", d3.forceY().strength(force)).alpha(temp)
  .alphaTarget(0.1)
  .restart()
}

d3.select("#combine").on('click', function(d) {

  if (graphMode == 0 && futureMode == 0) {
    smashTogether(0.3, 0.4);
  }
})

// TODO: maxWorkers, maxWage, skillsMath not working
var minWorkers = d3.min(nodes, function(d) {return d.workers}),
minWage = d3.min(nodes, function(d) {return d.wage});

var maxWage = 116.18; //busted

maxYearsStudy = d3.max(nodes, function(d) {return d.yearsStudy}); // 5







////////////////// pause! (Pause) ////////////////////////
d3.select("#pause").on('click', function(d) {
  simulation.stop();

  d3.select("#pause").style("display", "none");
  d3.select("#unpause").style("display", "inline");

});
////////////////// unpause! (unPause) ////////////////////////
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
d3.select("#graph").on('mouseenter', function(d) {

  // append a large div, transition its height and width
  d3.select("#graph").select(function(){return this.parentNode})
  .append("div").style("width","10px").style("height","0px")
    .attr("id","graphExplainer").style("opacity",0)
    .style("position","absolute").style("top","40px").style("left","0px")
 
  //move button down and keep other button up
  d3.select("#futureView").transition().duration(250).style("margin-bottom","20px")
  d3.select("#graph").transition().duration(250).style("padding-bottom","40px").style("margin-bottom","0px")
  
  // explainer transition
  d3.select("#graphExplainer").transition().duration(250)
    .style("width","30vw")
    .style("height","auto")
    .style("background","#A6B0A8")
    .style("opacity",1)
    .style("border-bottom-left-radius","6px")
    .style("border-bottom-right-radius","6px")

  d3.select("#graphExplainer").append("div").attr("id","graphExplanation").style("color","white").style("padding","25px 18px")
    .html("Not all jobs are equal! This view shows how jobs differ in terms of <em>wage, years of study,</em> and <em> number of jobs.</em>")

})

d3.select("#graph").on('mouseleave', function(d) {

    d3.select("#futureExplanation").transition().duration(200).style("opacity",0).remove();
    //move button up and keep other button down
    d3.select("#futureView").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
    // fade out
    d3.select("#futureExplainer").transition().duration(200).style("opacity",0).remove();
    d3.select("#futureExplanation").transition().duration(200).style("opacity",0).remove();
  //move button up and keep other button down
  // d3.select("#futureView").transition().duration(250).style("margin-bottom","0px")
  d3.select("#graph").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
  
  // fade out
  // d3.select("#graph").transition().duration(250).style("height","32px")
  d3.select("#graphExplainer").transition().duration(200).style("opacity",0).remove();
  d3.select("#graphExplanation").transition().duration(200).style("opacity",0).remove();

})


d3.select("#futureView").on('mouseenter', function(d) {
  //move button up and keep other button down
  // d3.select("#futureView").transition().duration(250).style("margin-bottom","0px")
  d3.select("#graph").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
  
  // fade out
  // d3.select("#graph").transition().duration(250).style("height","32px")
  d3.select("#graphExplainer").transition().duration(200).style("opacity",0).remove();
  d3.select("#graphExplanation").transition().duration(200).style("opacity",0).remove();

  // append and transition the explainer div
  d3.select("#futureView").select(function(){return this.parentNode})
  .append("div").style("width","10px").style("height","0px")
    .attr("id","futureExplainer").style("opacity",0)
    .style("position","absolute").style("top","40px").style("right","0px")

  //move button down and keep other button up
  d3.select("#graph").transition().duration(250).style("margin-bottom","20px")
  d3.select("#futureView").transition().duration(250).style("padding-bottom","40px").style("margin-bottom","0px")
  
  // explainer transition
  d3.select("#futureExplainer").transition().duration(250)
    .style("width","30vw")
    .style("height","auto")
    .style("background","#A6B0A8")
    .style("opacity",1)
    .style("border-bottom-left-radius","6px")
    .style("border-bottom-right-radius","6px")

  d3.select("#futureExplainer").append("div").attr("id","futureExplanation").style("color","white").style("padding","25px 18px")
    .html("Machines are getting better at performing new tasks every day. <em>Automation Risk</em> tells us how likely a job will soon become unavailable.")

})

d3.select("#futureView").on('mouseleave', function(d) {

    //move button up and keep other button down
    d3.select("#futureView").transition().duration(250).style("padding-bottom","3px").style("margin-bottom","20px")
    // fade out
    d3.select("#futureExplainer").transition().duration(200).style("opacity",0).remove();

})

d3.select("#graph").on('click', function(d){
  // Toggle mode on or off
  graphMode = 1-graphMode;
  //cool to 0 degrees
  simulation.alpha(0);

  ////////////// GRAPH MODE ON! ////////////////
  if (graphMode == 1) {
    if (futureMode == 1) {
      // transition smoothly from future mode
      currentMode = 4;
      graphModeOn(4);
      createFutureLegend();
    } else if (futureMode == 0) {
      currentMode = 0;
      graphModeOn(0);
    }
  }
  //////////////// Graph mode OFF. ///////////////////
  if (graphMode == 0) {

    graphModeOff();
  }; // transition back to clusters
  
})

function moveBottomDown() {
  // Move top up
  d3.select("#topButtons").transition().duration(500).style("top", "10vh");
  d3.select("#sliderDiv_skillsLang").transition().duration(500).style("top", "7vh");
  d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("top", "7vh");
  
  d3.select("#bottomButtons").transition().duration(500).style("bottom", "4vh");
  d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "3vh");
  d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "3vh");
}
function moveBottomUp() {
  // Move top up
  d3.select("#topButtons").transition().duration(500).style("top", "12vh");
  d3.select("#sliderDiv_skillsLang").transition().duration(500).style("top", "9vh");
  d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("top", "9vh");

  d3.select("#bottomButtons").transition().duration(500).style("bottom", "10vh");
  d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "9vh");
  d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "9vh");
}

/////////////////////////////// Suggested Views buttons /////////////////////////

d3.select("#a0").on('click', function() { // Automation vs Number of Jobs
  currentMode = 3;
  graphModeOn(3);

  d3.select("#a0").style("background", "#eaeaea")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#a1").style("background", "white")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "white")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})
  // createLegend(0);
});

d3.select("#a1").on('click', function() { // Wage vs Years
  currentMode = 1;
  graphModeOn(1);

  d3.select("#a0").style("background", "white")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a1").style("background", "#eaeaea")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#a2").style("background", "white")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "white")})
});

d3.select("#a2").on('click', function() { // Wage vs Workers
  currentMode = 2;
  graphModeOn(2);

  d3.select("#a0").style("background", "white")
  d3.select("#a0").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a0").on("mouseout", function() {d3.select(this).style("background", "white")})
  
  d3.select("#a1").style("background", "white")
  d3.select("#a1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#a2").style("background", "#eaeaea")
  d3.select("#a2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#a2").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})
});


function graphModeOn(mode) {

  hideGraphViewCallout();
  moveBottomDown();
  hideToolTip(500);
  d3.select("#btnLegend").transition().duration(500).style("opacity",0).style("pointer-events","none")
  d3.select("#btnSizes").transition().duration(500).style("opacity",0).style("pointer-events","none")
  d3.select("#splitShuffle").transition().duration(500).style("opacity", 0);

  // if there is already a legend, remove the legend
  if (typeof axisG != "undefined") axisG.transition().duration(500).style("opacity", 0).remove();
  if (typeof legend != "undefined") legend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureLegend != "undefined") futureLegend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureAxisG != "undefined") futureAxisG.transition().duration(500).style("opacity", 0).remove();
  
  // if(futureMode == 0) {
  //   hideLeftButtons();
  // }

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
            .attrTween("cx", function(d) { // transition x position to...
              var i = d3.interpolate(d.x, 
                // x = Number of Jobs
                d.workers/maxWorkers*width*0.95 - width*0.57);
              return function(t) { return d.cx = i(t); };
            })
            .attrTween("cy", function(d) {
              var i = d3.interpolate(d.y, 
                // y = Automation Risk
                (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

        case 1:
          circles.transition()
          .duration(750)
            .attrTween("cx", function(d) {
              var i = d3.interpolate(d.cx, 
                // x = Years of Study
                d.yearsStudy/maxYearsStudy*width*0.9 - width/2);
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
                d.workers/maxWorkers*width*0.95 - width*0.57);
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
                d.workers/maxWorkers*width*0.95 - width*0.57);
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
                d.workers/maxWorkers*width*0.95 - width*0.57);
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
var compressY = 0.65;
  // Set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height*compressY, 0]);

   switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:
               // Scale the range of the data (using globally-stored nodes)
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([100, 0]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
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

  graphYtranslate = window.innerHeight*0.12;

  // Add an axis-holder group
  axisG = svg.append("g").attr("transform", "translate(0," + graphYtranslate + ")");

  d3.select("xaxis").remove();

  // Add the X Axis
  axisX = axisG.append("g")
 .attr("class", "axis")
 .attr("transform", "translate("+window.innerWidth*-0.05+","+window.innerHeight*0.31+")")
 .call(d3.axisBottom(x).ticks(5))
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the x axis
  axisLabelX = axisG.append("text")
  .attr("transform", "translate("+window.innerWidth*0.33+","+window.innerHeight*0.36+")")
  .style("text-anchor", "middle")
  .style("opacity", 0).transition().duration(500).style("opacity",1);

  d3.select("yaxis").remove();

  // Add the Y Axis
  axisY = axisG.append("g")
 .attr("class", "axis")
 .attr("transform", "translate("+window.innerWidth*-0.05+","+window.innerHeight*-0.14+")")
 .call(d3.axisLeft(y).ticks(5))
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the y axis
  axisLabelY = axisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", "-10vw")
  .attr("x", "-10vh")
  .attr("dy", "1em")
  .style("text-anchor", "middle")

  switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:
            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");
            axisY.call(d3.axisLeft(y).ticks(4))
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(4))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Risk of Machine Automation (%)").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            break;
      // x = Years of Study
      // y = Wage
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
            axisLabelY.text("Risk of Machine Automation (%)").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
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
            axisLabelY.text("Risk of Machine Automation (%)").style("fill","#49AC52").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            break;
  }



}


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

  // change available buttons
  d3.select("#btnLegend").transition().duration(500).style("opacity",1).style("pointer-events","auto")
  d3.select("#btnSizes").transition().duration(500).style("opacity",1).style("pointer-events","auto")

  d3.select("#splitShuffle").transition().duration(500).style("opacity", 1);
  d3.select("#graphToggle").attr("src","img/toggle-off.png")

  if(futureMode == 0){
    showLeftButtons();
  }

  // hide graph modes options
  d3.select("#suggestedViewsDiv").style("display","none");
  
  // remove axes
  axisG.style("opacity", 1).transition().duration(500).style("opacity",0)
  .remove();

  if (futureMode == 0){
    // move sliders back up
    moveBottomUp();
    // create the original legend
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
      simulation.alphaTarget(0.2).restart();
    }, 750);
  } else if (futureMode == 1){
    futureModeOn();
    createFutureAxis();
    futureLegend.transition().duration(500).style("opacity",0).remove();
  }
  
  return;

}







///////////////// Future View Mode ////////////////////

futureMode = 0;
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
  ////////////// Future view on ////////////////
  if (futureMode == 1) {
    futureModeOn();
    if (graphMode == 0) {
      createFutureAxis();
    } else if (graphMode == 1) {
      createFutureLegend();
    }
  }  //////////////// Future view off ///////////////////

  // If turning off:
  if (futureMode == 0) {
    futureModeOff();
  }; 
  
  // TODO: modularize graph mode in js folder
  // $.getScript("./js/graph-module.js");
})
//store the positions in future mode for un-filtering
var futurePositions = [];
var futureLegendHeight = window.innerHeight/6.5;

function createFutureAxis() {
  // Determine the axis range
  var fty = d3.scaleLinear().domain([100, 0]).range([height, 0]);
  // Add an axis-holder group
  futureAxisG = svg.append("g").attr("transform", "translate("+window.innerWidth/1.6+margin.left+"," + 15 + ")");
  // Add the Y Axis
  futureAxisY = futureAxisG.append("g")
 .attr("class", "axis")
 .call(d3.axisRight(fty).ticks(5))
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the y axis
  futureAxisLabelY = futureAxisG.append("text")
  .attr("transform", "rotate(90)")
  .attr("x", window.innerHeight/3)
  .attr("y", -window.innerWidth/22)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Risk of Machine Automation (%)").style("fill","#49AC52").style("font-size", "20px")

}

function createFutureLegend() {
    //legend
    futureLegend = svg.selectAll("#futureLegend") // switch to axis
                  .data(d3.range(5))
                  .enter().append("g")
                  .attr("class", "futureLegend")
                  .attr("transform", function(d, i) { return "translate("+window.innerWidth/3.1+"," + ((i * 22) + futureLegendHeight) + ")"; })
                  .style("fill", function(d, i) { return automationColor(i*0.2) });

              futureLegend.append("rect")
                  .attr("x", width/2 - margin.right - 10)
                  .attr("width", 16)
                  .attr("height", 16)
                  .attr("transform", "translate(10," + legendHeight + ")")
                  .style("opacity",0).transition().duration(500).style("opacity", 1)

              futureLegend.append("text")
                  .attr("x", width/2 - margin.right - 5 )
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "translate(0," + legendHeight + ")")
                  .style("text-anchor", "end")
                  .style("font-family", "Raleway")
                  .text(function(d, i) { return Math.round(10*i*0.2)*10 + "%" })
                  .style("opacity",0).transition().duration(500).style("opacity", 1);

      futureLegendTitle = futureLegend.filter(function(d,i){ return i==0 }).append("text")
                    .attr("x", width/2 - margin.right - 5 )
                    .attr("y", -6)
                    .attr("dy", ".35em")
                    // .attr("transform", "translate(20," + (legendHeight-25) + ")")
                    .style("width", "70px")
                    .style("color", "black")
                    .style("font-family", "Raleway")
                    .style("word-wrap", "break-word")
                    // .style("overflow-wrap", "normal")
                    .text("Risk (%)")
                    .style("font-size", 18)
                    .style("text-decoration", "underline")
                    .attr("transform", "translate(-32,-20)")

      futureLegendTitle.style("opacity",0).transition().duration(500).style("opacity", 1);
}


function futureModeOn() {

    hideToolTip(500);

  // if(graphMode == 0) {
  //   hideLeftButtons();
  // }

  // // legend.transition().duration(500).style("opacity", 0).remove();
  // d3.selectAll(".legendRect").transition().duration(500).style("opacity", 0).remove();
  d3.select("#futureToggle").attr("src","img/toggle-on.png");

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

      //move sliders down
  moveBottomDown();

  // create random positions & store for un-filtering
  nodes.forEach(function(d) {
    futurePositions[d.id] = [
      // x positions
      d.x + Math.random()*width/2 + Math.random()*(1-d.automationRisk)*50 -25 -width/4,
      // y positions
      d.automationRisk*height - window.innerHeight/5 + margin.top
    ];
  });
  // transition circles' areas, colours, positions
  circles.transition()
  .duration(750)
    .attr("cx", function(d) { return futurePositions[d.id][0] })
    .attr("cy", function(d) { return futurePositions[d.id][1] })
    // .attrTween("r", function(d) { // transition x position to...
    //   var i = d3.interpolate(d.radius, automationRadiusScale(d.automationRisk));
    //   return function(t) { return d.radius = i(t); };
    // })
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
    // .attrTween("r", function(d) { 
    //   var i = d3.interpolate(d.radius, automationRadiusScale(d.automationRisk));
    //   return function(t) { return d.radius = i(t); };
    // })
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

    d3.select("#futureToggle").attr("src","img/toggle-off.png")

    if(typeof futureAxisG != "undefined"){
      futureAxisG.transition().duration(500).style("opacity",0).remove();
    }
    // if graph mode off
    if (graphMode == 0) {

      // move sliders back up
      moveBottomUp();
      
      //show industry split, shuffle, pause/play
      showLeftButtons();

      if (typeof futureLegend != "undefined"){
        futureLegend.transition().duration(500).style("opacity",0).remove();
        futureLegendTitle.transition().duration(500).style("opacity",0).remove();
      }
      // Transition back to original attributes, styles, positions
      circles.transition()
      .duration(750)
        // set x, y values
      .attr("cx", function(d) { return pastPosX[d.id] })
      .attr("cy", function(d) { return pastPosY[d.id] })
      // .attrTween("r", function(d) {
      //   var i = d3.interpolate(automationRadiusScale(d.automationRisk), originalRadius[d.id])
      //   return function(t) { return d.radius = i(t); };
      // })
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

      if (typeof futureLegend != "undefined"){
        futureLegend.transition().duration(500).style("opacity",0).remove();
        futureLegendTitle.transition().duration(500).style("opacity",0).remove();
      }

      // Transition back to original attributes & styles
      circles.transition()
      .duration(750)
      // .attrTween("r", function(d) {
      //   var i = d3.interpolate(automationRadiusScale(d.automationRisk), originalRadius[d.id])
      //   return function(t) { return d.radius = i(t); };
      // })
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
  // }c
  resetFilters(currentMode);
});

resetFilters = function(mode) {
  hideGraphViewCallout();
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
  } else if (graphMode == 1) {
      switch (mode) {

        case 0:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57 })
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 1:
          circles
            // x = Years of Study
          .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.9 - width/2})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;

        case 2:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;
          // x = Number of Jobs
          // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
        case 3:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57})
            // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 4:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57})
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 5: // graph mode off
          circles
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
          .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
          break;
        }
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
  simulation.alpha(0.2).alphaTarget(0.001).restart();
}

/////// Tooltips (post-filter)

enterUpdateCircles = function() {
    var newCircles = circles.enter().append("circle")
    .attr("r", function(d) { return d.radius }) // start at full radius
    .attr("transform", "translate("+window.innerWidth/3+","+window.innerHeight/5+")") //flag! need to make equation for width/height ratio
    .style("fill", function(d) { return color(d.cluster); })

    // Tooltips
 // Tooltips
    .on("mouseenter", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.selectAll("circle").attr("stroke", "none");
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      showToolTip(0);
      tooltipMouseover(d);
      hoverTimeout = setTimeout(function(){
        tooltipLarge(d)
        clicked = 1
      }, 1750)
      })
    .on("mouseout", function(d) {
      clearTimeout(hoverTimeout)
      if (clicked == 1) return;
      clicked = 0;
      hideToolTip(500)
      d3.select(this).attr("stroke", "none");
      // div.transition().duration(500).style("opacity", 0)

      // div
      // .style("opacity", 0);
      // setTimeout(function(){
      // //   if(typeof div2 != "undefined") div2.remove();
      //   if(typeof div != "undefined") div.remove();
      // },250)
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
  circles = circles.merge(newCircles);

}











  /////////// Legend /////////////////

function createLegendDiv() {
  
  legendDiv = d3.select("body").append("div")
    .style("border", "3px solid #49AC52")
    .style("border-radius", "7px")
    .style("position","absolute")
    .style("bottom", window.innerHeight*0.4+"px")
    .style("right", window.innerWidth*0.4+"px")
    .style("height", "10px")
    .style("width", "10px")

    legendDiv.transition().duration(500)
      .style("width","700px")
      .style("height","463px")
      .style("right", window.innerWidth*0.05+"px")
      .style("bottom", window.innerHeight*0.454+"px")

  d3.selectAll("circle").transition().duration(500).style("opacity", 0.1)
}


// legendG = d3.select("#legend").append("");
// legendG = d3.select("#legend").append("");

var legendHeight = -9;

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
        // Standard right-side legend
        case 0:
          // transition circles to graph positions
              legend = d3.select("#chart").selectAll("#legend")
                  .data(d3.range(10))
                  .enter().append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) { return "translate("+ -window.innerWidth/13.4 +","+ ((i * 13) + window.innerHeight/24) + ")"; })
                  .style("fill", function(d, i) { return d3.schemeCategory10[i] });

              legend.append("rect")
                  .attr("x", width/2 - margin.right - 10)
                  .attr("width", 8)
                  .attr("height", 8)
                  .attr("transform", "translate(10," + legendHeight*1.25 + ")")
                  .style("opacity",0).transition().duration(500).style("opacity", 1)

              legend.append("text")
                  .attr("x", width/2 - margin.right - 0 )
                  .attr("y", 3)
                  .attr("dy", ".1em")
                  .style("font-size","5px")
                  .attr("transform", "translate(0," + legendHeight + ")")
                  .style("text-anchor", "end")
                  .text(function(d, i) { return industriesArray[i] + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) })
                  // .text(function(d, i) { if (industriesArray[i].length > 30) {return industriesArray[i].substring(0,30) + "..." + String.fromCharCode(160);}
                  //                         else {return industriesArray[i] + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160)} })
                  .style("opacity",0).transition().duration(500).style("opacity", 1);

              svg.select(".legend")
              .append("text") // title
                  .attr("x", width/2 - margin.right - 0 )
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "translate(-50," + (legendHeight-25) + ")")
                  .style("text-anchor", "end")
                  .style("font-family", "Raleway")
                  .style("font-size", "18")
                  .text("Industries")
                  .style("opacity",0).transition().duration(500).style("opacity", 1)
                  // .style("font-weight", "bold");
                  .style("text-decoration", "underline")

          break;
        // Industry Split
        case 1:
              legend = svg.selectAll("#legend")
                  .data(d3.range(10))
                  .enter().append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) { 
                                    if(i<5){ // first 5 (top right)
                                      return "translate(" + 
                                      ((i * 60) + window.innerWidth*0.14) + ","+ // x-translate 
                                      ((i * 20) - window.innerHeight*0.04)+")"; } // y-translate
                                    else{ // last 5 (bottom left)
                                      return "translate(" +
                                      ((i * 60) - window.innerWidth*0.38) + ","+ //x
                                      ((i * 20) + window.innerHeight*0.25)+")"} }) //y
                  .style("fill", function(d, i) { return d3.schemeCategory10[i] });

              legend.append("rect").attr("class","legendRect")
                  .attr("x", width/2 - margin.right - 10)
                  .attr("width", 16)
                  .attr("height", 16)
                  .attr("transform", "translate(10," + legendHeight + ")")
                  .style("opacity",0).transition().duration(500).style("opacity", 1)

              legend.append("text").attr("class","legendText")
                  .attr("x", width/2 - margin.right - 0 )
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "translate(0," + legendHeight + ")")
                  .style("text-anchor", "end")
                  .style("font-family", "Raleway")
                  .text(function(d, i) { return industriesArray[i].substring(0,30) + "..."; })
                  .style("opacity",0).transition().duration(500).style("opacity", 1);
          break;
      // x = Number of Jobs
      // y = Wage
        case 2:
            break;
      // x = Number of Jobs
      // y = Automation Risk

    }


}


///////////////////////////////// Filters ////////////////////////////////////

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
    xtrans = 9;
    ytrans = 9;
    topOrBottom = "top";
  }
	// Right column
	if(["Math skills", "Logic skills"].includes(sliderTitlesArray[i])){
		// xtrans = 9;
    leftOrRight = "right";
    // posn = "fixed";
	}
   // Bottom row
  if(["Math skills", "Computer skills"].includes(sliderTitlesArray[i])){
    xtrans = 9;
    ytrans = 9;
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

  // Scale
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){ return d[sliderArrayMain[i]]})])
    .range([0, mainSlidersWidth]) // Width of slider is 200 px
    .clamp(true);
  // Bugfix: math max not working
  if(["Math skills"].includes(sliderTitlesArray[i])) {
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, 59])
    .range([0, mainSlidersWidth]) // Width of slider is 200 px
    .clamp(true);
  }

  // Move Wage, Number of Jobs down
    // Slider
  sliderMulti[i] = sliderSVGArray[i].append("g") // switch to SVG with viewBox?
  .attr("class", "slider")
  // .style("z-index", 99)
  .attr("transform", "translate(" + 25 + "," + 25 + ")");

  // track
  sliderMulti[i].append("line")
  .attr("class", "track")
  // .style("z-index", 98)
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .select(function() {
    return this.parentNode;
  }) // inset
  .append("line")
  // .style("z-index", 98)
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .attr("class", "track-inset")
  .select(function() {
    return this.parentNode;
  }) // overlay
  .append("line")
  // .style("z-index", 99)
  .attr("x1", sliderScaleArray[i].range()[0])
  .attr("x2", sliderScaleArray[i].range()[1])
  .attr("class", "track-overlay")
  .attr("id", i)
  .call(d3.drag()
    .on("start.interrupt", function() {
      sliderMulti[event.target.id].interrupt();
    }) // drag update function
    .on("start drag", function() {
      updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x), currentMode); // pass the current line id to update function
    }));

  handleArray[i] = sliderMulti[i].insert("circle", ".track-overlay")
    .attr("class", "handle")
    .style("z-index", 99)
    .attr("r", 9);

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
    sliderSVGArray[i+j] = d3.select("#btnSubsliders_"+appendToDiv)
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
        .html("<div id='notmuchlots_"+i+j+"' class='d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='font-family: Raleway'>Not&nbspmuch"
          +"<span id='notmuchSpan_"+i+j+"' style='margin-left: "+window.innerWidth*0.135+"px'></span>"
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
        .attr("id", "slider_"+i+j)
        .attr("width", 280)
        .attr("height", 50);


     
    // sliderSVGArray[i+j].attr("class", "d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline")

    // hide until shown
    sliderSVGArray[i+j].style("display","none")
    // d3.select("#sliderDiv2_"+sliderArray[i+j]).style("visibility", "hidden")
    d3.select("#notmuchlots_"+i+j).style("visibility", "hidden")
    d3.select("#sliderDiv_"+subSliderArray[i]).style("visibility", "hidden")

    var slidersWidth = 230;

    // Scale
    sliderScaleArray[i+j] = d3.scaleLinear()
      .domain([0, d3.max(nodes, function(d){ return d[subSliderArray[i]]})])
      .range([0, slidersWidth]) // Width
      .clamp(true);

    if(["Oral Communication"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 43])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Reading"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 49])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Writing"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 55])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Job Task Planning and Organizing"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 23])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Critical Thinking"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 20])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Problem Solving"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 23])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Document Use"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 33])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Data Analysis"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 25])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Finding Information"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 20])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Digital Technology"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 58])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Measurement and Calculation"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 31])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Scheduling or Budgeting and Accounting"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 28])
        .range([0, slidersWidth]) // Width
        .clamp(true);      
    }
    if(["Numerical Estimation"].includes(subSliderTitlesArray[i])){
      sliderScaleArray[i+j] = d3.scaleLinear()
        .domain([0, 11])
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
    sliderMulti[i+j] = sliderSVGArray[i+j].append("g") // switch to SVG with viewBox?
      .attr("class", "slider")
      // .style("z-index", 99)
      .attr("transform", "translate(" + (15+xtranslate) + "," + 25 + ")");

      // track
      sliderMulti[i+j].append("line")
      .attr("class", "track")
      // .style("z-index", 98)
      .attr("x1", sliderScaleArray[i+j].range()[0])
      .attr("x2", sliderScaleArray[i+j].range()[1])
      .select(function() {
        return this.parentNode;
      }) // inset
      .append("line")
      // .style("z-index", 98)
      .attr("x1", sliderScaleArray[i+j].range()[0])
      .attr("x2", sliderScaleArray[i+j].range()[1])
      .attr("class", "track-inset")
      .select(function() {
        return this.parentNode;
      }) // overlay
      .append("line")
      // .style("z-index", 99)
      .attr("x1", sliderScaleArray[i+j].range()[0])
      .attr("x2", sliderScaleArray[i+j].range()[1])
      .attr("class", "track-overlay")
      .attr("id", i+j)
      .call(d3.drag()
        .on("start.interrupt", function() {
          sliderMulti[event.target.id].interrupt();
        }) // drag update function
        .on("start drag", function() {
          updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x), currentMode); // pass the current line id to update function
        }));

    handleArray[i+j] = sliderMulti[i+j].insert("circle", ".track-overlay")
      .attr("class", "handle")
      // .style("z-index", 99)
      .style("box-shadow", "3px 3px 3px black")
      .attr("r", 9);

      // Bugfix: lang slider not on top
    // if(["Language Skills"].includes(subSliderTitlesArray[i])) {
    //   d3.select("#"+i).style("z-index", 99);
    // }

  } //end for
};//end createSubSliders








// Update function which detects current slider
//  general update pattern for updating the graph
function updateMulti(h, mode) {
 
  // using the slider handle
  var sliderID = event.target.id;
  handleArray[sliderID].attr("cx", sliderScaleArray[sliderID](h)); // move the slider handle

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
  
      switch (mode) {

        case 0:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57 })
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 1:
          circles
            // x = Years of Study
          .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.9 - width/2})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;

        case 2:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57})
            // y = Wage
          .attr("cy", function(d){ return ((maxWage-d.wage)/maxWage)*height*0.69 - height*0.5 + graphYtranslate});
          break;
          // x = Number of Jobs
          // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
        case 3:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57})
            // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 4:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.95 - width*0.57})
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 5: // graph mode off
          circles
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left })
          .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
          break;
        }

  } else if (futureMode == 1) {
    circles
    .attr("cx", function(d){ return futurePositions[d.id][0] })
    .attr("cy", function(d){ return futurePositions[d.id][1] })
    .attr("r", function(d) { return d.radius; })
    .style("fill", function(d) { return d.color; })
    .style("stroke", "black")
  }
};//end updateMulti



// Graph View Callout

// show
graphViewCallout = function() {
  // d3.select("#graphCallout").transition().duration(400).style("width","300px")
  d3.select("#graph").style("box-shadow","0px 0px 17px 7px #E6E447")  
  d3.select("#graphCallout").transition().duration(400).style("opacity",1)
  
  
}

// hide
hideGraphViewCallout = function() {
  d3.select("#graph").style("box-shadow","3px 3px 17px grey")
  d3.select("#graphCallout").transition().duration(400).style("opacity",0).style("pointer-events","none")
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
  calloutCheck()
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
      
    })
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


};// Update function which detects current slider





/////////////////////////// Skillset Explainer Divs /////////////////////////////////

var explainerDivs = [

"Language is used to read, write, and speak. If you like to communicate or to learn new words, this one's for you.",

"Logic means critical thinking, planning, and deciding. Do you enjoy using these skills? It's a mystery...",

"Math is about measurement, calculation, budgeting, and estimation... more or less.",

"Computers are super-useful! Use them to find information, create information, and automate repetitive tasks.",

]

// positions relative to question mark icons

var offsetDown = 47
var eTops = [document.getElementById("question_0").getBoundingClientRect().top + offsetDown,
			 document.getElementById("question_1").getBoundingClientRect().top + offsetDown,
			 document.getElementById("question_2").getBoundingClientRect().top + offsetDown,
			 document.getElementById("question_3").getBoundingClientRect().top + offsetDown]

var offsetRight = -155
var eLefts = [document.getElementById("question_0").getBoundingClientRect().left + offsetRight,
			  document.getElementById("question_1").getBoundingClientRect().left + offsetRight,
			  document.getElementById("question_2").getBoundingClientRect().left + offsetRight,
			  document.getElementById("question_3").getBoundingClientRect().left + offsetRight]

for (var i = 0; i < explainerDivs.length; i++) {
  
  var question = d3.select("#question_"+i)

  question.on("mouseenter", function(){

  	var thisNum = event.target.id.substring(9,10)
  	console.log(thisNum)

    d3.select("body").append("div")
    .style("height","auto").style("width","250px")
    .style("position","fixed")
    .style("padding","10px")
    .style("font-family","Raleway")
	.style("background","#A6B0A8")
	.style("color","white")
	.style("box-shadow","3px 3px 17px grey")
    .style("top",eTops[thisNum]+"px")
    .style("left",eLefts[thisNum]+"px")
    .attr("id","answer_"+thisNum)
    .text(explainerDivs[thisNum])
    .style("opacity",0).transition().duration(200).style("opacity",1)

  })
  question.on("mouseleave", function(){
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
  .append("span")
    .append("button").attr("id","searchButtonPC").attr("class","search-btn")
      .append("img").attr("id","searchImg").attr("class","search-img")
        .attr("src","img/search.png")
        .attr("height","40")
        .attr("width","40")
        .on("mouseenter", function(){expandSearch()})
        .on("click", function(){d3.select("#searchDiv").transition().duration(500).style("opacity",0)})

var searchDiv = d3.select("body")
  .append("div").attr("id","searchDiv")
    .style("width", "0px")
    .style("height", "39px")
    .style("position", "absolute")
    .style("top", "32px")
    .style("right", "82px")
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

  searchExpanded = 1;
  if(searchExpanded == 1){
    d3.select("#searchDiv")
      .transition().duration(500).style("width", window.innerWidth/2 - 60 + "px").style("opacity", 1)
    d3.select("#jobTitle").transition().duration(500).style("opacity","1")
    // d3.select("#searchSubmitBtn").style("opacity",0).transition().duration(3500).style("opacity","1")

  }
}

function searchJobTitles() {

  resetFilters();

  //  UPDATE
  circles = circles.data(filterBySearch(), function(d) { return d.id });
  
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
    simulation.nodes(filterBySearch())
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
    .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
  } else if (futureMode == 1) {
    circles
    .attr("cx", function(d){ return futurePositions[d.id][0] })
    .attr("cy", function(d){ return futurePositions[d.id][1] })
    .attr("r", function(d) { return d.radius; })
    .style("fill", function(d) { return d.color; })
    .style("stroke", "black")
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

// createSubSliders(sliderArrayLang, sliderTitlesArrayLang, 1, 4);

// createSubSliders(sliderArrayLogi, sliderTitlesArrayLogi, 1, 8);

// createSubSliders(sliderArrayMath, sliderTitlesArrayMath, 3, 12);

// createSubSliders(sliderArrayComp, sliderTitlesArrayComp, 3, 16);

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

        d3.select("#btnSubsliders_0")
          .transition().duration(350).style("height", heightLang+20+"px").style("width",widthAll*0.95+"px")
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

        d3.select("#btnSubsliders_1")
          .transition().duration(350).style("height", heightLogi+20+"px").style("width", widthAll*0.95+"px")

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

        d3.select("#btnSubsliders_2")
          .transition().duration(350).style("height", heightMath+50+"px").style("width", widthAll*0.97+"px")
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
  d3.select("#spanSubsliders_0")
          .transition().duration(350).style("opacity", 1)
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
  d3.select("#spanSubsliders_1")
          .transition().duration(350).style("opacity", 1)

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
  d3.select("#spanSubsliders_2")
          .transition().duration(350).style("opacity", 1)

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
  d3.select("#spanSubsliders_3")
          .transition().duration(350).style("opacity", 1)

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

