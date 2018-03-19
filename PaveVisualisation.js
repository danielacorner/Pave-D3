var circles, drag_handler, enterUpdateCircles, graphMode, futureMode, simulation, listToDeleteMulti,
forceCollide, forceXCombine, forceYCombine, forceGravity, forceXSeparate, forceYSeparate, 
forceXSeparateRandom, forceYSeparateRandom, forceCluster, tick;

// sliders to create
// var sliderArray = [
// // "skillsLang", "skillsLogi", "skillsMath", "skillsComp",
//     // subskills
//     "s1DataAnalysis","s2DecisionMaking","s3FindingInformation","s4JobTaskPlanningandOrganizing", // reorganize to match lang-log-mat-com
//     "s5MeasurementandCalculation","s6MoneyMath","s7NumericalEstimation","s8OralCommunication",
//     "s9ProblemSolving","s10Reading","s11SchedulingorBudgetingandAccounting","s12DigitalTechnology",
//     "s13DocumentUse","s14Writing","s15CriticalThinking"
// ];

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
var sliderTitlesArrayMath = ["Measurement and Calculation","Money Math","Numerical Estimation","Scheduling or Budgeting and Accounting"];

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

d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

// d3.select("#combine").style("visibility", "hidden");

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

resize();
d3.select(window).on("resize", resize);
// resize the window
function resize() {
  d3.select("#chart").attr("width", window.innerWidth/1.5);
  d3.select("#chart").attr("height", window.innerHeight/1.5);
  width = window.innerWidth/1.5, // set chart dimensions
    height = window.innerHeight/1.5;

// if(window.innerWidth>1024){
  for(var i=0; i<4; i++){
    d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
      +"<span id='notmuchSpan_"+i+"' style='margin-left: "+window.innerWidth*0.135+"px'></span>"
      +"Lots")  
  }  
// }
// if(window.innerWidth<=1024){
//   for(var i=0; i<4; i++){
//     d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
//       +"<span id='notmuchSpan_"+i+"' style='margin-left: 50%'></span>"
//       +"Lots")  
//   }  
  if(window.innerWidth<=954){
    for(var i=0; i<4; i++){
      d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
        +"<span id='notmuchSpan_"+i+"' style='margin-left: 40%'></span>"
        +"Lots")  
    }
    if(window.innerWidth<768){
      for(var i=0; i<4; i++){
        d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
          +"<span id='notmuchSpan_"+i+"' style='margin-left: 40%'></span>"
          +"Lots")
      } 
      if(window.innerWidth<684){
        for(var i=0; i<4; i++){
          d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
            +"<span id='notmuchSpan_"+i+"' style='margin-left: 30%'></span>"
            +"Lots")
        }
        
        for(var i=0; i<4; i++){
          d3.select("#notmuchlots_"+i).html("Not&nbspmuch"
            +"<span id='notmuchSpan_"+i+"' style='margin-left: 20%'></span>"
            +"Lots")
        }

        if(window.innerWidth<576){
          for(var i=0; i<4; i++){
            d3.select("#notmuchlots_"+i).html("<span style='font-size: 24px;'>-&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp+</span>")
            d3.select("#sliderArray1").style("margin-right", "-700%")
            d3.select("#sliderArray3").style("margin-left", "-700%")
          }        
          if(window.innerWidth<512){
            for(var i=0; i<4; i++){
              d3.select("#sliderArray1").style("margin-right", "-700%")
              d3.select("#sliderArray3").style("margin-left", "-700%")
            }
          }
        }
      }
    }  
  }
// }
  
d3.select("#futureView").style("margin-top", "0px")
if(window.innerWidth<576){
  d3.select("#futureView").style("margin-top", "10px")
}

