var circles, faveCircles, faveNodes, drag_handler, enterUpdateCircles, graphMode, futureMode, simulation, listToDeleteMulti,
forceCollide, forceXCombine, forceYCombine, forceGravity, forceXSeparate, forceYSeparate, 
forceXSeparateRandom, forceYSeparateRandom, forceCluster, tick, legend, graphYtranslate, graphXtranslate, currentMode, resetFilters, compressY, width, height, maxWorkers, maxSalary,
hoverTimeout, currentMode, graphExplain, axisXtranslate, axisYtranslate;

maxSalary = 132.922; //busted
graphXtranslate = 0;
currentMode = 0;

expandedRadius = $(window).height()*0.045;
collapsedRadius = $(window).height()*0.007;

function resetFilters(){} // global function holder to resolve scope issue
// function resetSimulation(){} // global function holder to resolve scope issue
// function restartSimulation(){} // global function holder to resolve scope issue

function getBbox(element) {
  return document.getElementById(element).getBoundingClientRect()
}

function fillArray(value, len) {
  if (len == 0) return [];
  var a = [value];
  while (a.length * 2 <= len) a = a.concat(a);
  if (a.length < len) a = a.concat(a.slice(0, len - a.length));
  return a;
}

var favourites = fillArray(0,494); // list of favourited circles, 494 * 0 to start


var circleExpanded = []; // whether or not the current circle is expanded
var circlesExpanded = 0;
var legendCreated = 0;
var graphFirstTime = true;
var favesMode = 0;
var legendMode = 0;
var equalRadius = 9;
var nodePadding = 1;
var imgRadius = 125;

function getSum(total, num) {
  return total + num;
}

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

// var sliderTitlesArray = ["Communication <p class='sliderText'>and Verbal skills</p>", "Logic and <p class='sliderText'>Reasoning skills</p>", "Math and <p class='sliderText'>Spatial skills</p>", "Computer and <p class='sliderText'>Information skills</p>",
//   // subskills
//     "Data Analysis","Decision-Making","Finding Information","Job Task Planning and Organizing",
//     "Measurement and Calculation","Money Math","Numerical Estimation","Oral Communication",
//     "Problem Solving","Reading","Scheduling or Budgeting and Accounting","Digital Technology",
//     "Document Use","Writing","Critical Thinking"
//     ];

var sliderTitlesArray = [
// "Communication <p class='sliderText'>and Verbal skills</p>", "Logic and <p class='sliderText'>Reasoning skills</p>", "Math and <p class='sliderText'>Spatial skills</p>", "Computer and <p class='sliderText'>Information skills</p>",
  // subskills
    "Oral Communication","Reading","Writing",
    "Job Task Planning and Organizing","Problem Solving","Critical Thinking","Decision-Making",
    "Measurement and Calculation","Money Math","Numerical Estimation","Scheduling or Budgeting and Accounting",
    "Data Analysis","Finding Information","Digital Technology","Document Use"
    ];

var sliderArrayMain = ["skillsLang", "skillsLogi", "skillsMath", "skillsComp"];

var sliderTitlesArrayMain = [
"Communication <p class='sliderText'>and Verbal skills</p>", "Logic and <p class='sliderText'>Reasoning skills</p>", "Math and <p class='sliderText'>Spatial skills</p>", "Computer and <p class='sliderText'>Information skills</p>",
];
var sliderTitlesArrayMainCompact = [
"Communication skills", "Logic skills", "Math skills", "Computer skills",
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

var colourLegendMode = 0;


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



// Viz dimensions & margins
var margin = {top: 20, right: 20, bottom: 50, left: 50};
width = window.innerWidth/1.5, // set chart dimensions
height = window.innerHeight/1.5,
    maxRadius = 30; // Max circle radius



///////////////// TODO: Mobile version /////////////////

d3.select(window).on("resize", function() {
  resize();
  forceCollide = d3.forceCollide($(window).height()*0.009)
  forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)
  simulation.force("collide", forceCollide).force("gravity", forceGravity)
  
  if(graphMode==0){
    simulation.alpha(0.25).alphaTarget(0.001).restart();
  }

});

