// filteringNodes
// <!DOCTYPE html>
// <html>
// <meta charset="UTF-8">

// <button type="button" class="filter-btn" id="blue" value="1">Filter Blue</button>
// <button type="button" class="filter-btn" id="orange" value="2">Filter Orange</button>
// <button type="button" class="filter-btn" id="green" value="3">Filter Green</button>
// <svg width="960" height="500"></svg>
// <script src="https://d3js.org/d3.v4.min.js"></script>
// <script
//   src="https://code.jquery.com/jquery-3.2.1.min.js"
//   integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
//   crossorigin="anonymous"></script>
// <script>

//	data stores
var graph, store;

//	svg selection and sizing
// var svg = d3.select("svg"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height"),
//     radius = 10;

//	d3 color scales
// var color = d3.scaleOrdinal(d3.schemeCategory10);

var link = svg.append("g").selectAll(".link"),
	node = svg.append("g").selectAll(".node");

//	force simulation initialization
// var simulation = d3.forceSimulation()
// 	.force("link", d3.forceLink()
// 		.id(function(d) { return d.id; }))
// 	.force("charge", d3.forceManyBody()
// 		.strength(function(d) { return -500;}))
// 	.force("center", d3.forceCenter(width / 2, height / 2));

//	filtered types
typeFilterList = [];

//	filter button event handlers
$(".filter-btn").on("click", function() {
	var id = $(this).attr("value");
	if (typeFilterList.includes(id)) {
		typeFilterList.splice(typeFilterList.indexOf(id), 1)
	} else {
		typeFilterList.push(id);
	}
	filter();
	update();
});

//	data read and store
d3.json("blocks-data.json", function(err, g) {
	if (err) throw err;

	var nodeByID = {};

	g.nodes.forEach(function(n) {
		nodeByID[n.id] = n;
	});

	// g.links1.forEach(function(l) {
	// 	l.sourceGroup = nodeByID[l.source].group.toString();
	// 	l.targetGroup = nodeByID[l.target].group.toString();
	// });

	graph = g;
	store = $.extend(true, {}, g);

	update();
});

//	general update pattern for updating the graph
function update() {
	//	UPDATE
	node = node.data(graph.nodes, function(d) { return d.id;});
	//	EXIT
	node.exit().remove();
	//	ENTER
	var newNode = node.enter().append("circle")
		.attr("class", "node")
		.attr("r", radius)
		.attr("fill", function(d) {return color(d.group);})
		.call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        )

    newNode.append("title")
      .text(function(d) { return "group: " + d.group + "\n" + "id: " + d.id; });
	//	ENTER + UPDATE
	node = node.merge(newNode);

	// //	UPDATE
	// link = link.data(graph.links1, function(d) { return d.id;});
	// //	EXIT
	// link.exit().remove();
	// //	ENTER
	// newLink = link.enter().append("line")
	// 	.attr("class", "link");

	// newLink.append("title")
 //      .text(function(d) { return "source: " + d.source + "\n" + "target: " + d.target; });
	// //	ENTER + UPDATE
	// link = link.merge(newLink);

	//	update simulation nodes, links, and alpha
	simulation
		.nodes(graph.nodes)
		.on("tick", ticked);

  	simulation.force("link")
  		.links(graph.links1);

  	simulation.alpha(1).alphaTarget(0).restart();
}

//	drag event handlers
function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

//	tick event handler with bounded box
function ticked() {
	node
		.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
		.attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

	link
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
}

//	filter function
function filter() {
	//	add and remove nodes from data based on type filters
	store.nodes.forEach(function(n) {
		if (!typeFilterList.includes(n.group) && n.filtered) {
			n.filtered = false;
			graph.nodes.push($.extend(true, {}, n));
		} else if (typeFilterList.includes(n.group) && !n.filtered) {
			n.filtered = true;
			graph.nodes.forEach(function(d, i) {
				if (n.id === d.id) {
					graph.nodes.splice(i, 1);
				}
			});
		}
	});

	//	add and remove links from data based on availability of nodes
	// store.links1.forEach(function(l) {
	// 	if (!(typeFilterList.includes(l.sourceGroup) || typeFilterList.includes(l.targetGroup)) && l.filtered) {
	// 		l.filtered = false;
	// 		graph.links1.push($.extend(true, {}, l));
	// 	} else if ((typeFilterList.includes(l.sourceGroup) || typeFilterList.includes(l.targetGroup)) && !l.filtered) {
	// 		l.filtered = true;
	// 		graph.links1.forEach(function(d, i) {
	// 			if (l.id === d.id) {
	// 				graph.links1.splice(i, 1);
	// 			}
	// 		});
	// 	}
	// });			
}

</script>
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
// filtered IDs
listToDelete = [];

function filterNodes(workersMin) { // return nodes with workers > "workersMin"
  
  store.forEach(function(d) {
    // if you're under the limit (good)  &&  // if you're on the list
    if (d.workers < workersMin && listToDelete.includes(d.id)) { // Once removed, lose access to d.workers?
      // take you off the list
      listToDelete.splice(listToDelete.indexOf(d.id), 1); //.remove?
    }
    // else if you're over the limit (bad) && // if you're not on the list
    else if (d.workers >= workersMin && !listToDelete.includes(d.id)) {
      // put you on the list
      listToDelete.push(d.id);
    }

    //   // filterList.remove(d.id); }
    // // put you on the list if condition satisfied
    // } else if (d.workers >= workersMin) { 
    //   var found = false;
    //   graph.forEach(function(g){ // problem: only iterating through graph not store
    //     if (g.id === d.id) { // look for it in the graph
    //       found = true;
    //       console.log("found id: ", d.id, d.workers);
    //     }
    //   })
    //   if (found == false) { // never adding
    //     graph.push(d);
    //     console.log("adding", d.id, d.workers); 
    //   }
    // }
      // filterList.push(d.id); }
    // // if you're not on the list & you're filtered, do nothing
    // if (!filterList.includes(d.id) && d.filtered) { return; }
    // // if you're on the list & you're not filtered, filta yoself
    // else if (filterList.includes(d.id) && !d.filtered) {
  });
  console.log("graph pre add/rem: ",graph);

  // add and remove nodes

  // remove listToDelete objects
  for(var i = 0; i < listToDelete.length; i++) {
    // get index of object with id = listToDelete[i]
    var removeIndex = graph.map(function(item) { return item.id; })
      .indexOf(listToDelete[i]);
    // remove the object
    graph.splice(removeIndex, 1);
  }

  // add from storage if not on the list
  graph.push(store.filter(function(d) { return d.id in listToDelete })); //???check syntax
  console.log("graph post add/rem: ",graph);