if(window.innerWidth<768){
  d3.select("#sliderArray1").style("margin-right", "-500%")
  d3.select("#sliderArray3").style("margin-left", "-500%")
  d3.select("#industry").style("display","none")

  d3.select("#random").style("visibility", "visible")
  if(window.innerWidth<750) {
    d3.select("#random").style("visibility", "hidden")
    if(window.innerWidth<684) {
      d3.select("#sliderArray1").style("margin-right", "-600%")
      d3.select("#sliderArray3").style("margin-left", "-600%")
    }
  }
}
if(window.innerWidth>=768){
  d3.select("#sliderArray1").style("margin-right", "-300%")
  d3.select("#sliderArray3").style("margin-left", "-300%")
  d3.select("#industry").style("display","inline")

}
  // width = d3.select("#chart").attr("width"), // set chart dimensions
  // height = d3.select("#chart").attr("height");

  // svg.attr("viewBox", "-"+width/2+" -"+height/2+" "+width+" "+height+"");
  // svg.attr("width", width).attr("height", height);
}


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
    favourite: 0,
    cluster: i, 
    radius: r, 
    job: el.job,
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
  return ((d3.select("#chart").attr("width") / m) * d.cluster - d3.select("#chart").attr("width")/2) //try window.innerWidth??
}).strength(0.3)
var forceYSeparate = d3.forceY(function(d) {
  return ((height / 2) * d.cluster/40 - 20)
}).strength(0.3)
var forceXSeparateRandom = d3.forceX(function(d) {
  Math.random();
  return ( (width / m) * 10 * Math.random() - width/2 + 0)
}).strength(0.4)
var forceYSeparateRandom = d3.forceY(function(d) {
  return ( Math.random() * (height/2) - 200 )
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
var div = d3.select("body").append("div")
.attr("class", "tooltip")
// .style("z-index", 99)
// .style("position", "absolute")
.style("opacity", 0);

var div2 = d3.select("body").append("div")
.style("opacity", 0)
.attr("transform", "translate(0," + 200 + ")");

// Append a group element to the svg & move to center
var svg = d3.select("#chart")
.append('svg')    
.attr("viewBox", "-"+window.innerWidth/3+" -"+window.innerHeight/3+" "+window.innerWidth/1.5+" "+window.innerHeight/1.5+"");

// .attr('transform', 'translate('+width/2+','+height/2+')');


var stretch_y = 1.7;
var skillsBarsYtranslate = -15;
// TODO: merge pre, post-filtering
///////////////////////// Circles, Tooltips (pre-filtering) /////////////////////////////
// Add the circles with tooltips
circles = svg.selectAll("circle")
.data(nodes)
.enter().append("circle")
    // .attr("viewBox", "0 0 500 500")
    .attr("r", 0) // start at 0 radius and transition in
    .attr("transform", "translate(0,-105)") //flag!
    .style("z-index", 100)
    .style("fill", function(d) { return color(d.cluster); })
    // Tooltips
    .on("mouseover", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      tooltipMouseover(d);
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
    if (clicked == 1) {
      tooltipLarge(d);
     } else if (clicked == 0) {
      tooltipSmall(d);}
      })


function tooltipLarge(d) {
div
      .html("<div style='font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div id='tooltipContent' style=' height: 100px; padding-left: 10px; font-family: Raleway; font-size: 15px; color: " + colorTooltip(d.cluster) +";'>"

                +"<svg height='80px' style='margin: 5 0;' class='chart' aria-labelledby='title desc' role='img'>"+
                  "<title id='title'>A bar chart showing information</title>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.yearsStudy/5)+"' style='fill: #256D1B;' height='15'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.yearsStudy/5+5)+"' y='9.5' dy='.35em'>"+Math.round(d.yearsStudy*10)/10+" years of study</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(350*d.wage/maxWage)+"' style='fill: #244F26' height='15' y='20'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(Math.round((350*d.wage/maxWage+5)*100)/100)+"' y='28' dy='.35em'>$ "+Math.round(d.wage*100)/100+" per hr</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.automationRisk)+"' height='15' style='fill: #550C18' y='40'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.automationRisk+5)+"' y='48' dy='.35em'>"+(Math.round(d.automationRisk*100))+"% risk of machine automation</text>"+
                  "</g>"+
                "</svg>"                                
                +"<br/>Some job titles from this group are ...</br>"
                +"<ul style='padding-top: 5px;'><li>"+d.title1+"</li><li>"+d.title2+"</li><li>"+d.title3+"</li></ul>"

                +"Top skills are...</br>"
                +"<ul style='margin-top: 5px;'><li>" + d.topSkill1 + "</li><li>" + d.topSkill2 + "</li><li>" + d.topSkill3 + "</ul>"//TOP SKILLS
        // Skill levels
                 +"<svg height='160px' style='margin-top: "+30+"px; margin-left: 25px;' class='chart' aria-labelledby='title desc' role='img'>"+
                  "<title id='title'>A bar chart showing information</title>"+
                  "<g class='bar'>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(-7-skillsBarsYtranslate)+"' dy='.35em'>Language</text>"+
                    "<rect height='"+(d.skillsLang*stretch_y)+"' width='18' style='fill: #256D1B;' y='"+(80-(d.skillsLang*stretch_y))+"' x='"+(5-skillsBarsYtranslate)+"'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(15-skillsBarsYtranslate)+"'>"+Math.round(10*d.skillsLang)/10+"</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(30-skillsBarsYtranslate)+"' dy='.35em'>Logic</text>"+
                    "<rect height='"+(d.skillsLogi*stretch_y)+"' width='18' style='fill: #256D1B;' y='"+(80-(d.skillsLogi*stretch_y))+"' x='"+(40-skillsBarsYtranslate)+"'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(50-skillsBarsYtranslate)+"'>"+Math.round(10*d.skillsLogi)/10+"</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(65-skillsBarsYtranslate)+"' dy='.35em'>Math</text>"+
                    "<rect height='"+(d.skillsMath*stretch_y)+"' width='18' style='fill: #256D1B;' y='"+(80-(d.skillsMath*stretch_y))+"' x='"+(75-skillsBarsYtranslate)+"'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(85-skillsBarsYtranslate)+"'>"+Math.round(10*d.skillsMath)/10+"</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-size: 16px; font-family: Raleway' x='-80' y='"+(100-skillsBarsYtranslate)+"' dy='.35em'>Computer</text>"+
                    "<rect height='"+(d.skillsComp*stretch_y)+"' width='18' style='fill: #256D1B;' y='"+(80-(d.skillsComp*stretch_y))+"' x='"+(110-skillsBarsYtranslate)+"'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; transform: rotate(-90deg); font-family: Raleway' x='"+(-75)+"' y='"+(120-skillsBarsYtranslate)+"'>"+Math.round(10*d.skillsComp)/10+"</text>"+
                  "</g>"+
                "</svg>"+
        // +"<br/>" 
                "</div>"+
                "<span style='margin-left: 236px'></span>"+"<button id='favouriteBtn' onclick='function() { console.log('hiiiiiiii') }' class='btn btn-lg' "+
         "style='position: absolute; bottom: 67px; z-index: 99; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; font-family: Raleway; background: white; color: " + color(d.cluster) +"'>"
         +"Favourite</button><br/>"+
         "<span style='margin-top: 10px; margin-left: 225px'></span>"+"<a id='viewMoreBtn' class='btn btn-lg' href='http://.google.com' target='_blank'"+
         "style='position: absolute; bottom: 13px; z-index: 99; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; margin-top: 11px; font-family: Raleway; background: white; color: " + color(d.cluster) +"'>"
         +"View more</a><br/><br/> ").transition().duration(300).style("width", "350px")
        // Unfurl downward
        // .style("height", 200)
        // .transition()
        // .duration(200)
        // .style("height", "auto")
       d3.select("#tooltipContent").transition().duration(250).style("height", "350px");

};

function tooltipSmall(d) {
  d3.select("#tooltipContent").transition().duration(250).style("height", "100px");
      setTimeout(function() {
              div.html("<div style='z-index: 99; font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div id='tooltipContentPre' style='color: " + colorTooltip(d.cluster) +"; padding-left: 10px; font-size: 15px; font-family: Raleway;'>"
        
                +"<svg height='80px' style='margin: 5 0;' class='chart' aria-labelledby='title desc' role='img'>"+
                  "<title id='title'>A bar chart showing information</title>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.yearsStudy/5)+"' style='fill: #256D1B;' height='15'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.yearsStudy/5+5)+"' y='9.5' dy='.35em'>"+Math.round(d.yearsStudy*10)/10+" years of study</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(350*d.wage/maxWage)+"' style='fill: #244F26' height='15' y='20'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(Math.round((350*d.wage/maxWage+5)*100)/100)+"' y='28' dy='.35em'>$ "+Math.round(d.wage*100)/100+" per hr</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.automationRisk)+"' height='15' style='fill: #550C18' y='40'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.automationRisk+5)+"' y='48' dy='.35em'>"+(Math.round(d.automationRisk*100))+"% risk of machine automation</text>"+
                  "</g>"+
                "</svg>"                                
                +"<br/>Some job titles from this group are ...</br>"
                +"<ul style='padding-top: 5px;'><li>"+d.title1+"</li><li>"+d.title2+"</li><li>"+d.title3+"</li></ul></div>")}, 150)
}

  function tooltipMouseover(d) {
  // create the hover tooltip
      div.transition()
      .duration(300)
      .style("opacity", .96)
      .style("height", "auto")
      .style("width", "350px")
      .style("z-index", 99)
      .style("position", "absolute")
      // .style("border",   "1px solid black;");

      // d3.select("#tooltip")
      // .append("image")
      //   .attr("src", "img/logo.png")
      //   .attr("class", "img-rounded");

      // Display Hover Tooltip
      div.html("<div style='z-index: 99; font-weight: bold; font-size: 20px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
        +"; font-weight: bold'>" + d.job + "</div>"
                +"<div id='tooltipContentPre' style='color: " + colorTooltip(d.cluster) +"; padding-left: 10px; font-size: 15px; font-family: Raleway;'>"
        
                +"<svg height='80px' style='margin: 5 0;' class='chart' aria-labelledby='title desc' role='img'>"+
                  "<title id='title'>A bar chart showing information</title>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.yearsStudy/5)+"' style='fill: #256D1B;' height='15'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.yearsStudy/5+5)+"' y='9.5' dy='.35em'>"+Math.round(d.yearsStudy*10)/10+" years of study</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(350*d.wage/maxWage)+"' style='fill: #244F26' height='15' y='20'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(Math.round((350*d.wage/maxWage+5)*100)/100)+"' y='28' dy='.35em'>$ "+Math.round(d.wage*100)/100+" per hr</text>"+
                  "</g>"+
                  "<g class='bar'>"+
                    "<rect width='"+(150*d.automationRisk)+"' height='15' style='fill: #550C18' y='40'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(150*d.automationRisk+5)+"' y='48' dy='.35em'>"+(Math.round(d.automationRisk*100))+"% risk of machine automation</text>"+
                  "</g>"+
                "</svg>"                                
                +"<br/>Some job titles from this group are ...</br>"
                +"<ul style='padding-top: 5px;'><li>"+d.title1+"</li><li>"+d.title2+"</li><li>"+d.title3+"</li></ul></div>")
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

// Size dropdown

var wageRadiusScale = d3.scaleSqrt() // Sqrt scale because radius
.domain([d3.min(nodes, function(d) { return d.wage }), d3.max(nodes, function(d) { return d.wage })]) // input
.range([1,maxRadius/1.2]); // output -- need to think about relative scales for each set of sizes

var automationRadiusScale = d3.scaleSqrt()
.domain([0.01, d3.max(nodes, function(d) { return d.automationRisk })])
.range([1,maxRadius/3]);

var yearRadiusScale = d3.scaleSqrt()
.domain([d3.min(nodes, function(d) { return d.yearsStudy }), d3.max(nodes, function(d) { return d.yearsStudy })])
.range([0.01,maxRadius/2]);


d3.select("#workLink").on('click', function() {
  document.getElementById("sizeDropdownButton").innerHtml = "Size = Workers";
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
});
d3.select("#wageLink").on('click', function() {
  document.getElementById("sizeDropdownButton").innerHtml = "Size = Wage ($ per hr)";
  circles.transition().duration(100)
    .delay(function(d, i) { return i * 1})
    .attrTween("r", function(d) {
      var i = d3.interpolate(d.radius, wageRadiusScale(d.wage));
      return function(t) { return d.radius = i(t); };
    });

  if(graphMode == 0 && futureMode == 0) {
    setTimeout(function() { resetSimulation() }, 600);
    setTimeout(function() { resetSimulation() }, 700);
    
    setTimeout(function() { enterUpdateCircles();
      simulation.alpha(0.7).alphaTarget(0).restart(); }, 200);
  }
});
d3.select("#autoLink").on('click', function() {
  document.getElementById("sizeDropdownButton").innerHtml = "Size = Automation risk";
  circles.transition().duration(100)
    .delay(function(d, i) { return i * 1})
    .attrTween("r", function(d) {
      var i = d3.interpolate(d.radius, automationRadiusScale(d.automationRisk));
      return function(t) { return d.radius = i(t); };
    });
  if(graphMode == 0 && futureMode == 0) {
    setTimeout(function() { resetSimulation() }, 600);
    setTimeout(function() { resetSimulation() }, 700);
    
    setTimeout(function() { enterUpdateCircles();
      simulation.alpha(0.7).alphaTarget(0).restart(); }, 200);
  }
});
d3.select("#yearLink").on('click', function() {
  document.getElementById("sizeDropdownButton").innerHtml = "Size = Years of study";
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
});


//////////// Industry Split ////////////////

d3.select("#industry").on('click', function() {
  if (graphMode == 1 || futureMode == 1) return;
  simulation
  .force("x", forceXSeparate).alpha(0.4)
  .force("y", forceYSeparate).alpha(0.4)
    .alphaTarget(0) // after click, cool down to minimal temperature
    .restart()

  d3.select("#industry").style("display","none");
  d3.select("#random").style("display","none");
  d3.select("#combine").style("visibility", "visible");

  legend.transition().duration(500).style("opacity", 0).remove();
  createLegend(1); // create Industry split legend
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
  legend.transition().duration(500).style("opacity", 0).remove();
  createLegend(0);

  d3.select("#industry").style("display","inline");
  d3.select("#random").style("display","inline");
  d3.select("#combine").style("visibility", "hidden");

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

  d3.select("#freeze").style("visibility", "hidden");
  d3.select("#unfreeze").style("visibility", "visible");

});
////////////////// unFreeze! (unPause) ////////////////////////
d3.select("#unfreeze").on('click', function(d) {
  simulation.alpha(0.7).alphaTarget(0.001).restart();

  d3.select("#freeze").style("visibility", "visible");
  d3.select("#unfreeze").style("visibility", "hidden");

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

var graphYtranslate = 0;

function graphModeOn(mode) {

    //move sliders down
d3.select("#sliderDiv_skillsComp").transition().duration(500).style("margin-top", window.innerHeight/1.5+"px");
d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("margin-top", window.innerHeight/1.5+"px");
d3.select("#playPauseDiv").transition().duration(500).style("margin-top", (window.innerHeight/2.9)+"px");

  // if there is already a legend, remove the legend
  if (typeof axisG != "undefined") axisG.transition().duration(500).style("opacity", 0).remove();
  if (typeof legend != "undefined") legend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureLegend != "undefined") futureLegend.transition().duration(500).style("opacity", 0).remove();
  d3.select("#freeze").transition().duration(500).style("opacity", 0);
  d3.select("#unfreeze").transition().duration(500).style("opacity", 0);
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
                var i = d3.interpolate(d.y, (1-d.automationRisk)*height*0.9 +100 - height/2 + graphYtranslate);
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
                var i = d3.interpolate(d.y, ((maxWage-d.wage)/maxWage)*height*0.9 - height/2 + graphYtranslate);
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
                var i = d3.interpolate(d.y, ((maxWage-d.wage)/maxWage)*height*0.9 - height/2 + graphYtranslate);
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
  axisG = svg.append("g").attr("transform", "translate(0," + graphYtranslate + ")");

  d3.select("xaxis").remove();

  // Add the X Axis
  axisX = axisG.append("g")
 .attr("class", "axis")
 .attr("transform", "translate("+ (-width/2+margin.left) +","
  + (height/2-40+graphYtranslate) + ")")
 .call(d3.axisBottom(x).ticks(5))
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the x axis
  axisLabelX = axisG.append("text")
  .attr("transform","translate(" + (margin.left) + ","
                      + (height/2) +")") // top
  .style("text-anchor", "middle")
  .style("opacity", 0).transition().duration(500).style("opacity",1);

  d3.select("yaxis").remove();

  // Add the Y Axis
  axisY = axisG.append("g")
 .attr("class", "axis")
 .attr("transform", "translate("+ (-width/2+margin.left) +"," 
  + (-height/2-margin.bottom ) + ")")
 .call(d3.axisLeft(y).ticks(5))
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the y axis
  axisLabelY = axisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -width/2-5)
  .attr("x", 0)
  .attr("dy", "1em")
  .style("text-anchor", "middle")

  switch (mode) {
      // x = Number of Jobs
      // y = Automation Risk
        case 0:

            // axisY.call(d3.axisLeft(y)).style("fill", "none").style("stroke", "none");

            axisY.call(d3.axisLeft(y).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisX.call(d3.axisBottom(x).ticks(5))
            .style("opacity", 0).transition().duration(500).style("opacity",1);

            d3.selectAll("text").text("");
            axisLabelX.text("Number of Jobs").style("fill","#579E38").style("font-family", "Raleway").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Risk of Machine Automation").style("fill","#579E38").style("font-family", "Raleway").style("font-size", "20px")
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
            axisLabelX.text("Years of Study").style("fill","#579E38").style("font-family", "Raleway").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Wage ($ per hr)").style("fill","#579E38").style("font-family", "Raleway").style("font-size", "20px")
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
            axisLabelX.text("Number of Jobs").style("fill","#579E38").style("font-family", "Raleway").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            axisLabelY.text("Wage ($ per hr)").style("fill","#579E38").style("font-family", "Raleway").style("font-size", "20px")
            .style("opacity", 0).transition().duration(500).style("opacity",1);
            break;
  }


d3.select("#industry").style("display","none");
d3.select("#random").style("display","none");
d3.select("#combine").style("visibility", "visible");
d3.select(".btn-group").style("padding-left", "0px");

d3.select("#chart").attr("height", (window.innerHeight*0.6) );

}











function graphModeOff() {


d3.select("#combine").style("visibility", "hidden");

d3.select("#graphModesDiv").style("display","none");

d3.select("#freeze").transition().duration(500).style("opacity", 1);
d3.select("#unfreeze").transition().duration(500).style("opacity", 1);

d3.select("#industry").transition().duration(500).style("display","inline");
d3.select("#random").style("display","inline");
// d3.select("#combine").style("width", "");
d3.select(".btn-group").style("padding-left", "0px")

d3.select("#chart").transition().duration(500).attr("height",window.innerHeight/1.5);


// move sliders back up
d3.select("#sliderDiv_skillsComp").transition().duration(500).style("margin-top", window.innerHeight/1.8+"px");
d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("margin-top", window.innerHeight/1.8+"px");
d3.select("#playPauseDiv").transition().duration(500).style("margin-top", 0+"px");

    // remove axes
    axisG.style("opacity", 1).transition().duration(500).style("opacity",0)
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
var futureLegendHeight = -20;

function futureModeOn() {
    legend.transition().duration(500).style("opacity", 0);
 

    //legend
    futureLegend = svg.selectAll("#futureLegend")
                  .data(d3.range(5))
                  .enter().append("g")
                  .attr("class", "futureLegend")
                  .attr("transform", function(d, i) { return "translate(5," + ((i * 22) + futureLegendHeight) + ")"; })
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
                    .attr("y", 12)
                    .attr("dy", ".35em")
                    // .attr("transform", "translate(20," + (legendHeight-25) + ")")
                    .style("width", "70px")
                    .style("color", "black")
                    .style("font-family", "Raleway")
                    .style("word-wrap", "break-word")
                    // .style("overflow-wrap", "normal")
                    .text("Risk of Machine Automation")
                    .style("font-size", 18)
                    .style("text-decoration", "underline")
                    .attr("transform", "translate(-200,-20)")

      futureLegendTitle.style("opacity",0).transition().duration(500).style("opacity", 1);


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
    d3.select("#sliderDiv_skillsComp").transition().duration(500).style("margin-top", window.innerHeight/1.2+"px");
    d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("margin-top", window.innerHeight/1.2+"px");
    d3.select("#playPauseDiv").transition().duration(500).style("margin-top", (window.innerHeight/2.9)+"px");
        //hide pause/play
    d3.select("#freeze").transition().duration(500).style("opacity", 0);
    d3.select("#unfreeze").transition().duration(500).style("opacity", 0);

    // create random positions & store for un-filtering
    nodes.forEach(function(d) {
      futurePositions[d.id] = [
        // x positions
        d.x + Math.random()*width/2 + Math.random()*(1-d.automationRisk)*50 -25 -width/4,
        // y positions
        d.automationRisk*height*0.95 - height/2.5 + margin.top + 20 + Math.random()*(1-d.automationRisk)*100
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
    

    // if graph mode off
    if (graphMode == 0) {

    // move sliders back up
    d3.select("#sliderDiv_skillsComp").transition().duration(500).style("margin-top", window.innerHeight/1.8+"px");
    d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("margin-top", window.innerHeight/1.8+"px");
    d3.select("#playPauseDiv").transition().duration(500).style("margin-top", 0+"px");
        //show pause/play
    d3.select("#freeze").transition().duration(500).style("opacity", 1);
    d3.select("#unfreeze").transition().duration(500).style("opacity", 1);

    futureLegend.transition().duration(500).style("opacity",0);
    futureLegendTitle.transition().duration(500).style("opacity",0);

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

    futureLegend.transition().duration(500).style("opacity",0);
    futureLegendTitle.transition().duration(500).style("opacity",0);

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

enterUpdateCircles = function() {
    var newCircles = circles.enter().append("circle")
    .attr("r", function(d) { return d.radius }) // start at full radius
    .attr("transform", "translate(0,-105)") //flag!
    .style("fill", function(d) { return color(d.cluster); })

    // Tooltips
    .on("mouseover", function(d) {
      if (clicked == 1) return;
      // highlight the current circle
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      tooltipMouseover(d);
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
    if (clicked == 1) {
      tooltipLarge(d);
     } else if (clicked == 0) {tooltipSmall(d);}
      })
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
        // Standard right-side legend
        case 0:
          // transition circles to graph positions
              legend = svg.selectAll("#legend")
                  .data(d3.range(10))
                  .enter().append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) { return "translate("+ 37 +","+ ((i * 22) - 150) + ")"; })
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
                  .text(function(d, i) { if (industriesArray[i].length > 30) {return industriesArray[i].substring(0,30) + "..." + String.fromCharCode(160);}
                                          else {return industriesArray[i] + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160)} })
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
                                    if(i<5){ // first 5 (bottom left)
                                      return "translate(" + 
                                      ((i * 60) - d3.select("#chart").attr("width")*0.76) + ","+ // x-translate 
                                      ((i * 20))+")"; } // y-translate
                                    else{ // last 5 (top-right)
                                      return "translate(" + ((i * 60) - d3.select("#chart").attr("width")*0.65) + ","+ //x
                                      (-d3.select("#chart").attr("height")*0.65 + (i * 20))+")"} }) //y
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
      // x = Number of Jobs
      // y = Wage
        case 2:
            break;
      // x = Number of Jobs
      // y = Automation Risk

    }


}

createLegend(0);














///////////////////////////////// Filters ////////////////////////////////////







// //////////////// Filter Slider 1: Filter by Dropdown //////////////////////

// var sliderDropdownSVG = d3.select("#slider2").append("svg")
// .attr("width", 250)
// .attr("height", 50);

// var sliderDropdownScale = d3.scaleLinear()
//   .domain([ 0, d3.max(nodes, function(d){ return d[dropdown1.value] }) ]) 
//   .range([0, 200]) // Width of slider is 200 px
//   .clamp(true);

// d3.select("#dropdown1").on('click', function(){
//   sliderDropdownScale = d3.scaleLinear()
//     .domain([0, d3.max(nodes, function(d){return d[dropdown1.value]})])
//     .range([0, 200]) // Width of slider is 200 px
//     .clamp(true);
//     console.log(d3.max(nodes, function(d){return d[dropdown1.value]}));
//   // display (range: min to max) after dropdown title
//   document.getElementById("dropdown1Title").innerHTML = "Minimum "+ dropdown1.value
//       +" (range: "+ d3.min(nodes, function(d){ return d[dropdown1.value] }) 
//         +" to "+ d3.max(nodes, function(d){ return d[dropdown1.value] }) +")";
// })

//   var sliderDropdown = sliderDropdownSVG.append("g")
//   .attr("class", "slider")
//   .attr("transform", "translate(" + 25 + "," + 25 + ")");

//   sliderDropdown.append("line")
//   .attr("class", "track")
//   .attr("x1", sliderDropdownScale.range()[0])
//   .attr("x2", sliderDropdownScale.range()[1])
//   .select(function() {
//     return this.parentNode;
//   })
//   .append("line")
//   .attr("x1", sliderDropdownScale.range()[0])
//   .attr("x2", sliderDropdownScale.range()[1])
//   .attr("class", "track-inset")
//   .select(function() {
//     return this.parentNode;
//   })
//   .append("line")
//   .attr("x1", sliderDropdownScale.range()[0])
//   .attr("x2", sliderDropdownScale.range()[1])
//   .attr("class", "track-overlay")
//   .call(d3.drag()
//     .on("start.interrupt", function() {
//       sliderDropdown.interrupt();
//     })
//     .on("start drag", function() {
//       // console.log("filtering for workers > ", sliderDropdownScale.invert(d3.event.x));
//       updateNodesDropdown(sliderDropdownScale.invert(d3.event.x));
//     }));

//   var handleDropdown = sliderDropdown.insert("circle", ".track-overlay")
//   .attr("class", "handle")
//   .attr("r", 9);


//   // on dropdown click, reset the slider
//   d3.select("#dropdown1").on('click', function(){
//     sliderDropdownScale = d3.scaleLinear()
//       .domain([0, d3.max(nodes, function(d){return d[dropdown1.value]})])
//       .range([0, 200]) // Width of slider is 200 px
//       .clamp(true);
//     // display (range: min to max) after dropdown title
//     document.getElementById("dropdown1Title").innerHTML = "Minimum "+ dropdown1.value
//         +" (range: "+ d3.min(nodes, function(d){ return d[dropdown1.value] }) 
//           +" to "+ d3.max(nodes, function(d){ return d[dropdown1.value] }) +")";
  
//     sliderDropdown.remove();
//     var sliderDropdown = sliderDropdownSVG.append("g")
//     .attr("class", "slider")
//     .attr("transform", "translate(" + 25 + "," + 25 + ")");

//     sliderDropdown.append("line")
//     .attr("class", "track")
//     .attr("x1", sliderDropdownScale.range()[0])
//     .attr("x2", sliderDropdownScale.range()[1])
//     .select(function() {
//       return this.parentNode;
//     })
//     .append("line")
//     .attr("x1", sliderDropdownScale.range()[0])
//     .attr("x2", sliderDropdownScale.range()[1])
//     .attr("class", "track-inset")
//     .select(function() {
//       return this.parentNode;
//     })
//     .append("line")
//     .attr("x1", sliderDropdownScale.range()[0])
//     .attr("x2", sliderDropdownScale.range()[1])
//     .attr("class", "track-overlay")
//     .call(d3.drag()
//       .on("start.interrupt", function() {
//         sliderDropdown.interrupt();
//       })
//       .on("start drag", function() {
//         // console.log("filtering for workers > ", sliderDropdownScale.invert(d3.event.x));
//         updateNodesDropdown(sliderDropdownScale.invert(d3.event.x));
//       }));

//     handleDropdown.remove();
//     var handleDropdown = sliderDropdown.insert("circle", ".track-overlay")
//       .attr("class", "handle")
//       .attr("r", 9);

//   })

// //////////////// Filter Functions 1: Dropdown //////////////////////

// // filtered IDs
// listToDeleteDropdown = [];

// function filterNodesDropdown(dropdownMin) { // return nodes with workers > "dropdownMin"
// store.forEach(function(d) {
//     // first, take any nodes off the list
//     if (listToDeleteDropdown.includes(d.id)) listToDeleteDropdown.splice(listToDeleteDropdown.indexOf(d.id),1);
//     // then if you're under the min (bad) && if you're not on the list
//     if (d[dropdown1.value] < dropdownMin && !listToDeleteDropdown.includes(d.id)) {
//       // put you on the list
//       listToDeleteDropdown.push(d.id);
//     }
//   });
//   // reset the graph
//   graph = [];
//   //  add and remove nodes from data based on filters
//   store.forEach(function(n) {
//     // if you're not on the filter list
//     if (n[dropdown1.value] >= dropdownMin && !listToDeleteDropdown.includes(n.id)) {
//       // put you on the graph         (start graph empty? or check)
//       graph.push(n);
//     } else if (n[dropdown1.value] < dropdownMin && listToDeleteDropdown.includes(n.id)) {
//       graph.forEach(function(d, i) {
//         if (n.id === d.id) {
//           graph.splice(i, 1);
//         }
//       })
//     };
//   });
//   return graph;
// }
// //  general update pattern for updating the graph
// function updateNodesDropdown(h) {
//   // update the slider handle position
//   handleDropdown.attr("cx", sliderDropdownScale(h));
//   //  UPDATE
//   circles = circles.data(filterNodesDropdown(h), function(d) { return d.id });
//   // EXIT
//   circles.exit().transition().duration(300)
//   // exit transition: "pop" radius * 1.5 + 5 & fade out
//   .attr("r", function(d) { return d.radius * 1.5 + 5 })
//   .attrTween("opacity", function(d) {
//     var i = d3.interpolate(1, 0);
//     return function(t) { return d.opacity = i(t); };
//   })
//   .remove();
//   // ENTER
//   enterUpdateCircles();
//   // simulation forces on filter
//   simulation.nodes(filterNodesDropdown(h))
//   .force("collide", forceCollide)
//   .force("cluster", forceCluster)
//   .force("gravity", forceGravity)
//   .force("x", forceXCombine)
//   .force("y", forceYCombine)
//   .on("tick", tick);
//   simulation.alphaTarget(0.2).restart();
// }















//////////////// Filter Sliders 2: Multiple Sliders from an Array //////////////////////





createSliders(sliderArrayMain, sliderTitlesArrayMain);



// createSliders(sliderArrayLang, sliderTitlesArrayLang);



function createSliders(createSliderArray, sliderTitlesArray){
// For Each Slider create the slider
  for(var i=0; i<createSliderArray.length; i++) {
    var column = 3, 
        xtranslate = 3,
        ytranslate = 0,
        posn = "relative";
  // Left column
	if(["Language skills", "Logic skills"].includes(sliderTitlesArray[i])){
 		column = 1;
 	}
 	 // Right column
	if(["Math skills", "Computer skills"].includes(sliderTitlesArray[i])){
 		column = 3;
	}
	// Bottom row
	if(["Logic skills", "Computer skills"].includes(sliderTitlesArray[i])){
		ytranslate = window.innerHeight/1.8;
    // posn = "fixed";
	}

  // Title & SVG
  var sliderButtonArrows = ["&#9660", "&#9650", "&#9660", "&#9650"];
  var sliderButtonPositions = [];

  sliderSVGArray[i] = d3.select("#sliderArray"+column)
  .append("div")
    .attr("id", "sliderDiv_"+sliderArrayMain[i]) // sliderDiv_skillsLang
    .style("position", "relative")
    .style("margin-top", ytranslate+"px")
    // lg and xl
    .html("<div class='d-none d-sm-none d-md-none d-lg-inline d-xl-inline' align='left' style='margin-left: "+(xtranslate)+"%;"
    	+"font-size: 150%; font-weight: bold;"
    	+" color:  #579E38; font-family: Raleway'>"
      +sliderTitlesArray[i] // "Language skills"
      +"<img class='d-none d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
      +"alt='help' height='21' width = '24'>"
      +"</div>"
    // md sm and xs
  +"<div class='d-inline d-sm-inline d-md-inline d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
      +"font-size: 150%; font-weight: bold;"
      +" color:  #579E38; font-family: Raleway'>"
      +sliderTitlesArray[i].substring(0,sliderTitlesArray[i].length - 7) // "Language skills"
      +"<img class='d-none d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
      +"alt='help' height='21' width = '24'>"
      +"</div>"
    // sm and xs
  // +"<div class='d-inline d-sm-inline d-md-none d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
  //     +"font-size: 100%; font-weight: bold;"
  //     +" color:  #579E38; font-family: Raleway'>"
  //     +sliderTitlesArray[i].substring(0,sliderTitlesArray[i].length - 7) // "Language skills"
  //     +"<img style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
  //     +"alt='help' height='21' width = '24'>"
  //     +"</div>"
      )
  .append("div")
    .attr("align", "left")
    .style("position", "relative")
    .style("margin-top", "19%")
    .style("margin-left", (xtranslate)+"%")
    .style("color", "#579E38")
    .style("font-weight", "bold")
    .style("font-family", "Raleway")
    .html("<div id='notmuchlots_"+i+"' class='d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='font-family: Raleway'>Not&nbspmuch"
      +"<span id='notmuchSpan_"+i+"' style='margin-left: "+window.innerWidth*0.135+"px'></span>"
      +"Lots</div>"+
      "<div id=subSliderDiv_"+i+">"+
      "<span class='expand-sliders-btn'>"+
        "<button style='margin: 5px 0px 0px 10px; width: "+window.innerWidth*0.205+"px; background: none; border: 2px solid green; border-radius: 16px;' "+
        "onclick='expandSliders("+i+")' type='button'>"+
          "<span style='font-family: Raleway; font-size: 15; font-weight: bold; color: #579E38;'>"+sliderButtonArrows[i]+" view "+sliderTitlesArrayMain[i].toLowerCase()+" "+sliderButtonArrows[i]+"</span>"+
        "</button>"+
      "</span></div>")
    .select(function() {
    return this.parentNode;
  	})
  .append("svg")
  	.style("z-index", 99)
  	.attr("viewBox", "0 0 "+250+" "+50)
    .style("position", "absolute")
    .style("top", window.innerHeight*0.0335+"px") // y position
    // .style("margin-left", -xtranslate+"%") // x position
    .attr("id", "slider_"+i)
    .attr("width", 250)
    .attr("height", 50);


  sliderSVGArray[i].attr("class", "d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline")


  // Scale
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){ return d[sliderArrayMain[i]]})])
    .range([0, 200]) // Width of slider is 200 px
    .clamp(true);
  // Bugfix: math max not working
  if(["Math skills"].includes(sliderTitlesArray[i])) {
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, 59])
    .range([0, 200]) // Width of slider is 200 px
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
    // console.log("i4: ", i);
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
      updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x)); // pass the current line id to update function
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