function resize() {
  // desktop, tablet, mobile
  // mobile: min-width: 320
  // tablet: min-width: 768
  // desktop: min-width: 1224
  var w = $(window).width();
  // console.log("width: "+w+"px")
  var h = $(window).height();
  // console.log(w+" x "+h)

  // reposition #svgCanvas and .annotation-group
  // 1. recalculate 
  // 2. reposition

  // mobile
  if(w >= 320){
    d3.select("#searchDiv")
    .style("width", function(){
      var linksBbox = document.getElementById("tabletLinks").getBoundingClientRect()
      return w - linksBbox.right - 100 + "px"
    }) 
  }else{

  }
  // tablet
  if(w >= 768) {
    d3.select("#searchDiv")
    .style("width", function(){
      var linksBbox = document.getElementById("links-top").getBoundingClientRect()
      return w - linksBbox.right - 110 + "px"
    })
  }else{

  }
  // laptop & desktop
  if(w >= 768) {
    d3.select("#searchDiv")
    .style("width", function(){
      var linksBbox = document.getElementById("links-top").getBoundingClientRect()
      return w - linksBbox.right - 110 + "px"
    })
  }else{

  }

  if(w < 768){ // bookmarklet todo: style tablet navbar, decide on 3 breakpoints

    d3.select("#btnColours")
    .style("position","fixed")
    .style("left","32px")
    .style("bottom","180px")
    d3.select("#btnSizes")
    .style("position","fixed")
    .style("right","32px")
    .style("bottom","180px")


    d3.select("#sliderDiv_skillsComp").style("bottom", "1vh")
    d3.select("#sliderDiv_skillsMath").style("bottom", "1vh")
    d3.select("#sliderDiv_skillsLang").style("top", "5vh")
    d3.select("#sliderDiv_skillsLogi").style("top", "5vh")

    d3.select("#resetFilters").html("<i class='fa fa-undo-alt'></i>")
       .style("width","85px") .style("margin-bottom","-15px")
    d3.select("#graph").html("<i class='fa fa-chart-bar'></i>")
       .style("width","85px") .style("margin-bottom","-15px")

    $("#titleBar").hide()
  }else{ // if w > 768 (desktop)

    if(graphMode == 0){
      d3.select("#btnColours")
      .style("position","fixed")
      .style("left","45px")
      .style("bottom","255px")
      d3.select("#btnSizes")
      .style("position","fixed")
      .style("right","45px")
      .style("bottom","255px")

      d3.select("#sliderDiv_skillsComp").style("bottom", "9vh")
      d3.select("#sliderDiv_skillsMath").style("bottom", "9vh")
      d3.select("#sliderDiv_skillsLang").style("top", "9vh")
      d3.select("#sliderDiv_skillsLogi").style("top", "9vh")

    } else if(graphMode == 1){
      d3.select("#btnColours")
      .style("position","fixed")
      .style("left","5px")
      .style("bottom","180px")
      d3.select("#btnSizes")
      .style("position","fixed")
      .style("right","5px")
      .style("bottom","180px")
    
      d3.select("#sliderDiv_skillsComp").style("bottom", "1vh")
      d3.select("#sliderDiv_skillsMath").style("bottom", "1vh")
      d3.select("#sliderDiv_skillsLang").style("top", "5vh")
      d3.select("#sliderDiv_skillsLogi").style("top", "5vh")

    }

    $("#titleBar").show()
    d3.select("#resetFilters").html("<span style='padding-right: 6px;'>" +
      "Reset Filters</span> <i class='fa fa-undo-alt'></i>")
       .style("width","185px") .style("margin-bottom","25px")
    d3.select("#graph").html("<span>Graph View&nbsp&nbsp</span><img width='30px' style='padding-bottom: 3px;' id='graphToggle' src='img/toggle-off.png'></img>"
      ).style("width","185px") .style("margin-bottom","-15px")
  }

  if(w < 1024){

    // d3.select("#chart").style("margin-top","-20px")
    // d3.select("#titleBar").style("margin-top","-10px")
    // .style("margin-left","20px")
    d3.select("#viewButtons").style("margin-top","-20px")
    d3.select("#bottomButtons").style("bottom","7.5vh")
    // d3.select("#legend") .style("margin-right","25px")
    // d3.select("#legend") .style("margin-left","60px")
    d3.select("#sliderDiv_skillsLang").style("left", "0vw")
    d3.select("#sliderDiv_skillsLogi").style("right", "1.5vw")
    d3.select("#sliderDiv_skillsComp").style("left", "0vw")
    d3.select("#sliderDiv_skillsMath").style("right", "1.5vw")

    if(graphMode==1){
      d3.selectAll(".imgGraphExplain").style("right","20px")
    }
    // d3.selectAll(".btn-legend").style("margin","5px").style("float","right")
  }else{

   if(graphMode == 0){
    d3.select("#btnColours")
    .style("position","fixed")
    .style("left",$(window).width()*0.14+"px")
    .style("bottom",$(window).height()*0.461+"px")
    d3.select("#btnSizes")
    .style("position","fixed")
    .style("right",$(window).width()*0.14+"px")
    .style("bottom",$(window).height()*0.461+"px")
  }else if(graphMode == 1){
    d3.select("#btnColours")
    .style("position","fixed")
    .style("left","25px")
    .style("bottom","180px")
    d3.select("#btnSizes")
    .style("position","fixed")
    .style("right","25px")
    .style("bottom","180px")

    d3.select(".imgGraphExplain").style("right","100px")

  }

    // d3.select("#chart").style("margin-top","")
    // d3.select("#titleBar").style("margin-top","-0.35vh")
    // .style("margin-left","9vw")
    d3.select("#viewButtons") .style("margin-top","10px")
    d3.select("#bottomButtons") .style("bottom","8vh")
    // d3.selectAll(".btn-legend").style("margin","5px")
    d3.select("#sliderDiv_skillsLang").style("left", "9vw")
    d3.select("#sliderDiv_skillsLogi").style("right", "9vw")
    d3.select("#sliderDiv_skillsComp").style("left", "9vw")
    d3.select("#sliderDiv_skillsMath").style("right", "9vw")
  }

  if(typeof circles != "undefined"){
    circles.attr("transform", circleHeight(0, -100+$(window).height()*0.080 )) //flag! need to make equation for width/height ratio
  }

  // move the axes
  if(typeof axisG != "undefined") {

    axisYtranslate = $(window).height()*-0.110;
    axisXtranslate = $(window).width()*-0.35+15;

    // axisG.attr("transform",c)
    // Add the X Axis
    axisX
    .attr("transform", circleHeight((axisXtranslate+2),(axisYtranslate*-1.945)) )

    // text label for the x axis
    axisLabelX
    .attr("transform", circleHeight((axisXtranslate*0.16),(axisYtranslate*-2.45)))

    // Add the Y Axis
    axisY
   .attr("transform",  circleHeight((axisXtranslate), (axisYtranslate*2.52)) )
     // text label for the y axis
    axisLabelY
    .attr("y", "10vw")
    .attr("x", "-28vh")

  }


  if(window.innerWidth<641){ // Phones
    margin = {top: 20, right: 12, bottom: 20, left: 12}
  }
} // end of resize()


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
  r = collapsedRadius, // start equal radii
  d = {
    id: +el.id,
    favourited: 0,
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
    industryNum: +el.industryNum, 
    noc: el.noc, 
    workers: +el.workers,
    wage: el.wage,
    salaryMed: el.salaryMed,
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
  if (!clusters[i] || (d.workers > clusters[i].workers)) clusters[i] = d;
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
var forceCollide = d3.forceCollide($(window).height()*0.009)
var forceXCombine = d3.forceX().strength(.4)
var forceYCombine = d3.forceY().strength(.4)
// default strength = -30, negative strength = repel, positive = attract
var forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)
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
  for (var i = 0, n = nodes.length, node, cluster, k = alpha * 0.12; i < n; ++i) {
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
tick = function() {

  circles
  .attr("cx", function(d) { 


      // if sticky
      // if(sticky[d.id] == 2){
      //   // stuck
      //   return window.innerWidth*0.4 
      // } else if(sticky[d.id] == 1){
      //   return window.innerWidth*-0.4
      // } else {
      return d.x; 
      // }
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
  .append('svg').attr("id","svgCanvas").style("position","absolute").style("z-index", "-1")

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
    .attr("transform", circleHeight(0, -100+$(window).height()*0.080 ) )
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
        // //if not stuck
        // if(!sticky[d.id] == 1) {
          d3.select(this)
            .style("fill", color(d.cluster) )
            // .attr("stroke", "black")
            .style("stroke-width", 2)
            .attr("stroke", color(d.cluster));
        // } else { // if stuck
        //   d3.select(this)
        //     .style("fill", "url(#pattern_"+d.id+")")
        //     .attr("r","30px")

        // }
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
      
      // setTimeout(function() {
      // circles.transition().duration(2500).style("opacity",1)
        
      // }, 500)


d3.select("#chart").on("click", function(d){
  // hide any subskill sliders
  hideAll();
  closeLegends();
  if (graphMode == 0 && legendMode == 1) {
    smashTogether(0.4, 0.25);
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

  var imgCircle = d3.select("#chart").append("circle")
    .attr("class","circleImg")
    .attr("cx",circLeft)
    .attr("cy",circTop)
    .attr("fill", "url(#pattern_"+d.id+")")
  // .append("image").attr("xlink:href","/img/NOC_images/"+d.noc+".jpg")
    // .attr("cy",d3.select(function(){return this.parentNode}).attr("cy"))
    // .attr("r",d3.select(function(d){return d.r}))
      // .transition().duration(350)
    .attr("r",imgRadius+"px")
    .style("stroke","black")
    .style("stroke-width","1")
    .style("position","fixed") //bookmark
    .style("z-index","999")
    .style("pointer-events","none")

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
          divLeft = window.innerWidth*0.5 + (d.x) + 10;
          divTop = window.innerHeight*0.25 + ((window.innerHeight-300)*(d.y/window.innerHeight));
        } else if (d3.event.pageX >= window.innerWidth/2) { // right side
          divLeft = window.innerWidth*0.5 + (d.x) - 370;
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
                    "<rect width='"+(350*d.salaryMed/maxSalary)+"' style='fill: #256D1B;' height='15'></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Arial' x='"+(Math.round((350*d.salaryMed/maxSalary+5)*100)/100)+"' y='9.5' dy='.35em'>$ "+Math.round(d.salaryMed*100)/100+"K per yr</text>"+
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
        "</svg>"+

        "<button id='btnSimilarSkills' class='btn btn-lg'"+
        "style='position: absolute; right: 17px; z-index: 999; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; margin-top: 11px; font-family: Raleway; background: white; color: " + color(d.cluster) +"'>"+
        "Similar jobs</button>"+

        "<button id='btnFavourite' class='btn btn-lg'"+
        "style='position: absolute; right: 17px; z-index: 999; box-shadow: 3px 3px 3px grey; font-size: 16px; font-weight: bold; margin-top: 11px; font-family: Raleway; background: white; color: " + color(d.cluster) +"'>"+
        "<i class='fa fa-star'></i>Favourite</button>"+

        "</div>")
        // Move div above mouse by "top" + radius and right by "left"
        .style("left", divLeft + "px")
        .style("background", color(d.cluster) )
        .style("top", (divTop) + "px")
        .style("z-index",999);

        d3.select("#btnSimilarSkills").style("margin-top","-110px").style("z-index",9999)
        d3.select("#btnFavourite").style("margin-top","-60px").style("z-index",9999)
        // d3.select("#btnSimilarSkills").style("top",(document.getElementById("tooltip3").getBoundingClientRect.height-120)+"px")
        // d3.select("#btnFavourite").style("top",(document.getElementById("tooltip3").getBoundingClientRect.height-70)+"px")

        if(d.favourited==1){
          d3.select("#btnFavourite")
          .html("<i class='fa fa-star'></i>Favourited")
          .style("color","#ff9600")
        }

        d3.select("#btnFavourite").on("click", function() {
          d.favourited = 1-d.favourited // toggle status


          if(d.favourited==1){
            favourites[d.id]=1; // add to list of favourites

          // show sidebar if one or more favourites
            if(d3.select("#favesDiv").style("opacity")==0){
              d3.select("#favesDiv").transition().duration(500).style("opacity",1).style("pointer-events","auto")
            }

            d3.select("#btnFavourite")
            .html("<i class='fa fa-star'></i>Favourited")
            .style("color","#ff9600")
          } else {

            favourites[d.id]=0; // remove from list of favourites
            // if no favourites, hide the sidebar
            if(favourites.reduce(getSum)==0){
              d3.select("#favesDiv").transition().duration(500).style("opacity",0).style("pointer-events","none")}

            d3.select("#btnFavourite")
            .html("<i class='fa fa-star'></i>Favourite")
            .style("color",color(d.cluster))
          }

          appendFavourites()

        })

          // set filter levels to this job group's levels
        d3.select("#btnSimilarSkills").on("click", function() {
          // for each skill in main skills and sub skills
          // set skill slider to that level
          for(var sliderID in sliderArray){
            sliderPositionsArray[sliderID] = d[sliderArray[sliderID]];
          }

          // then continue the rest of updateMulti()
          var filteredNodes = filterAll()
          //  UPDATE
          circles = circles.data(filteredNodes, function(d) { return d.id });

          // EXIT
          circles.exit().transition().duration(500)
          // exit transition: "pop" radius * 1.5 + 5 & fade out
          .attr("r", $(window).height()*0.03)
          .styleTween("opacity", function(d) {
            var i = d3.interpolate(1, 0);
            return function(t) { return i(t); };
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
                    .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4 + graphXtranslate})
                    // y = Wage
                    .attr("cy", function(d){ return ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate});
                    break;

                    case 2:
                    circles
                    // x = Number of Jobs
                    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
                    // y = Wage
                    .attr("cy", function(d){ return ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate});
                    break;
                  // x = Number of Jobs
                  // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
                  case 3:
                  circles
                    // x = Number of Jobs
                    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
                    // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
                    .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
                    break;

                    case 4:
                    circles
                    // x = Number of Jobs
                    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
                    // y = Automation Risk
                    .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
                    break;

                case 5: // graph mode off
                circles
                .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left  + graphXtranslate})
                .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
                break;
              }

            }

          })
      // div2.transition()
      // .duration(200)
      // .style("left", (d3.event.pageX) + 20 + "px")
      // .style("top", (d3.event.pageY - 80) - d.radius + "px")
      // .style("opacity", .9)

      // div2.html("test")
      createHoverImg(d);


  }

  function tooltipLarge(d) {

  div2 = div.style("pointer-events","auto").append("div")
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
    .html(
      "<div id='tooltipBottomDiv2' style=' z-index: -1; margin-top: -15px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 16px; padding-top: 5px; padding-left: 10px; font-family: Raleway; color: " + colorTooltip(d.cluster)
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

        "</div>")
  d3.select("#tooltipBottomDiv").append("div")
  .attr("id","carousel")
  .html(
    "<div class='carouselTooltip'>"+
    "<div style='background: lavender'>Check out this sweet content Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis, iste.</div>"+
    "<div style='background: limegreen'>Oh wow some more content Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis, iste.</div>"+
    "<div style='background: yellow'>No way, even more content? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis, iste.</div>"+
    "</div>"
    )

  // $(document).ready(function(){
    $('.carouselTooltip').slick({
      autoplay: true
      // more settings at http://kenwheeler.github.io/slick/#settings
    // });
    });

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

  div2.transition().duration(250).style("height","250px");

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
                    "<rect width='"+(350*d.salaryMed/maxSalary)+"'  style='fill: #256D1B;'height='15' ></rect>"+
                    "<text style='fill: " + colorTooltip(d.cluster) +"; font-family: Raleway' x='"+(Math.round((350*d.salaryMed/maxSalary+5)*100)/100)+"' y='9.5' dy='.35em'>$ "+Math.round(d.salaryMed*100)/100+"K per yr</text>"+
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
        +"</div>")

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
.duration(2000)
.delay(function(d, i) { return i * 4})
.attrTween("r", function(d) {
  var i = d3.interpolate(0, collapsedRadius);
  return function(t) { return d.radius = i(t); };
})
.styleTween("opacity", function() {
  var i = d3.interpolate(0, 1);
  return function(t) { return i(t) }
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


  // // if in right sticky zone
  // if(d.x > window.innerWidth*0.4) { 
  //   // stick!
  //   sticky[d.id] = 2 // right side
  //   d3.select(this).style("fill", function(d) { return "url(#pattern_"+d.id+")" }).attr("stroke-width", "2px").attr("r","30px")
  // // if in left sticky zone
  // } else if (d.x < window.innerWidth*-0.4){
  //   sticky[d.id] = 1 // left side
  //   d3.select(this).style("fill", function(d) { return "url(#pattern_"+d.id+")" }).attr("stroke-width", "2px").attr("r","30px")
  // }

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
  colourLegendMode = 1
  if (graphMode == 0){
    // split the circles horizontally by cluster
    simulation
    .force("x", forceXSeparate).alpha(0.4)
    .force("y", forceYSeparate).alpha(0.4)
      .alphaTarget(0.001) // cool down to minimal temperature
      .restart()

    setTimeout(function(){
      createAnnotations("colours")

      d3.selectAll(".annotation-note-bg")
        .style("fill","white")
        .style("fill-opacity",0.7)

      d3.selectAll(".annotation-group")
        // .style("font-size","20px")
        .style("font-weight","bold")
        .style("fill","black")
      d3.selectAll(".annotation-note-label")
        .style("background","white").style("opacity",1)
    }, 3000)
  };

  legendMode = 1;

  // d3.select("#btnColours").on("click","")
  // fade Size Legend button 
  // d3.select("#btnSizes").transition().duration(250).style("opacity",0)

  // var bboxColours = document.getElementById("btnColours").getBoundingClientRect()
  // var bboxMath = document.getElementById("sliderDiv_skillsMath").getBoundingClientRect()

  // move size legend button right
  d3.select("#btnSizes").transition().duration(500)
  .style("right",$(window).width()*0.03+"px")

  d3.select("#btnColours").transition().duration(500)
  .style("left",$(window).width()*0.07+"px")
  .style("opacity",0.01)
  
  // expand colour legend
  d3.select("body")
    .append("div")
  .attr("id","legendDivColours")
    .style("font-weight","bold")
    .style("opacity",0)
    .style("border-radius","6px")
    .style("border","2px solid rgba(73, 172, 82, 0)")
    .style("bottom",function(){
      if($(window).width() >= 768){
        return ($(window).height()*0.5 - 275/2) +"px"
      }else if($(window).width() >= 320){
        return "100px"
      }
    })
    .style("left",function() {
      if($(window).width() >= 1024){
        return $(window).width()*0.06+"px"
      }else if($(window).width() >= 768){
        return $(window).width()*0.01+"px"
      }else if($(window).width() >= 320){
        return $(window).width()*0.06+"px"
      }
    })
    .transition().duration(375)
    .style("left",function() {
      if($(window).width() >= 768){
        return $(window).width()*0.03+"px"
      }else if($(window).width() >= 320){
        return $(window).width()*0.06+"px"
      }
    })
    .style("opacity",0.9)
    .style("background","white")
    .style("border","2px solid rgba(73, 172, 82, 1)") // fade in border
    .style("bottom",function(){
      if($(window).width() >= 768){
        return ($(window).height()*0.5 - 275/2) +"px"
      }else if($(window).width() >= 320){
        return "170px"
      }
    })

  d3.select("#btnColours").style("margin-right","18px")

  svgColoursLegend = d3.select("#legendDivColours")
      .html("")
      .append("svg").attr("id","svgColoursLegend")
        .style("margin-top","5px")
        .style("background","white")
        .style("height", "270px")
    
  legendCircles = d3.select("#svgColoursLegend").selectAll("circle").data(industriesArray).enter().append("circle")
      .attr("r", 0) // start at 0 radius and transition in
      .attr("class","legendCirc")
      .transition().duration(450).attr("r", 10)
      .attr("id",function(d,i) { return "legendCircle_"+i } )
      .attr("transform", function(d,i) { return "translate("+"14"+","+(12+i*27)+")" } ) //flag! need to make equation for width/height ratio
      .style("fill", function(d,i) { return color(i); })
      .attr("opacity",  function(d,i) {
        if( filteredIndustries.includes(+i) ) { 
          return 0.1 }
        else{ 
          return 1 }
      })

  legendTexts = svgColoursLegend.selectAll("text").data(industriesArray).enter().append("text")
      .attr("text-anchor","left")
      .attr("transform", function(d,i) { return "translate("+"32"+","+(17+i*27)+")" } )
      .text(function(d) { return d })
      .style("opacity",0).transition().duration(600).style("opacity",1)
  
      // append rect with on click event
  legendFilterCircles = d3.select("#svgColoursLegend").selectAll("rect").data(industriesArray).enter().append("rect")
        .attr("id",function(d,i){ return i+"_filterColoursRect" })
        .attr("class","legendBtn")
        // .style("fill","black")
        .attr("onclick",function(d,i) { return "filterIndustry("+(this.id.substring(0,1))+")" })
        .attr("width","320px")
        .attr("height","20px")
        .attr("transform", function(d,i) { return "translate("+"4"+","+(1+i*27)+")" } )



  if (graphMode == 0){
    d3.select("#legendDivColours").style("opacity",0.9)
    // d3.selectAll(".legendCirc").style("opacity",1)
  }

} // end expandColoursLegend()

function closeLegends() {
  colourLegendMode = 0
  d3.selectAll(".annotation-group").transition().duration(500).style("opacity",0).remove()

    if (graphMode == 0) {
    smashTogether(0.4, 0.25);
    }

  legendMode = 0;
  // reset Size Legend button
  d3.select("#btnSizes").transition().duration(300)
  .style("right",function(){
    if($(window).width() >= 1024){
      if(graphMode == 1){
        return "25px";
      }else{
        return $(window).width()*0.14+"px";
      }
    }else if($(window).width() >= 768){
      if(graphMode == 1){
        return "5px"
      }else{
        return 45+"px";
      }
    }else if($(window).width() >= 320){
      if(graphMode == 1){
        return "5px"
      }else{
        return "32px";
      }
    }
  }).style("opacity",1)
    // .style("height",legendButtonHeight+"px")
  .style("width",legendButtonWidth+"px").style("border-width","3px")
    
    setTimeout(function() {
      d3.select("#btnSizes")
      .html("Size<br>Legend")
      }, 300);

  // reset Colour Legend button
  d3.select("#btnColours")
  .transition().duration(300).style("opacity",1)
  .style("left",function(){
    if($(window).width() >= 1024){
      if(graphMode == 1){
        return "25px";
      }else{
        return $(window).width()*0.14+"px";
      }
    }else if($(window).width() >= 768){
      if(graphMode == 1){
        return "5px"
      }else{
        return 45+"px";
      }
    }else if($(window).width() >= 320){
      if(graphMode == 1){
        return "5px"
      }else{
        return "32px";
      }
    }
  })
  // .style("width", legendButtonWidth+"px")
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

  d3.select("#svgColoursLegend").selectAll("circle").transition().duration(400).attr("r", 0)
  d3.select("#svgSizesLegend").selectAll("circle").transition().duration(400).attr("r", 0)

  var bboxSizes = document.getElementById("btnSizes").getBoundingClientRect()

  d3.select("#legendDivColours").transition().duration(300)
      .style("bottom",function(){
        if($(window).width() >= 768){
          return $(window).height()/2 - 275/2 + "px"
        }else if($(window).width() >= 320){
          return "100px"
        }
      })
      .style("left",function() {
        if($(window).width() >= 1024){
          return $(window).width()*0.06+"px"
        }else if($(window).width() >= 768){
          return $(window).width()*0.03+"px"
        }else if($(window).width() >= 320){
          return $(window).width()*0.06+"px"
        }
      })
      .style("opacity",0).remove()

  d3.select("#legendDivSizes").transition().duration(300)
      .style("bottom",function(){
        if($(window).width() >= 768){
          return $(window).height()*0.39+"px"
        }else if($(window).width() >= 320){
          return "140px"
        }
      }).style("opacity",0).remove()

  d3.select("#sizeOptionsDiv")
      .transition().duration(400)
      .style("bottom",function(){
        if($(window).width() >= 768){
          return $(window).height()*0.41+"px";
        }else if($(window).width() >= 320){
          return "140px";
        }
      })

  d3.select("#svgSizesLegend").selectAll("text").transition().duration(300).style("opacity",0).remove()
  d3.select("#svgColoursLegend").selectAll("text").transition().duration(300).style("opacity",0).remove()
  d3.select("#sizeDropdownButton").transition().duration(300).style("opacity",0).remove()
  // legendTexts.selectAll("text").style("opacity",0).remove()

}




////////////////// SIZE LEGEND button

// size scales
var wageRadiusScale = d3.scaleSqrt() // Sqrt scale because radius
.domain([14, maxSalary]) // input
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
    for (var i = 1; i < 2; i++) {
      sizesArray.push(
        (i/2) * radiusScale(d3.max(nodes, function(d) { return d.workers }))
        )
      sizesValuesArray.push(
        (i/2) * d3.max(nodes, function(d) { return d.workers })
        )
    }
    break;
    case "salary":
    // add minima
    sizesArray.push(wageRadiusScale(14))
    sizesValuesArray.push("$ "+String(14).substring(0,2)+"K per yr")
    // split scales into 4 intervals after minimum
    for (var i = 1; i < 2; i++) {
      sizesArray.push(
        (i/2) * wageRadiusScale(maxSalary)
        )
      sizesValuesArray.push("$ "+String(
        (i/2) * maxSalary
        ).substring(0,2)+"K per yr")
    }
    break;
    case "yearsStudy":
    // add minima
    sizesArray.push(yearRadiusScale(d3.min(nodes, function(d) { return d.yearsStudy })))
    sizesValuesArray.push(d3.min(nodes, function(d) { return d.yearsStudy }))
    // split scales into 4 intervals after minimum
    for (var i = 1; i < 2; i++) {
      sizesArray.push(
        (i/2) * yearRadiusScale(d3.max(nodes, function(d) { return d.yearsStudy }))
        )
      sizesValuesArray.push(
        (i/2) * d3.max(nodes, function(d) { return d.yearsStudy })
        )
    }
    break;
    case "none":
    break;
  }

}

