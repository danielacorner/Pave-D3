function() { 
	var width = 500, 
		height = 500; 

	var svg = d3.select("#chart")
		.append("svg") 
		.attr("height", height) 
		.attr("width", width) 
		.append("g")
		.attr("transform", "translate(" + width/2 + "," + height/2 + ")")

	// <defs>
	// <pattern id="jon-snow" height="100%" width="100%" pattern... http://bit.ly/2FdTr7q
	// </defs>

	var defs = svg.append("defs");

	defs.append("pattern")
		.attr("id", "jon-snow")
		.attr("height", "100%")
		.attr("width", "100%")
		.attr("patternContentUnits", "objectBoundingBox")
		.append("image")
		.attr("height", 1)
		.attr("width", 1)
		.attr("preserveAspectRatio", "none")
		.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
		.attr("xlink:href", "snow.jpg")

	// sqrt scale because radius of a cicrle
	var radiusScale = d3.scaleSqrt().domain([1, 300]).range([10, 80])

	var forceXSeparate = d3.forceX(function(d) {
			if(d.cluster === 1) {
				return width / 4
			} else {
				return 3 * width / 4
			}
			return width / 2
		}).strength(0.05)

	var forceXCombine = d3.forceX(function(d) {
			if(d.cluster === 1) {
				return width / 4
			} else {
				return 3 * width / 4
			}
			return width / 2
		}).strength(0.05)

	var forceY = d3.forceY(function(d) {
			return height / 2
		}).strength(0.05)

	var forceCollide = d3.forceCollide(function(d) {
			return radiusScale(d.sales) + 1;
		})

	// the simulation is a collectuon of forces
	// about where we want our circles to go
	// and how we want our circles to interact
	// STEP 1: get them to the middle
	// STEP 2: don't have them collide!!
	var simulation = d3.forceSilumation()
		.force("x", forceX)
		.force("y", forceY)
		.force("collide", forceCollide)

	d3.queue() 
	  .defer(d3.csv, "sales.csv") 
	  .await(ready) 

	function ready (error, datapoints) { 

		defs.selectAll(".artist-pattern")
			.data(datapoints)
			.enter().append("pattern")
			.attr("class", "artist-pattern")
			.attr("id", function(d) {
				return d.name.toLowerCase().replace(/ /g, "-") // replace a space, globally
			})
			.attr("height", "100%")
			.attr("width", "100%")
			.attr("patternContentUnits", "objectBoundingBox")
			.append("image")
			.attr("height", 1)
			.attr("width", 1)
			.attr("preserveAspectRatio", "none")
			.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
			.attr("xlink:href", function(d) {
				return d.image_path
			})

		var circles = svg.selectAll(".artist")
			.data(datapoints) 
			.enter().append("circle") 
			.attr("class", "artist") 
			.attr("r", function(d) {
				return radiusScale(d.sales)
			})
			.attr("fill", function(d) {
				return "url(#" + d.name.toLowerCase().replace(/ /g, "-") + ")" // replace a space, globally
			})
			.on('click', function(d) {
				console.log(d)
			})

		d3.select("#industry").on('click', function(d) {
			simulation
				.force("x", forceXSeparate)
				.alphaTarget(0.5)
				.restart()
		})

		d3.select("#combine").on('click', function(d) {
			simulation
				.force("x", forceXCombine)
				.alphaTarget(0.5)
				.restart
		})

		simulation.nodes(datapoints)
			.on('tick', ticked)

		function ticked() {
			circles
				.attr("cx", function(d)	{
					return d.x
				})
				.attr("cy", function(d) {
					return d.y
				})
		}

		}
	}