// y-translate map
// map slider name to y position
var sliderYTranslateMap = new Map();

for (var i = sliderTitlesArrayLang.length - 1; i >= 0; i--) {
  sliderYTranslateMap.set(sliderTitlesArrayLang[i], window.innerHeight*0.08*i)
}

for (var i = sliderTitlesArrayLogi.length - 1; i >= 0; i--) {
  sliderYTranslateMap.set(sliderTitlesArrayLogi[i], window.innerHeight*0.08*i+180)
}

for (var i = sliderTitlesArrayMath.length - 1; i >= 0; i--) {
  sliderYTranslateMap.set(sliderTitlesArrayMath[i], window.innerHeight*0.08*i)
}

for (var i = sliderTitlesArrayComp.length - 1; i >= 0; i--) {
  sliderYTranslateMap.set(sliderTitlesArrayComp[i], window.innerHeight*0.08*i+180)
}

var sliderXTranslateMap = new Map();
var fontSizeMap = new Map();

for (var i = sliderTitlesArray.length - 1; i >= 0; i--) {
  fontSizeMap.set(sliderTitlesArray[i], 115)
}

for (var i = sliderTitlesArrayLang.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayLang[i], 10)
  if(["Job Task Planning and Organizing","Measurement and Calculation",
    "Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayLang[i])){
      fontSizeMap.set(sliderTitlesArrayLang[i], 90)
  }
}