var currentSize = "nothing"

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

  // d3.select("#sizeDropdownDiv").remove()

  if(typeof sizesDiv != "undefined") {
    sizesDiv.remove()
  }

  d3.select("#btnSizes").on("click", "")

    var bboxSizes = document.getElementById("btnSizes").getBoundingClientRect()

    sizesDiv = d3.select("#btnSizes")
    .append("div").attr("id","legendDivSizes")

    // transition in fade from below
    d3.select("#legendDivSizes")
    .style("border-radius", "6px")
    .style("opacity", 0).style("border","2px solid rgba(73, 172, 82, 0)")
    .style("bottom",function(){
      if($(window).width() >= 768){
        return $(window).height()*0.41 +"px";
      }else if($(window).width() >= 320){
        return "140px";
      }
    })
    .transition().duration(350)
    .style("opacity", 1).style("border","2px solid rgba(73, 172, 82, 1)")
    .style("background","white")
    .style("bottom", function(){
      if($(window).width() >= 768){
        return $(window).height()*0.5-75 +"px";
      }else if($(window).width() >= 320){
        return "170px"
      }
    })
    // .text("")

    svgSizesLegend = d3.select("#legendDivSizes")
      .html("")
      .append("svg").attr("id","svgSizesLegend")

    if(currentSize!="nothing"){

      sizeCircles = svgSizesLegend.selectAll("circle").data(sizesArray).enter().append("circle")
          .attr("class","legendCircle")
          .attr("r", 0) // start at 0 radius and transition in
          .transition().duration(400).attr("r",  function(d,i) { 
            if(sizesArray.length < 2) { return sizesArray[i] }
            else{ return sizesArray[i]+5 }
          })
          .attr("transform", function(d,i) { return "translate("+(55 + i*95) + 
            // Math.pow(sizesArray[i], 1.6))+
          ","+"25"+")" } ) 
          .style("fill", "#B5ADAD")

      legendTexts = d3.select("#svgSizesLegend").selectAll("text").data(sizesValuesArray).enter().append("text")
          .attr("class","legendText")
          .attr("text-anchor","left")
          .attr("transform", function(d,i) { return "translate("+(40 + i*95) + 
            // Math.pow(sizesArray[i], 1.6))+
          ","+"60"+")" } ) 
          .text(function(d,i) { if(i==0){ return "Less" }else if(i==1){ return "More" } })
          .style("opacity",0).transition().duration(600).style("opacity",1)

    }
    
    if(currentSize=="nothing"){
      d3.select("#svgSizesLegend").append("text")
      .attr("class","legendText")
      .attr("text-anchor","left")
      .attr("transform","translate(73,45)")
      .text("Equal sizes")
      .style("opacity",0).transition().duration(600).style("opacity",1)
    }

    // size buttons
    sizesOptions = d3.select("#legendDivSizes").append("div")
      .attr("id","sizeOptionsDiv")
      .style("width", "220px")
      .style("bottom",function(){
        if($(window).width() >= 768){
          return $(window).height()*0.41+"px"
        }else if($(window).width() >= 320){
          return "140px"
        }
      })
      
      sizesOptions
      .transition().duration(400)
      .style("bottom",function(){
        if($(window).width() >= 768){
          return $(window).height()*0.5-75+"px";
        }else if($(window).width() >= 320){
          return "170px";
        }
      })
    
    // sizesOptions.transition().duration(350)
    //   .style("bottom",function(){
    //     if($(window).width() >= 768){
    //       return $(window).width()*0.5-75+"px"
    //     }else if($(window).width() >= 320){
    //       return "170px"
    //     }
    //   })

    sizesOptions.append("button").attr("id","workLink")
      .style("float","left")
      .attr("class","btnSizesOption")
      .text("Number of jobs")
      .style("color",function(){
        if(currentSize == "Number of Jobs"){return "white"}else{return "#49AC52"}
      })
      .style("background",function(){
        if(currentSize == "Number of Jobs"){return "#49AC52"}else{return "white"}
      })
    sizesOptions.append("button").attr("id","yearLink")
      .style("float","left")
      .attr("class","btnSizesOption")
      .text("Years of study")
      .style("color",function(){
        if(currentSize == "Years of Study"){return "white"}else{return "#49AC52"}
      })
      .style("background",function(){
        if(currentSize == "Years of Study"){return "#49AC52"}else{return "white"}
      })
    sizesOptions.append("button").attr("id","wageLink")
      .style("float","left")
      .attr("class","btnSizesOption")
      .text("Salary ($K per yr)")
      .style("color",function(){
        if(currentSize == "Salary ($K per yr)"){return "white"}else{return "#49AC52"}
      })
      .style("background",function(){
        if(currentSize == "Salary ($K per yr)"){return "#49AC52"}else{return "white"}
      })
    sizesOptions.append("button").attr("id","equaLink")
      .style("float","left")
      .attr("class","btnSizesOption")
      .text("Equal sizes")
      .style("color",function(){
        if(currentSize == "nothing"){return "white"}else{return "#49AC52"}
      })
      .style("background",function(){
        if(currentSize == "nothing"){return "#49AC52"}else{return "white"}
      })

    // click "Number of Jobs"
    d3.select("#workLink").on("click", function() {
      // reset all buttons & colour this button green      
      d3.selectAll(".btnSizesOption").style("color","#49AC52").style("background","white")
      d3.select(this).style("color","white").style("background","#49AC52")
      // transition radii to selected values
      circles.transition().duration(100)
        .delay(function(d, i) { return i * 0.8})
        .attrTween("r", function(d) {
          var i = d3.interpolate(d.radius, radiusScale(d.workers));
          return function(t) { return d.radius = i(t); };
        });
      // reset forces
      forceGravity = d3.forceManyBody().strength(function(d){return d.radius*-11})
      forceCollide = d3.forceCollide(function(d){return d.radius + nodePadding})
      // if simulation active, reset simulation with new radius-appropriate forces
      if(graphMode == 0 && colourLegendMode == 0) {
        simulation
        .force("collide", forceCollide)
        .force("gravity", forceGravity)
        setTimeout(function() { resetSimulation() }, 700);
        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      } else if(graphMode == 0 && colourLegendMode == 1){
        simulation
        .force("collide", forceCollide)
        setTimeout(function() {   
          forceGravity = d3.forceManyBody().strength(function(d){return d.radius*-11})
          forceCollide = d3.forceCollide(function(d){return d.radius + nodePadding})
          simulation.force("collide", forceCollide)
          .force("gravity", forceGravity)
          .on("tick", tick).alpha(0.1).alphaTarget(0.001).restart(); 
        }, 450);
        setTimeout(function(){
          d3.selectAll(".annotation-group").transition().duration(250).style("opacity",0).remove()
          // wait for transform before applying transformed annotations
          setTimeout(function() {
            createAnnotations("colours");
            d3.selectAll(".annotation-note-bg")
            .style("fill","white")
            .style("fill-opacity",0.7)

            d3.selectAll(".annotation-group")
            // .style("font-size","20px")
            .style("font-weight","bold")
            .style("fill","black")
            d3.selectAll(".annotation-note-label")
            .style("background","white").style("opacity",1)
          }, 300)
        }, 1000)

      }
      currentSize = "Number of Jobs"
      // document.getElementById("sizeDropdownButton").innerHTML = "Size by<br>"+currentSize;
      setSizes("workers")
      redrawSizeLegend()
    })

    // click "Salary ($K per yr)"
    d3.select("#wageLink").on("click", function() {
      // reset all buttons & colour this button green      
      d3.selectAll(".btnSizesOption").style("color","#49AC52").style("background","white")
      d3.select(this).style("color","white").style("background","#49AC52")
      // transition radii to selected values
      circles.transition().duration(100)
      .delay(function(d, i) { return i * 0.8})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, wageRadiusScale(d.salaryMed)/1.2);
        return function(t) { return d.radius = i(t); };
      });
      // reset forces
      forceGravity = d3.forceManyBody().strength(function(d){return d.radius*-11})
      forceCollide = d3.forceCollide(function(d){return d.radius + nodePadding})
      // if simulation active, reset simulation with new radius-appropriate forces
      if(graphMode == 0 && colourLegendMode == 0) {
        simulation
        .force("collide", forceCollide)
        .force("gravity", forceGravity)
        setTimeout(function() { resetSimulation() }, 700);
        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      } else if(graphMode == 0 && colourLegendMode == 1){
        simulation
        .force("collide", forceCollide)
        setTimeout(function() {   
          forceGravity = d3.forceManyBody().strength(function(d){return d.radius*-11})
          forceCollide = d3.forceCollide(function(d){return d.radius + nodePadding})
          simulation.force("collide", forceCollide)
          .force("gravity", forceGravity)
          .on("tick", tick).alpha(0.1).alphaTarget(0.001).restart(); 
        }, 450);
        setTimeout(function(){
          d3.selectAll(".annotation-group").transition().duration(250).style("opacity",0).remove()
          // wait for transform before applying transformed annotations
          setTimeout(function() {
            createAnnotations("colours");
            d3.selectAll(".annotation-note-bg")
            .style("fill","white")
            .style("fill-opacity",0.7)

            d3.selectAll(".annotation-group")
            // .style("font-size","20px")
            .style("font-weight","bold")
            .style("fill","black")
            d3.selectAll(".annotation-note-label")
            .style("background","white").style("opacity",1)
          }, 300)
        }, 1000)

      }
      currentSize = "Salary ($K per yr)"
      setSizes("salary")
      redrawSizeLegend()
    })

    // click "Years of study"
    d3.select("#yearLink").on("click", function() {
      // reset all buttons & colour this button green      
      d3.selectAll(".btnSizesOption").style("color","#49AC52").style("background","white")
      d3.select(this).style("color","white").style("background","#49AC52")
      // transition radii to selected values
      circles.transition().duration(100)
      .delay(function(d, i) { return i * 0.8})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, yearRadiusScale(d.yearsStudy));
        return function(t) { return d.radius = i(t); };
      });
      // reset forces
      forceGravity = d3.forceManyBody().strength(function(d){return d.radius*-11})
      forceCollide = d3.forceCollide(function(d){return d.radius + nodePadding})
      // if simulation active, reset simulation with new radius-appropriate forces
      if(graphMode == 0 && colourLegendMode == 0) {
        simulation
        .force("collide", forceCollide)
        .force("gravity", forceGravity)
        setTimeout(function() { resetSimulation() }, 700);
        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      } else if(graphMode == 0 && colourLegendMode == 1){
        simulation
        .force("collide", forceCollide)
        setTimeout(function() {   
          forceGravity = d3.forceManyBody().strength(function(d){return d.radius*-11})
          forceCollide = d3.forceCollide(function(d){return d.radius + nodePadding})
          simulation.force("collide", forceCollide)
          .force("gravity", forceGravity)
          .on("tick", tick).alpha(0.1).alphaTarget(0.001).restart(); 
        }, 450);
        setTimeout(function(){
          d3.selectAll(".annotation-group").transition().duration(500).style("opacity",0).remove()
          // wait for transform before applying transformed annotations
          setTimeout(function() {
            createAnnotations("colours");
            d3.selectAll(".annotation-note-bg")
            .style("fill","white")
            .style("fill-opacity",0.7)

            d3.selectAll(".annotation-group")
            // .style("font-size","20px")
            .style("font-weight","bold")
            .style("fill","black")
            d3.selectAll(".annotation-note-label")
            .style("background","white").style("opacity",1)
          }, 300)
        }, 450)

      }
      currentSize = "Years of Study"
      setSizes("yearsStudy")
      redrawSizeLegend()
    })

    // click "Equal sizes"
    d3.select("#equaLink").on("click", function() {
      d3.selectAll(".btnSizesOption").style("color","#49AC52").style("background","white")
      d3.select("#equaLink").style("color","white").style("background","#49AC52")
      resetSizes()
      redrawSizeLegend()
    })
} // end expandSizesLegend()
function resetSizes() {
        // reset all buttons & colour this button green      
      // transition radii to selected values
      circles.transition().duration(100)
      .delay(function(d, i) { return i * 0.8})
      .attrTween("r", function(d) {
        var i = d3.interpolate(d.radius, collapsedRadius);
        return function(t) { return d.radius = i(t); };
      })
      // reset forces
      forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)
      forceCollide = d3.forceCollide($(window).height()*0.009)
      // if simulation active, reset simulation with new radius-appropriate forces
      if(graphMode == 0 && colourLegendMode == 0) {
        simulation
        .force("collide", forceCollide)
        .force("gravity", forceGravity)
        setTimeout(function() { resetSimulation() }, 700);
        setTimeout(function() { enterUpdateCircles();
          simulation.alpha(0.7).alphaTarget(0.001).restart(); }, 200);
      } else if(graphMode == 0 && colourLegendMode == 1){
        simulation
        .force("collide", forceCollide)
        setTimeout(function() {   
          forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)
          forceCollide = d3.forceCollide($(window).height()*0.009)
          simulation.force("collide", forceCollide)
          .force("gravity", forceGravity)
          .on("tick", tick).alpha(0.1).alphaTarget(0.001).restart(); 
        }, 450);
        setTimeout(function(){
          d3.selectAll(".annotation-group").transition().duration(250).style("opacity",0).remove()
          // wait for transform before applying transformed annotations
          setTimeout(function() {
            createAnnotations("colours");
            d3.selectAll(".annotation-note-bg")
            .style("fill","white")
            .style("fill-opacity",0.7)

            d3.selectAll(".annotation-group")
            // .style("font-size","20px")
            .style("font-weight","bold")
            .style("fill","black")
            d3.selectAll(".annotation-note-label")
            .style("background","white").style("opacity",1)
          }, 300)
        }, 1000)

      }
      currentSize = "nothing"
      setSizes("none")
}