for (var i = sliderTitlesArrayLogi.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayLogi[i], 10)
  if(["Job Task Planning and Organizing","Measurement and Calculation",
    "Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayLogi[i])){
      fontSizeMap.set(sliderTitlesArrayLogi[i], 90)
  }
}

for (var i = sliderTitlesArrayMath.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayMath[i], 5)
  if(["Job Task Planning and Organizing","Measurement and Calculation"].includes(sliderTitlesArrayMath[i])){
      fontSizeMap.set(sliderTitlesArrayMath[i], 90)
  }
  if(["Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayMath[i])){
      fontSizeMap.set(sliderTitlesArrayMath[i], 70)
  }
}

for (var i = sliderTitlesArrayComp.length - 1; i >= 0; i--) {
  sliderXTranslateMap.set(sliderTitlesArrayComp[i], 5)
  if(["Job Task Planning and Organizing","Measurement and Calculation",
    "Scheduling or Budgeting and Accounting", ].includes(sliderTitlesArrayComp[i])){
      fontSizeMap.set(sliderTitlesArrayComp[i], 90)
  }
}



createSubSliders(sliderArrayLang, sliderTitlesArrayLang, 1, 4);

createSubSliders(sliderArrayLogi, sliderTitlesArrayLogi, 1, 7);