// re-draw size legend circles and "less, more" texts
function redrawSizeLegend() {

    d3.selectAll(".legendCircle").remove()
    d3.selectAll(".legendText").remove()

    sizeCircles = svgSizesLegend.selectAll("circle").data(sizesArray).enter().append("circle")
      .attr("r", 0) // start at 0 radius and transition in
      .attr("class","legendCircle")
      .transition().duration(400).attr("r",  function(d,i) { 
        if(sizesArray.length < 2) { return sizesArray[i] }
        else{ return sizesArray[i]+5 }
      })
      .attr("transform", function(d,i) { return "translate("+(55 + i*95) + 
        // Math.pow(sizesArray[i], 1.6))+
      ","+"25"+")" } ) 
      .style("fill", "#B5ADAD")

    legendTexts = d3.select("#svgSizesLegend").selectAll("text").data(sizesValuesArray).enter().append("text")
        .attr("class","legendText")
        .attr("text-anchor","left")
        .attr("transform", function(d,i) { return "translate("+(40 + i*95) + 
          // Math.pow(sizesArray[i], 1.6))+
        ","+"60"+")" } ) 
        .text(function(d,i) { if(i==0){ return "Less" }else if(i==1){ return "More" } })
        .style("opacity",0).transition().duration(600).style("opacity",1)

    if(currentSize=="nothing"){
      d3.select("#svgSizesLegend").append("text")
      .attr("class","legendText")
      .attr("text-anchor","left")
      .attr("transform","translate(73,45)")
      .text("Equal sizes")
      .style("opacity",0).transition().duration(600).style("opacity",1)
    }

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
    smashTogether(0.4, 0.25);
  }
})