createSubSliders(sliderArrayMath, sliderTitlesArrayMath, 3, 11);

createSubSliders(sliderArrayComp, sliderTitlesArrayComp, 3, 15);




function createSubSliders(subSliderArray, subSliderTitlesArray, parentSliderColumn, indexIn_sliderArray){
  
  // For Each Slider create the slider
  for(var i=0; i<subSliderArray.length; i++) {
    
    // sliderPositionsArray, 
    // sliderScaleArray, and handleArray
    // are used in filterAll() and updateMulti() 
    // so they must include all sliders 
    // --> increment i by j
    var j = indexIn_sliderArray;

    var xtranslate = 13,
        ytranslate = 0,
    // Left column

    ytranslate = sliderYTranslateMap.get(subSliderTitlesArray[i])
    xtranslate = sliderXTranslateMap.get(subSliderTitlesArray[i])

    // Title & SVG
    sliderSVGArray[i+j] = d3.select("#sliderArray"+parentSliderColumn)
      .append("div").style("display","inline")
        .attr("id", "sliderDiv_"+subSliderArray[i]) // sliderDiv_skillsLang
        .style("position", "absolute")
        .style("top", ytranslate+160+"px")
        // lg and xl
        .html("<div class='d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline' align='left' style='margin-left: "+(xtranslate)+"%;"
          +"font-size: "+fontSizeMap.get(subSliderTitlesArray[i])+"%; font-weight: bold;"
          +" color:  #579E38; font-family: Raleway'>"
          +subSliderTitlesArray[i] // "Language skills"
          // +"<img class='d-none d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
          // +"alt='help' height='21' width = '24'>"
          +"</div>"
        // md sm and xs
      // +"<div class='d-inline d-sm-inline d-md-inline d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
      //     +"font-size: 115%; font-weight: bold;"
      //     +" color:  #579E38; font-family: Raleway'>"
      //     +subSliderTitlesArray[i].substring(0,subSliderTitlesArray[i].length - 7)+"..." // "Language skills"
      //     // +"<img class='d-none d-sm-inline d-md-inline d-lg-inline d-xl-inline' style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
      //     // +"alt='help' height='21' width = '24'>"
      //     +"</div>"
        // sm and xs
      // +"<div class='d-inline d-sm-inline d-md-none d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
      //     +"font-size: 100%; font-weight: bold;"
      //     +" color:  #579E38; font-family: Raleway'>"
      //     +subSliderTitlesArray[i].substring(0,subSliderTitlesArray[i].length - 7) // "Language skills"
      //     +"<img style='padding-left: 5px; padding-bottom: 2px;' src='img/question.png' "
      //     +"alt='help' height='21' width = '24'>"
      //     +"</div>"
          )
      .append("div").attr("id", "sliderDiv2_"+subSliderArray[i])
        .attr("align", "left")
        .style("position", "relative")
        .style("margin-top", "19%")
        .style("margin-left", 13+"%")
        .style("color", "#579E38")
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
        .style("left", xtranslate+"px")
        .attr("viewBox", "0 10 "+250+" "+50)
        .style("position", "absolute")
        .style("top", window.innerHeight*0.0335+"px") // y position
        // .style("margin-left", -xtranslate+"%") // x position
        .attr("id", "slider_"+i+j)
        .attr("width", 250)
        .attr("height", 50);


     
    sliderSVGArray[i+j].attr("class", "d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline")

    // hide until shown
    sliderSVGArray[i+j].style("display","none")
    // d3.select("#sliderDiv2_"+sliderArray[i+j]).style("visibility", "hidden")
    d3.select("#notmuchlots_"+i+j).style("visibility", "hidden")
    d3.select("#sliderDiv_"+subSliderArray[i]).style("visibility", "hidden")



    // Scale
    sliderScaleArray[i+j] = d3.scaleLinear()
      .domain([0, d3.max(nodes, function(d){ return d[subSliderArray[i]]})])
      .range([0, 200]) // Width of slider is 200 px
      .clamp(true);
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
        // console.log("i4: ", i);
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
          updateMulti(sliderScaleArray[event.target.id].invert(d3.event.x)); // pass the current line id to update function
        }));

    handleArray[i+j] = sliderMulti[i+j].insert("circle", ".track-overlay")
      .attr("class", "handle")
      .style("z-index", 99)
      .attr("r", 9);

      // Bugfix: lang slider not on top
    // if(["Language Skills"].includes(subSliderTitlesArray[i])) {
    //   d3.select("#"+i).style("z-index", 99);
    // }

  } //end for
};//end createSubSliders