// TODO: maxWorkers, maxSalary, skillsMath not working
var minWorkers = d3.min(nodes, function(d) {return d.workers}),
minWage = d3.min(nodes, function(d) {return d.salaryMed});


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



function createGraphExplainerDiv() { //bookmarklet
  // width of the div
  var explainerWidth = 620;
    // append a large div, transition its height and width
  graphExplainerDiv = d3.select("body").append("div")
    .attr("id","graphExplainerDiv").style("opacity",0)
    .style("left",($(window).width()-explainerWidth)/2 + "px")
    .html(
      "<p style='margin: 2px 0px 20px 20px'>Graph View lets you compare job groups by what you care about most.</p>"+
      "<button id='btnExit'>x</button>"+
      "<div class='grid-container'>"+
        "<div class='explainDiv'>"+
          "<button id='btnSuggest1' class='suggested-views-btn' href='#'>"+
            "<p style='padding-top: 10px'>Income</p> "+
            "<p>vs.</p> "+
            "<p>Years of Study</p>"+
          "</button>"+
          "<p class='p-graphModes' style='margin-bottom: -0.10em'>Usually, jobs that need more education have higher incomes.</p>"+
          "<p class='p-graphModes'>Compare average income and years of study.</p>"+
        "</div>"+
        "<div class='explainDiv'>"+
          "<button id='btnSuggest2' class='suggested-views-btn' href='#'>"+
            "<p style='padding-top: 10px'>Income</p> "+
            "<p>vs.</p> "+
            "<p>Number of Jobs</p>"+
          "</button>"+
          "<p class='p-graphModes' style='margin-bottom: -0.10em'>The more jobs are available, the easier it might be to get hired.</p>"+
          "<p class='p-graphModes'>Compare average income and how many jobs are available.</p>"+
        "</div>"+
        "<div class='explainDiv'>"+
          "<button id='btnSuggest3' class='suggested-views-btn' href='#'>"+
            "<p style='padding-top: 10px'>Machines</p> "+
            "<p>vs.</p> "+
            "<p>Number of Jobs</p>"+
          "</button>"+
          "<p class='p-graphModes' style='margin-bottom: -0.10em'>Machines are getting better at performing new tasks every day.</p>"+
          "<p class='p-graphModes'>Compare risk that job tasks will be taken over by machines and how many jobs are available.</p>"+
          "</p>"+
        "</div>"+
      "</div>"
    )
 
  // explainer transition
  d3.select("#graphExplainerDiv").transition().duration(500)
    .style("background","white")
    .style("opacity",1)

  d3.select("#btnExit").on("click", function(){
    d3.select("#graphExplainerDiv").transition().duration(500).style("opacity",0).remove()
  })


d3.select("#btnSuggest3").on('mouseover', function() {d3.select(this).style("background", "#eaeaea")})
d3.select("#btnSuggest3").on("mouseout", function() {d3.select(this).style("background", "white")})

d3.select("#btnSuggest3").on('click', function() { // Automation vs Number of Jobs
  currentMode = 3;
  graphModeOn(3);

  graphExplainerDiv.transition().duration(500).style("opacity",0).remove()

  d3.select("#btnSuggest3").style("background", "#49AC52").style("color","white").on("mouseover","").on("mouseout", "")
  // d3.select("#btnSuggest3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnSuggest3").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#btnSuggest1").style("background", "white").style("color","#49AC52")
  d3.select("#btnSuggest1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnSuggest1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnSuggest2").style("background", "white").style("color","#49AC52")
  d3.select("#btnSuggest2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnSuggest2").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView3").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#btnView3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnView3").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#btnView1").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#btnView1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView2").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#btnView2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView2").on("mouseout", function() {d3.select(this).style("background", "white")})

});

d3.select("#btnSuggest1").on('click', function() { // Wage vs Years
  currentMode = 1;
  // graphModeOn(1);

  graphExplainerDiv.transition().duration(500).style("opacity",0).remove()

  d3.select("#btnSuggest3").style("background", "white").style("color","#49AC52")
  d3.select("#btnSuggest3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnSuggest3").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnSuggest1").style("background", "#49AC52").style("color","white").on("mouseover","").on("mouseout", "")
  // d3.select("#btnSuggest1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnSuggest1").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#btnSuggest2").style("background", "white").style("color","#49AC52")
  d3.select("#btnSuggest2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnSuggest2").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView3").style("background", "white").style("color","#49AC52")
  d3.select("#btnView3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView3").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView1").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#btnView1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnView1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView2").style("background", "white").style("color","#49AC52")
  d3.select("#btnView2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView2").on("mouseout", function() {d3.select(this).style("background", "white")})

});

d3.select("#btnSuggest2").on('click', function() { // Wage vs Workers
  currentMode = 2;
  graphModeOn(2);

  graphExplainerDiv.transition().duration(500).style("opacity",0).remove()

  d3.select("#btnSuggest3").style("background", "white").style("color","#49AC52")
  d3.select("#btnSuggest3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnSuggest3").on("mouseout", function() {d3.select(this).style("background", "white")})
  
  d3.select("#btnSuggest1").style("background", "white").style("color","#49AC52")
  d3.select("#btnSuggest1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnSuggest1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnSuggest2").style("background", "#49AC52").style("color","white").on("mouseover","").on("mouseout", "")
  // d3.select("#btnSuggest2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnSuggest2").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#btnView3").style("background", "white").style("color","#49AC52")
  d3.select("#btnView3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView3").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView1").style("background", "white").style("color","#49AC52")
  d3.select("#btnView1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView2").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#btnView2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnView2").on("mouseout", function() {d3.select(this).style("background", "white")})

});


}

d3.select("#graph").on('click', function(d){
  // first time?
  if(graphFirstTime == true){
    graphFirstTime = false;
    createGraphExplainerDiv()
  }

  d3.select("body").append("img")
  .attr("class","imgGraphExplain")
  .attr("src","img/question.png").attr("alt","Graph View explanation")
  .attr("height","29").attr("width","29").style("border-radius","20px")
  .style("position","fixed")
  .style("top","250px")
  .style("right",
    function(){
      if($(window).width() >= 1024){
        return "100px";
      }else if($(window).width() >= 768){
        return "20px";
      }else if($(window).width() >= 320){
        return "20px";
      }
    }
    )
  .style("cursor","pointer")
  .on("click",function(){createGraphExplainerDiv()})
  .style("opacity",0).transition().duration(500).style("opacity",1)


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
      graphExplainerDiv.transition().duration(500).style("opacity",0).remove()
      // graphFirstTime = true;
    }
    graphModeOff();
  }; // transition back to clusters
  
})

function moveBottomDown() {
  // Move top up
  d3.select("#viewButtons").transition().duration(500).style("margin-top", "-20px");
  d3.select("#sliderDiv_skillsLang").transition().duration(500).style("top", "5vh");
  d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("top", "5vh");
  
  d3.select("#bottomButtons").transition().duration(500).style("bottom", "5vh");
  d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "1vh");
  d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "1vh");
}
function moveBottomUp() {
  // Move top up
  d3.select("#viewButtons").transition().duration(500).style("margin-top", "0px");
  d3.select("#sliderDiv_skillsLang").transition().duration(500).style("top", "9vh");
  d3.select("#sliderDiv_skillsLogi").transition().duration(500).style("top", "9vh");

  d3.select("#bottomButtons").transition().duration(500).style("bottom", "7.5vh");
  if($(window).width() <= 768){
    d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "1vh");
    d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "1vh");
  }else{
    d3.select("#sliderDiv_skillsMath").transition().duration(500).style("bottom", "9vh");
    d3.select("#sliderDiv_skillsComp").transition().duration(500).style("bottom", "9vh");
  }
}

/////////////////////////////// Suggested Views buttons /////////////////////////

d3.select("#btnView3").on('click', function() { // Automation vs Number of Jobs
  currentMode = 3;
  graphModeOn(currentMode);

  d3.select("#btnView3").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#btnView3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnView3").on("mouseout", function() {d3.select(this).style("background", "#eaeaea")})

  d3.select("#btnView1").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#btnView1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView2").style("background", "white").style("color","#49AC52").on("mouseover", "")
  d3.select("#btnView2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView2").on("mouseout", function() {d3.select(this).style("background", "white")})
});

d3.select("#btnView1").on('click', function() { // Wage vs Years
  currentMode = 1;
  graphModeOn(currentMode);

  d3.select("#btnView3").style("background", "white").style("color","#49AC52")
  d3.select("#btnView3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView3").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView1").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#btnView1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnView1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView2").style("background", "white").style("color","#49AC52")
  d3.select("#btnView2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView2").on("mouseout", function() {d3.select(this).style("background", "white")})
});

d3.select("#btnView2").on('click', function() { // Wage vs Workers
  currentMode = 2;
  graphModeOn(currentMode);

  d3.select("#btnView3").style("background", "white").style("color","#49AC52")
  d3.select("#btnView3").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView3").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView1").style("background", "white").style("color","#49AC52")
  d3.select("#btnView1").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  d3.select("#btnView1").on("mouseout", function() {d3.select(this).style("background", "white")})

  d3.select("#btnView2").style("background", "#49AC52").style("color","white").on("mouseover", "").on("mouseout", "")
  // d3.select("#btnView2").on("mouseover", function() {d3.select(this).style("background", "#eaeaea")})
  // d3.select("#btnView2").on("mouseout", function() {d3.select(this).style("background", "white")})
});