// Update function which detects current slider
//  general update pattern for updating the graph
function updateMulti(h) {
 
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
};//end updateMulti




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
          console.log(sliderArray[s])
          console.log(d[sliderArray[s]])
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


})
} // end of d3.csv



















      ///////////////////// Search ///////////////////////
var searchExpanded = 0;

searchDiv = d3.select("body")
  .append("div")
    .style("width", "0px")
    .style("height", "40px")
    .style("position", "absolute")
    .style("top", "33px")
    .style("right", "77px")
    // .style("background-color", "black")
    // .style("border", "1px solid grey")
    .style("border-radius", "7px")
    .style("visibility", "hidden")
    // .style("visibility", "visible")
    .html("<input id='jobTitle' placeholder='Search job titles' class='d-inline form-control' "+
           "style='padding-bottom: 8px; width: 70%' type='text' "+
           "onkeydown='if (event.keyCode == 13) searchJobTitles()'>"+
          "<button id='searchSubmitBtn' class='d-inline btn btn-default' onclick='searchJobTitles()'>Submit</button>"
          )




var searchExpanded = 0;



function expandSearch() {

  searchExpanded = 1-searchExpanded;
  if(searchExpanded == 1){
    searchDiv.style("visibility", "visible")
      .transition().duration(500).style("width", window.innerWidth/2 - 40 + "px")
        
  }
  if(searchExpanded == 0){
    searchDiv.transition().duration(500).style("width", "0px");
    setTimeout(function() {
        searchDiv.style("visibility", "hidden");
      }, 500);
  }
}