function graphModeOn(mode) {

  if($(window).width() <= 320){

  }else if($(window).width() <= 768){
      d3.select("#btnColours").transition().duration(500)
      .style("position","fixed")
      .style("left","5px")
      .style("bottom","180px")
      d3.select("#btnSizes").transition().duration(500)
      .style("position","fixed")
      .style("right","5px")
      .style("bottom","180px")
  } else if($(window).width() <= 1024){
      d3.select("#btnColours").transition().duration(500)
      .style("position","fixed")
      .style("left","5px")
      .style("bottom","180px")
      d3.select("#btnSizes").transition().duration(500)
      .style("position","fixed")
      .style("right","5px")
      .style("bottom","180px")
  } else {
      d3.select("#btnColours").transition().duration(500)
      .style("position","fixed")
      .style("left","25px")
      .style("bottom","180px")
      d3.select("#btnSizes").transition().duration(500)
      .style("position","fixed")
      .style("right","25px")
      .style("bottom","180px")
  }
  // d3.selectAll(".views-btn").transition().duration(500).style("opacity",1)
  d3.select("#grid-container-views").transition().duration(500).style("opacity",1)
  // resize()

  width=$(window).width()*0.75;
  height=$(window).height()*0.75;
  // move legend group right
  d3.select("#legend").transition().duration(500).style("bottom","180px")
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

  // if there is already a legend, remove the legend
  if (typeof axisG != "undefined") axisG.transition().duration(500).style("opacity", 0).remove();
  if (typeof legend != "undefined") legend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureLegend != "undefined") futureLegend.transition().duration(500).style("opacity", 0).remove();
  if (typeof futureAxisG != "undefined") futureAxisG.transition().duration(500).style("opacity", 0).remove();


  d3.select("#graphToggle").attr("src","img/toggle-on.png")
  
  $("#grid-container-views").show();
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
                ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate);
              return function(t) { return d.cy = i(t); };
            });
            break;

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
                ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate);
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
                ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate);
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
                y.domain([0, maxSalary]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Years of Study
      // y = Wage
        case 0:
                x.domain([0, maxYearsStudy]); //minmax workers
                y.domain([0, maxSalary]);
            break;
      // x = Number of Jobs
      // y = Wage
        case 2:
                x.domain([0, maxWorkers]); //minmax workers
                y.domain([0, maxSalary]);
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

  graphYtranslate = window.innerHeight*0.14 - 10; // y position of all nodes on graph
  // Add an axis-holder group
  axisG = svg.append("g")

  axisYtranslate = $(window).height()*-0.110;
  axisXtranslate = $(window).width()*-0.35+15;

  d3.select("xaxis").remove();

  // Add the X Axis
  axisX = axisG.append("g")
  .attr("class", "axis")
  .attr("transform", circleHeight((axisXtranslate+2),(axisYtranslate*-1.945)) )
  .call(d3.axisBottom(x).ticks(5)).attr("id","axisX")
  .style("opacity", 0).transition().duration(500).style("opacity",1);
  // text label for the x axis
  axisLabelX = axisG.append("text")
  .attr("transform", circleHeight((axisXtranslate*0.16),(axisYtranslate*-2.45)))
  .style("text-anchor", "middle")
  .style("opacity", 0).transition().duration(500).style("opacity",1);

   d3.select("yaxis").remove();

  // Add the Y Axis
  axisY = axisG.append("g")
 .attr("class", "axis")
 .attr("transform",  circleHeight((axisXtranslate), (axisYtranslate*2.52)) )
 .call(d3.axisLeft(y).ticks(4)).attr("id","axisY")
 .style("opacity", 0).transition().duration(500).style("opacity",1);
   // text label for the y axis
  axisLabelY = axisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", "10vw")
  .attr("x", "-28vh")
  .attr("dy", "1em")
  .style("text-anchor", "middle")



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

  // 
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
            axisLabelY.text("Salary ($K per yr)").style("fill","#49AC52").style("font-size", "20px")
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
            axisLabelY.text("Salary ($K per yr)").style("fill","#49AC52").style("font-family", "Raleway").style("font-size", "20px")
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
  return newPoint;
}

function createAnnotations(mode){
//  http://d3-annotation.susielu.com/
  var xSc = d3.scaleLinear().range([0, width*0.75]);
  var ySc = d3.scaleLinear().range([height*compressY, 0]);

   switch (mode) {
      // x = Number of Jobs
      // y = Salary
        case 0:
               // Scale the range of the data (using globally-stored nodes)
                xSc.domain([0, maxWorkers]); //minmax workers
                ySc.domain([0, maxSalary]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
            break;
      // x = Years of Study
      // y = Salary
        case 1:
                xSc.domain([0, maxYearsStudy]); //minmax workers
                ySc.domain([0, maxSalary]);
            break;
      // x = Number of Jobs
      // y = Salary
        case 2:
                xSc.domain([0, maxWorkers]); //minmax workers
                ySc.domain([0, maxSalary]);
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
                ySc.domain([0, maxSalary]); //maxmin risk d3.max(store, function(d) { return d.automationRisk; })
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
      labelLawyers = "$ 134.8K per yr";

  var pointJudges = getPointCoords(206),
      titleJudges = "Judges",
      labelJudges = "$ 116.2K per yr";

  var pointOptometrists = getPointCoords(170),
      titleOptometrists = "Optometrists",
      labelOptometrists = "$ 99.2K per yr";

  var pointSecondTeachers = getPointCoords(203),
      titleSecondTeachers = "Secondary school teachers",
      labelSecondTeachers = "$ 44.87K per yr";

  var pointElementTeachers = getPointCoords(204),
      titleElementTeachers = "Elementary school teachers",
      labelElementTeachers = "$ 22.36K per yr";

  var pointNurses = getPointCoords(165),
      titleNurses = "Registered nurses",
      labelNurses = "$ 40K per yr";

  var hzLineAuto = getPointCoords(229),
      titleLineAuto = "50% risk"
      labelLineAuto = "of automation"

  // Salary vs Years of Study trendline
  // y = 7.6737x + 8.1584
  var trendLineSalaryYears = getPointCoords(458)

  var labelLineSalaryYears = getPointCoords(79)
      labelLSY = "As expected the more a person has studied the greater salary they tend to earn."

  switch (mode) {

    case 0: // Income vs Study
    case 1: // Income vs Study
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
          dy: -20,
          dx: -100,
      },{
        note: {
          title: titleLawyers,
          label: labelLawyers,
          },
          // connector: {},
          x: pointLawyers.x,
          y: pointLawyers.y,
          dy: -10,
          dx: -70,
      },{
        note: {
          title: titleOptometrists,
          label: labelOptometrists,
          },
          x: pointOptometrists.x,
          y: pointOptometrists.y,
          dy: -15,
          dx: -150,
      },{
        // trend line
          color: "#4EA699",
          "className": "trendLine",
          x: trendLineSalaryYears.x,
          y: trendLineSalaryYears.y,
          dy: getPointCoords(23).y-trendLineSalaryYears.y,
          dx: getPointCoords(23).x-trendLineSalaryYears.x,
      },{
          "className": "trendLabel",
        note: {
          // label the trend line
          label: labelLSY,
          wrap: 200,
          },
          x: labelLineSalaryYears.x,
          y: labelLineSalaryYears.y,
          dy: -110,
          dx: -80,
          connector: { end: "arrow" }
      }]
      break;

    case 2: // Income vs Jobs
      labels = [
      {
        note: {
          title: titleLawyers,
          label: labelLawyers,
        },
          x: pointLawyers.x,
          y: pointLawyers.y,
          dy: -10,
          dx: 80,
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

    case 3: // Machines vs Jobs
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
      },{
        color: "#E3655B",
        "className": "riskLine",
        note: {
          title: titleLineAuto,
          label: labelLineAuto,
        },
          x: $(window).width()*0.17,
          y: hzLineAuto.y,
          dy: 0,
          dx: $(window).width()*0.6,
      }]

      break;

    case "colours":

      // get average cluster centers of mass
      var thisCluster = 1
      var divisor = 0

      var centerX = new Array(industries.length)
      var centerY = new Array(industries.length)

      industries.forEach(function(){
        centerX[thisCluster] = 0
        centerY[thisCluster] = 0
        // get each industry center of mass
        graph.forEach(function(d){
          if(d.cluster == thisCluster){
            thisCircleQuery = document.getElementById("circle_"+d.id)
            var point = document.getElementById('chart').createSVGPoint();
                point.x = d3.select("#circle_"+d.id).attr("cx");//get the circle cx 
                point.y = d3.select("#circle_"+d.id).attr("cy");//get the circle cy
            var newPoint = point.matrixTransform(thisCircleQuery.getCTM());//new point after the transform
            centerX[thisCluster] = centerX[thisCluster] + newPoint.x
            centerY[thisCluster] = centerY[thisCluster] + newPoint.y
            // centerY[thisCluster] += --circleY
            divisor++}
        })
        centerX[thisCluster] = centerX[thisCluster] / divisor // average x
        centerY[thisCluster] = centerY[thisCluster] / divisor // average x
        // centerY[thisCluster] = centerY[thisCluster] / divisor // average x
        divisor = 0 // reset for next industry
        thisCluster++
      })

      labels = [
      {
        note: {
          label: "Natural resources and agriculture",
        },
          x: centerX[10],
          y: centerY[10],
          // x: getPointCoords(414).x,
          // y: getPointCoords(414).y,

      },{
        note: {
          label: "Management",
        },
          x: centerX[1],
          y: centerY[1],
          // dy: -130,
          // dx: -15,
      },{
        note: {
          label: "Art, culture, recreation and sport",
        },
          x: centerX[2],
          y: centerY[2],
          // dy: -240,
          // dx: 15,
      },{
        note: {
          label: "Trades, transport and equipment ops",
        },
          x: centerX[3],
          y: centerY[3],
          // dy: 100,
          // dx: -15,
      },{
        note: {
          label: "Business, finance and administration",
        },
          x: centerX[4],
          y: centerY[4],
          // dy: 60,
          // dx: -10,
      },{
        note: {
          label: "Education, law, social, community, government",
        },
          x: centerX[5],
          y: centerY[5],
          // dy: function(){
          //   if(getPointCoords(204).y > $(window).height()/2 ){
          //     return -50
          //   }else{return 50}
          // },
          // dx: -10,
      },{
        note: {
          label: "Natural and applied sciences",
        },
          x: centerX[6],
          y: centerY[6],
          // dy: -150,
          // dx: 5,
      },{
        note: {
          label: "Manufacturing and utilities",
        },
          x: centerX[7],
          y: centerY[7],
          // dy: 60,
          // dx: 10,
      },{
        note: {
          label: "Health",
        },
          x: centerX[8],
          y: centerY[8],
          // dy: 70,
          // dx: 10,
      },{
        note: {
          label: "Sales and services",
        },
          x: centerX[9],
          y: centerY[9],
          // dy: -50,
          // dx: 50,
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
        y: d => y(d.salaryMed)
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
  d3.selectAll(".imgGraphExplain").transition().duration(500).style("opacity",0).remove()
  d3.select("#legend").transition().duration(500).style("bottom","230px")
  d3.select("#grid-container-views").transition().duration(500).style("opacity",0)
  setTimeout(function(){$("#grid-container-views").hide();},500)
  if($(window).width() <= 320){

  }else if($(window).width() <= 768){
      d3.select("#btnColours").transition().duration(500)
      .style("position","fixed")
      .style("left","32px")
      .style("bottom","180px")
      d3.select("#btnSizes").transition().duration(500)
      .style("position","fixed")
      .style("right","32px")
      .style("bottom","180px")
  } else if($(window).width() <= 1024){
      d3.select("#btnColours").transition().duration(500)
      .style("position","fixed")
      .style("left","45px")
      .style("bottom","255px")
      d3.select("#btnSizes").transition().duration(500)
      .style("position","fixed")
      .style("right","45px")
      .style("bottom","255px")
  } else {
      d3.select("#btnColours").transition().duration(500)
      .style("position","fixed")
      .style("left",$(window).width()*0.14+"px")
      .style("bottom",$(window).height()*0.461+"px")
      d3.select("#btnSizes").transition().duration(500)
      .style("position","fixed")
      .style("right",$(window).width()*0.14+"px")
      .style("bottom",$(window).height()*0.461+"px")
  }

  // resize()
  // clear annotations
  d3.selectAll(".annotation-group").transition().duration(500).style("opacity",0).remove()

  d3.select("#graphToggle").attr("src","img/toggle-off.png")

    showLeftButtons();
  
  // hide graph modes options

  // remove axes
  axisG.style("opacity", 1).transition().duration(500).style("opacity",0)
  .remove();

    // move sliders back up
    moveBottomUp();
    // Transition back to original positions
    circles.transition()
    .duration(750)
    // .attr("r", function(d) { return originalRadius[d.id] })
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
  resetFilters(currentMode);
});

resetFilters = function(mode) {
  // collapseCircleImages() if expanded 
  if(circlesExpanded == 1){
    circlesExpanded = 0;
  }
  // reset sizes
      // reset all buttons & colour this button green      
      d3.selectAll(".btnSizesOption").style("color","#49AC52").style("background","white")
      d3.select("#equaLink").style("color","white").style("background","#49AC52")
      currentSize = "nothing"
      // transition radii to selected values
      d3.selectAll(".jobCircle").attr("r",collapsedRadius)

  if(graphMode == 0) { // reset simulation forces if simulating
    setTimeout(function() { 
      forceCollide = d3.forceCollide($(window).height()*0.009)
      forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)
      simulation
      .force("cluster", forceCluster)
      .force("x", forceXCombine)
      .force("y", forceYCombine)
      .force("gravity", forceGravity)
      .force("collide", forceCollide)
      .on("tick", tick)
      simulation.alpha(0.5).alphaTarget(0.001).restart(); 
    }, 450);
  }
  // reset colour filters
  circles.transition().duration(500).style("opacity",1)  
  filteredIndustries = []
  d3.selectAll(".legendCirc").attr("opacity",1)
  // reset size filters
  d3.selectAll(".legendCircle").remove()
  d3.selectAll(".legendText").remove()
  currentSize = "nothing"
  d3.select("#svgSizesLegend").append("text")
  .attr("class","legendText")
  .attr("text-anchor","left")
  .attr("transform","translate(73,45)")
  .text("Equal sizes")
  .style("opacity",0).transition().duration(600).style("opacity",1)
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
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
          // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;
      case 1:
        circles
          // x = Years of Study
          .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4 + graphXtranslate})
          // y = Wage
          .attr("cy", function(d){ return ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate});
          break;

      case 2:
        circles
          // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
          // y = Wage
          .attr("cy", function(d){ return ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate});
          break;
          // x = Number of Jobs
          // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
      case 3:
        circles
          // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
          // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

      case 4:
        circles
          // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
          // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

      case 5: // graph mode off
        circles
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left  + graphXtranslate})
          .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
          break;
      }


    }
  }; // end resetFilters()


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
    .attr("r", collapsedRadius) // start at full radius
    .attr("transform", circleHeight(0, -100+$(window).height()*0.080) ) //flag! need to make equation for width/height ratio
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
    circles = circles.merge(
      newCircles.attr("r",0).transition().duration(500)
      .attr("r", collapsedRadius));
  }else if(graphMode == 0){
    circles = circles.merge(newCircles);
  }
  

}











///////////////////////////////// Filters ////////////////////////////////////
var sliderSideTranslate = 9;
if(window.innerWidth >= 1007) {
  sliderSideTranslate = window.innerWidth*0.01
  // d3.select("#titleBar").style("margin-left", window.innerWidth*0.01 + "vw")
  // d3.select("#search-btn-div").style("right", window.innerWidth*0.0094 + "vw")
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
  if(["Communication <p class='sliderText'>and Verbal skills</p>", "Logic and <p class='sliderText'>Reasoning skills</p>"].includes(sliderTitlesArray[i])){
    xtrans = sliderSideTranslate;
    ytrans = sliderHeightTranslate;
    topOrBottom = "top";
  }
	// Right column
	if(["Math and <p class='sliderText'>Spatial skills</p>", "Logic and <p class='sliderText'>Reasoning skills</p>"].includes(sliderTitlesArray[i])){
		// xtrans = sliderSideTranslate;
    leftOrRight = "right";
    // posn = "fixed";
	}
   // Bottom row
  if(["Math and <p class='sliderText'>Spatial skills</p>", "Computer and <p class='sliderText'>Information skills</p>"].includes(sliderTitlesArray[i])){
    xtrans = sliderSideTranslate;
    ytrans = sliderHeightTranslate;
    topOrBottom = "bottom";
  }
  // Left column
  if(["Communication <p class='sliderText'>and Verbal skills</p>", "Computer and <p class='sliderText'>Information skills</p>"].includes(sliderTitlesArray[i])){
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
    .html(
      "<img id=question_"+i+" style='border-radius: 29px; display: inline-block; padding-left: 5px; padding-bottom: 2px; margin: 20px 20px 0px 0px; float: right' src='img/question.png' "
      +"alt='help' height='26' width = '29'>"
      +"<div align='left' style='display: inline-block; height: 66px; width: 180px; float: left; margin-left: "+(sub_xtranslate+2)+"%;"
      +"font-size: 140%; font-weight: bold;"
      +" color: #49AC52; font-family: Raleway'>"
      +sliderTitlesArray[i] // "Communication <p class='sliderText'>and Verbal skills</p>"
      +"</div>"
      )

  // Not Much       Lots
  .append("div")
    .attr("align", "left")
    .style("position", "relative")
    .style("margin-top", "39%")
    .style("margin-left", (sub_xtranslate)+"%")
    .style("color", "#49AC52")
    .style("font-weight", "bold")
    .style("font-family", "Raleway")
    .html("<div id='notmuchlots_"+i+"' style='margin-left: 5px; margin-top: -4px'>"
      +"Not&nbspmuch"
      +"<span id='notmuchSpan_"+i+"' style='margin-left: "+137+"px;'></span>"
      +"Lots</div>"+
      "<div id=subSliderDiv_"+i+">"+
      "<span>"+
        "<button id='btnSubsliders_"+i+"' class='expand-sliders-btn' style='width: 250px; margin-top: 4px; margin-left: 1px; fill: white; z-index: 99;' "+
        "onclick='expandSliders("+i+")' type='button'>"+
          "<span id='spanSubsliders_"+i+"' style='font-family: Raleway; font-size: 15; font-weight: bold; color: #49AC52;'>"+sliderButtonArrows[i]+" view "+sliderTitlesArrayMainCompact[i].toLowerCase()+" "+sliderButtonArrows[i]+"</span>"+
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
    .style("top", 56+"px") // y position
    // .style("margin-left", -sub_xtranslate+"%") // x position
    .attr("id", "slider_"+i)
    .attr("width", 250)
    .attr("height", 60);

$(document).ready(function(){resize()})



  sliderSVGArray[i].attr("class", "d-inline d-sm-inline d-md-inline d-lg-inline d-xl-inline")
  var mainSlidersWidth = 223;
  var reductionFactor = 0.7;

  // Scale
  sliderScaleArray[i] = d3.scaleLinear()
    .domain([0, d3.max(nodes, function(d){ return d[sliderArrayMain[i]]}) * reductionFactor ]) // lower the maximum for all skills by 20% to prevent filtering down to 0
    .range([0, mainSlidersWidth]) // Width of slider is 200 px
    .clamp(true);
  // Bugfix: math max not working
  if(["Math and <p class='sliderText'>Spatial skills</p>"].includes(sliderTitlesArray[i])) {
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





        expandCircleImages()









      } else { collapseCircleImages(); }

      if(graph.length >= 175){
        forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)

        simulation
        .force("collide", forceCollide)
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
  // if(["Communication <p class='sliderText'>and Verbal skills</p>"].includes(sliderTitlesArray[i])) {
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
        .style("width","400px")
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
      //     +subSliderTitlesArray[i].substring(0,subSliderTitlesArray[i].length - 7)+"..." // "Communication <p class='sliderText'>and Verbal skills</p>"
      //     +"</div>"
        // sm and xs
      // +"<div class='d-inline d-sm-inline d-md-none d-lg-none d-xl-none' align='left' style='margin-left: "+(xtranslate)+"%;"
      //     +"font-size: 100%; font-weight: bold;"
      //     +" color:  #49AC52; font-family: Raleway'>"
      //     +subSliderTitlesArray[i].substring(0,subSliderTitlesArray[i].length - 7) // "Communication <p class='sliderText'>and Verbal skills</p>"

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
    // if(["Math and <p class='sliderText'>Spatial skills</p>"].includes(subSliderTitlesArray[i])) {
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
          // remove old mini tooltip
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
          // if under 25 circles left, expand images
          if(graph.length <= 25){ 
            miniTooltip.style("color","#FE2E2E") 
            expandCircleImages();
          } else { // collapse images
            collapseCircleImages();
          }
          if(graph.length >=175){
            forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)

            simulation
            .force("collide", forceCollide)
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
        }));

    handleArray[(i+j)] = sliderMulti[(i+j)].insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("id","handle_"+(i+j))
      // .style("z-index", 99)
      .attr("r", 9);

      // Bugfix: lang slider not on top
    // if(["Communication <p class='sliderText'>and Verbal skills</p>"].includes(subSliderTitlesArray[i])) {
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
          .force("collide", forceCollide)
          .force("cluster", forceCluster)
          // .force("gravity", forceGravity)
          .force("x", forceXCombine)
          .force("y", forceYCombine)
          .on("tick", tick);

          simulation.alpha(0.15).alphaTarget(0.001).restart();

      }, 0);
        
        forceCollide = d3.forceCollide($(window).height()*0.009)
        forceGravity = d3.forceManyBody().strength($(window).height()*-0.08)

        simulation
        .force("gravity", // default strength = -30, negative strength = repel, positive = attract
                forceGravity)
        // collapse gravity 
        .force("collide", forceCollide)
        .alpha(0.6).alphaTarget(0.001).restart(); 
    }
  }
}