function searchJobTitles() {

var query = document.getElementById("jobTitle").value;

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
    .attr("cy", function(d){ return (1-d.automationRisk)*height*0.9 - height/2 + 100})
  } else if (futureMode == 1) {
    circles
    .attr("cx", function(d){ return futurePositions[d.id][0] })
    .attr("cy", function(d){ return futurePositions[d.id][1] })
    .attr("r", function(d) { return d.radius; })
    .style("fill", function(d) { return d.color; })
    .style("stroke", "black")
  }

}


function filterBySearch() {
  // h = sliderScaleArray[event.target.id].invert(d3.event.x)
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
      if(d.job.indexOf(query) == -1 && !listToDeleteMulti.includes(d.id)) {
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
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////
/////////////////////////////////// Expand Subskill Sliders buttons /////////////////////////////////////

// (1: Language 2: Logic 3: Math 4: Computer)

// create 4 none subslider divs 
var subSliderDivLang;
var subSliderDivLogi;
var subSliderDivMath;
var subSliderDivComp;

  subSliderDivLang = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_0")
      .style("width", "250px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.26+"px")
      .style("left", window.innerWidth*0.032+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")

  subSliderDivLogi = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_1")
      .style("width", "250px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.95+"px")
      .style("left", window.innerWidth*0.034+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")

  subSliderDivMath = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_0")
      .style("width", "250px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.26+"px")
      .style("right", window.innerWidth*0.014+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")

  subSliderDivComp = d3.select("body")
    .append("div")
      .attr("id", "subSliderWindow_1")
      .style("width", "250px")
      .style("height", "0px")
      .style("position", "absolute")
      .style("top", window.innerHeight*0.95+"px")
      .style("right", window.innerWidth*0.014+"px")
      .style("border", "2px solid green")
      .style("border-radius", "16px")
      .style("visibility", "hidden")

// createSubSliders(sliderArrayLang, sliderTitlesArrayLang, 1, 4);

// createSubSliders(sliderArrayLogi, sliderTitlesArrayLogi, 1, 8);

// createSubSliders(sliderArrayMath, sliderTitlesArrayMath, 3, 12);

// createSubSliders(sliderArrayComp, sliderTitlesArrayComp, 3, 16);


var slidersExpanded = [0,0,0,0];

function expandSliders(sliderGroup) { // (1: Language 2: Logic 3: Math 4: Computer)

  slidersExpanded[sliderGroup] = 1-slidersExpanded[sliderGroup];

  switch (sliderGroup) {

    case 0: // Language

      if(slidersExpanded[0] == 1){ // on
        
        //if any others are on, turn them off
        if(slidersExpanded[1] == 1){
          slidersExpanded[1] = 0;
          hideLogi() }
        if(slidersExpanded[2] == 1){ 
          slidersExpanded[2] = 0;
          hideMath() }
        if(slidersExpanded[3] == 1){ 
          slidersExpanded[3] = 0;
          hideComp() }

        subSliderDivLang.style("visibility", "visible")
          .transition().duration(500).style("height", window.innerHeight*0.25+"px");

        setTimeout(function() {
          for(var i=4; i<7; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 500);
      }
      if(slidersExpanded[0] == 0){ // off
        hideLang()
      }
      
    case 1: // Logic

      if(slidersExpanded[1] == 1){ // on

        //if any others are on, turn them off
        if(slidersExpanded[0] == 1){
          slidersExpanded[0] = 0;
          hideLang() }
        if(slidersExpanded[2] == 1){ 
          slidersExpanded[2] = 0;
          hideMath() }
        if(slidersExpanded[3] == 1){ 
          slidersExpanded[3] = 0;
          hideComp() }

        subSliderDivLogi.style("visibility", "visible")
          .transition().duration(500).style("height", window.innerHeight*0.35+"px")
          .style("top", window.innerHeight*0.45+"px");

        setTimeout(function() {
          for(var i=7; i<11; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 500);
      }
      if(slidersExpanded[1] == 0){ // off
        hideLogi()
      }
      
    case 2: // Math

      if(slidersExpanded[2] == 1){ // on

        //if any others are on, turn them off
        if(slidersExpanded[0] == 1){
          slidersExpanded[0] = 0;
          hideLang() }
        if(slidersExpanded[1] == 1){ 
          slidersExpanded[1] = 0;
          hideLogi() }
        if(slidersExpanded[3] == 1){ 
          slidersExpanded[3] = 0;
          hideComp() }

        subSliderDivMath.style("visibility", "visible")
          .transition().duration(500).style("height", window.innerHeight*0.35+"px");

        setTimeout(function() {
          for(var i=11; i<15; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 500);
      }
      if(slidersExpanded[2] == 0){ // off
        hideMath()
      }
      
    case 3: // Computers

      if(slidersExpanded[3] == 1){ // on

        //if any others are on, turn them off
        if(slidersExpanded[0] == 1){
          slidersExpanded[0] = 0;
          hideLang() }
        if(slidersExpanded[2] == 1){ 
          slidersExpanded[2] = 0;
          hideMath() }
        if(slidersExpanded[1] == 1){ 
          slidersExpanded[1] = 0;
          hideLogi() }

        subSliderDivComp.style("visibility", "visible")
          .transition().duration(500).style("height", window.innerHeight*0.35+"px")
          .style("top", window.innerHeight*0.45+"px");

        setTimeout(function() {
          for(var i=15; i<19; i++){ // unhide the sliders
            sliderSVGArray[i].style("display", "inline");
            handleArray[i].style("display", "inline");
            sliderMulti[i].style("display", "inline")
            d3.select("#sliderDiv2_"+sliderArray[i]).style("visibility", "visible");
            // d3.select("#notmuchlots_"+i+4).style("visibility", "visible");
            d3.select("#sliderDiv_"+sliderArray[i]).style("visibility", "visible");
          }
        }, 500);
      }
      if(slidersExpanded[3] == 0){ // off
        hideComp()
      }
      
  }
}

function hideLang() {
  subSliderDivLang.transition().duration(500).style("height", "0px");
  setTimeout(function() {
      subSliderDivLang.style("visibility", "hidden");
    }, 500);

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
  subSliderDivLogi.transition().duration(500).style("height", "0px")
  .style("top", window.innerHeight*0.95+"px");

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
  subSliderDivMath.transition().duration(500).style("height", "0px");
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
  subSliderDivComp.transition().duration(500).style("height", "0px")
  .style("top", window.innerHeight*0.95+"px");

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
// add onclick buttons

// onclick, append? 4 subskill sliders, or remove subskill sliders
// easier? to show/hide them, append on creation (bit more latency)