function expandCircleImages() {

expandedRadius = $(window).height()*0.045;
collapsedRadius = $(window).height()*0.007;
  //bookmark
  //modify: toggle-on, toggle-off, shrink back down
  if (circlesExpanded == 0) {
        
        circlesExpanded = 1;

        circles.transition().duration(500)
          .delay(function(d, i) { return i * 5})
          .attrTween("r", function(d) {
            var i = d3.interpolate(collapsedRadius, expandedRadius);
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
            forceCollide = d3.forceCollide($(window).height()*0.050)
            forceGravity = d3.forceManyBody().strength($(window).height()*-0.06)

              simulation
              .force("collide", forceCollide)
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
  .attr("r", $(window).height()*0.03)
  .styleTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return i(t); };
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
          .attr("cx", function(d){ return d.yearsStudy/maxYearsStudy*width*0.73 - width*0.4 + graphXtranslate})
            // y = Wage
          .attr("cy", function(d){ return ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate});
          break;

        case 2:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
            // y = Wage
          .attr("cy", function(d){ return ((maxSalary-d.salaryMed)/maxSalary)*height*0.69 - height*0.5 + graphYtranslate});
          break;
          // x = Number of Jobs
          // y = Automation Risk (same as initial, but using cx to glide into position from previous positions)
        case 3:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
            // y = Automation Risk (same as initial, but using cx to transition into position from previous positions)
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 4:
          circles
            // x = Number of Jobs
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.73 - width*0.4 + graphXtranslate})
            // y = Automation Risk
          .attr("cy", function(d){ return (d.automationRisk)*height*0.65 - height*0.5 + graphYtranslate});
          break;

        case 5: // graph mode off
          circles
          .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left  + graphXtranslate})
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
  d3.select("#graph").style("box-shadow","0px 2px 7px 0 rgba(0,0,0,0.3)")
  d3.select("#resetFilters").style("box-shadow","0px 2px 7px 0 rgba(0,0,0,0.3)")  
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
        if (sliderScaleArray[i].invert(d3.event.x) <= 0) { return sliderScaleArray[i](sliderPositionsArray[i]) }
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
  }
  calloutCheck()
  return graph;
} // end filterAll

}// Update function which detects current slider





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


// setTimeout(function() {
var offsetDown = 0
var eTops = [] // comp

    eTops.push(document.querySelector("#question_0").getBoundingClientRect().top + offsetDown) // lang
    eTops.push(document.querySelector("#question_1").getBoundingClientRect().top + offsetDown) // logi
    eTops.push(document.querySelector("#question_2").getBoundingClientRect().top - 140) // math
    eTops.push(document.querySelector("#question_3").getBoundingClientRect().top - 105) // comp

var offsetRight = 55
var eLefts = []

    eLefts.push(document.querySelector("#question_0").getBoundingClientRect().left + offsetRight) // lang
    eLefts.push(document.querySelector("#question_1").getBoundingClientRect().left - 7*offsetRight) // logi
    eLefts.push(document.querySelector("#question_2").getBoundingClientRect().left - 7*offsetRight) // math
    eLefts.push(document.querySelector("#question_3").getBoundingClientRect().left + offsetRight) // comp

for (var i = 0; i < explainerDivs.length; i++) {
  
  d3.select("#question_"+i).on("mouseenter", function(){
    // thisNum = _i
    var thisNum = d3.select(this).attr("id").substring(9,10)

    d3.select("body").append("div")
    .style("top",eTops[thisNum]+"px")
    .style("left",eLefts[thisNum]+"px")
    .attr("id","answer_"+thisNum)
    .attr("class","answerDiv")
    .html(explainerDivs[thisNum])
    .style("opacity",0).transition().duration(200).style("opacity",1)

  })
  .on("mouseout", function(){
    d3.selectAll(".answerDiv").transition().duration(275).style("opacity",0).remove()
  })

}



/////// Favourites section ////////

d3.select("body").append("div").attr("id","favesDiv")
  .style("position","fixed")
  .style("top",$(window).height()*0.483+"px")
  .style("right","5%")
  // .style("height","50px")
  // .style("width","50px")
  .style("color","#ff9600")
  .html("<i id='fa-star-icon' class='fa fa-star fa-2x'></i>")
  .on("mouseover",function(){
    d3.select("#favesDiv").append("div")
    .attr("id","favouriteText").attr("class","legendText")
      .style("margin-left", "-20px")
      .style("margin-right", "-20px")
    .html("Favourites")
  })
  .on("mouseout",function(){
    // hide text label
    d3.select("#favouriteText").remove()
  })
  .on("click",function(){
    if(favesMode==0){
      favesMode=1
      expandFavourites()
    }else{
      favesMode=0
      collapseFavourites()
    }
  })

function expandFavourites(){
  // attach curly braces
  d3.select("#favesDiv").append("img")
  .attr("id","curlytop").attr("src","img/curlybracetop.png")
    .style("right", getBbox("favesDiv").right + getBbox("favesDiv").width/2)
    .style("bottom", getBbox("favesDiv").bottom + "px")
    .style("height", getBbox("btnSubsliders_1").bottom - getBbox("favesDiv").bottom - getBbox("favesDiv").height + "px")
    .transition().duration(500).style("opacity",0.5)

  d3.select("#favesDiv").append("img")
  .attr("id","curlybtm").attr("src","img/curlybracebtm.png")
    .style("right", getBbox("favesDiv").right + getBbox("favesDiv").width/2)
    .style("top", getBbox("favesDiv").top + getBbox("favesDiv").height + 3 + "px")
    .style("height", getBbox("btnSubsliders_1").bottom - getBbox("favesDiv").bottom - getBbox("favesDiv").height + "px")
    .transition().duration(500).style("opacity",0.5)

  // append the favourites container
  d3.select("#favesDiv").append("svg")
    .attr("id","favesSvg")
    .style("height", $(window).height()*0.45+"px")
    .style("opacity",0)
    .transition().duration(500)
    .style("opacity",1).style("right","0.5%")
  // move in from the right
  d3.select("#favesDiv").transition().duration(500).style("right","8%")
  // append all favourites
  // d3.select("#favesSvg").append("")
  appendFavourites()
}

function collapseFavourites(){
  // remove the favourites container
  d3.select("#favesSvg").transition().duration(500).style("right","-10%").remove()
  d3.select("#favesDiv").transition().duration(500).style("right","3%")
  d3.select("#curlytop").transition().duration(500).style("opacity",0).remove()
  d3.select("#curlybtm").transition().duration(500).style("opacity",0).remove()
}

function appendFavourites(){

  faveNodes = [] // reset
  nodes.forEach(function(d){ // check for favourites
    if(d.favourited==1){
      faveNodes.push(d)
    }
  })

  var faveArrayX = fillArray(0,494)
  var faveArrayY = fillArray(0,494)
  faveNodes.forEach(function(d, i){
    if(i<10){ // first column height = 10 circles
      faveArrayX[i] = 12 //x
    }else{ // second column
      faveArrayX[i] = 36
    } 
    
    faveArrayY[i] = i*24 + 12 //y
  })

  faveCircles = d3.select("#favesSvg").selectAll("circle")
      .data(faveNodes)
      .enter().append("circle")
        .attr("r", 0)
        .attr("transform", function(d,i){
          // return different values for each new id
          return "translate("+faveArrayX[i]+","+faveArrayY[i]+")"
        })
        .attr("id",function(d) { return "faveCircle_"+d.id })
        .attr("class","jobCircle")
        .attr("class","faveCircle")
        .style("z-index", -1)
        .style("fill", function(d) { return color(d.cluster); })
        // Tooltips
        .on("mouseenter", function(d) {
          d3.selectAll(".jobCircle").style("opacity",0.1) //todo: exclude colour legend filters?
          d3.select(this).style("opacity",1)
          d3.select("#circle_"+d.id).style("opacity",1)
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
          d3.selectAll(".jobCircle").style("opacity",1) //todo: exclude colour legend filters?
          if(!circleExpanded[d.id] == 1){
            // //if not stuck
            // if(!sticky[d.id] == 1) {
              d3.select(this)
              .style("fill", color(d.cluster) )
                // .attr("stroke", "black")
                .style("stroke-width", 2)
                .attr("stroke", color(d.cluster));
            // } else { // if stuck
            //   d3.select(this)
            //     .style("fill", "url(#pattern_"+d.id+")")
            //     .attr("r","30px")

            // }
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

        d3.selectAll(".faveCircle").transition().duration(500).attr("r",10)
        d3.select("#favesSvg").selectAll("circle")
      .data(faveNodes).exit().transition().duration(300).attr("r", 0 ).remove();


}

})
} // end of d3.csv



















      ///////////////////// Search ///////////////////////
var searchExpanded = 0;


d3.select("body").append("div")
  .attr("id", "search-btn-div")
  .append("span")
    .append("button").attr("id","searchButtonPC").attr("class","search-btn")
      .append("img").attr("id","searchImg").attr("class","search-img")
        .attr("src","img/search.png")
        .attr("height","40")
        .attr("width","40")
        // .on("mouseenter", function(){expandSearch()})
        .on("click", function() {searchJobTitles()})
        .on("mouseover", function() {
          d3.select(this).attr("src","img/search2.png")
        })
        .on("mouseout", function() {
          d3.select(this).attr("src","img/search.png")
        })
        // .on("hover", function() {
        //   d3.select("#search-btn-div")
        //   .style("right","1.8%")
        //   .style("top","2%")
        // })

var feedbackBbox = document.getElementById("feedback").getBoundingClientRect()

var searchDiv = d3.select("body")
  .append("div").attr("id","searchDiv")
    .html("<input id='jobTitle' placeholder='Search job titles' align='right' class='d-inline form-control' "+
           "type='text' onkeydown='if (event.keyCode == 13) searchJobTitles()'>"+
          "<button id='searchSubmitBtn' style='opacity: 1; margin-top: -1px;' class='submit-btn btn btn-sm' "+
          "onclick='searchJobTitles()'>Search</button>"
          )
    .style("width", function(){
      if($(window).width() >= 768){
        var linksBbox = document.getElementById("links-top").getBoundingClientRect()
        return $(window).width() - linksBbox.right - 110 + "px"
      }else if($(window).width() >= 320){
        var linksBbox = document.getElementById("tabletLinks").getBoundingClientRect()
        return $(window).width() - linksBbox.right - 100 + "px"
      }
    })


function searchJobTitles() {

  resetFilters(currentMode);

  //  UPDATE
  circles = circles.data(filterBySearch(), function(d) { return d.id });
  
  // EXIT
  circles.exit().transition().duration(500)
  // exit transition: "pop" radius * 1.5 + 5 & fade out
  .attr("r", function(d) { return d.radius * 0 })
  .attrTween("opacity", function(d) {
    var i = d3.interpolate(1, 0);
    return function(t) { return i(t); };
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
    .attr("cx", function(d){ return d.workers/maxWorkers*width*0.9 - width/2 + margin.left  + graphXtranslate})
    .attr("cy", function(d){ return (d.automationRisk)*height - height/2 + graphYtranslate})
  }

  // if no search results, display warning message
  if (graph.length == 0) {

    zeroJobsRemain()

  }

}

function zeroJobsRemain() {
      // display warning message
    d3.select("body").append("div")
      .attr("id","warningMsg").attr("class","alert")
      .style("position","fixed")
      .style("left",($(window).width()-250)/2 + "px")      
      .style("top",($(window).height()-115)/2 + "px")      
      .style("width","250px").style("height","115px")
      .style("font-size","24px")
      .html("No results!<br>Resetting...")
    
    // reset and remove message
    // click reset instead?
    setTimeout(function() {
      resetFilters(currentMode)
      d3.select("#warningMsg").transition().duration(500).style("opacity",0).remove()
    }, 1500)
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
circles.style("opacity",
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






1005
