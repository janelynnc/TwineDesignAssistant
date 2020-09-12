/*
Draws connector lines between passages.
*/

const Vue = require('vue');
const d3 = require('d3');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
        graphData: null
    },
    
    ready() {
        console.log("graphData");

        var svg = d3.select('#graph').attr('width', 500).attr('height', 500);
        //Grab the graph data that we computed in the story tab
        var data = this.$parent.$parent.graphData;
        var edges = [
        ];
        /*
        //A lookup table so that we can map an name to an entry in our data array
        const idToNodes = d3.map();
        data.forEach(node => idToNodes.set(node.name,node));
        //For every entry in data we will get the list of links (things this node is connected to). For each link we create
        //an edge.The source of this edge is the current node and the target the node the corresponds to the the id in the links
        //array
        data.forEach(passageEntry => {
            passageEntry.links.forEach(
                target => {
                    //We look the name target from the links array to find
                    // the corresponding passage
                    edges.push({source:passageEntry, target:idToNodes.get(target)});
                }
            )
        });

        // sets up the graph with our nodes (data points) and lines that connect them.
        var layout = d3.layout.force().charge(-500).size([500,500]).nodes(data).links(edges);

        // set the dist between nodes
        layout.linkDistance(200);
        // selectAll will get everything labeled as a link, get edge data from it, and create a line for each edge
        // for each line we make, also make a css link for 
        var links = svg.selectAll('.link').data(edges).enter().append('line').attr('class', 'link');
        var nodes = svg.selectAll('.node').data(data).enter().append('circle').attr('class', 'node');
        //This is the same as nodes but will hold text instead
        var texts = svg.selectAll("text.label")
                .data(data)
                .enter().append("text")
                .attr("class", "label")
                .attr("fill", "white")
                .text(function(d) {  return d.name;  });

        layout.on('end', function() {
            // When this function executes, the force layout
            // calculations have concluded. The layout will
            // have set various properties in our nodes and
            // links objects that we can use to position them
            // within the SVG container.
            // First let's reposition the nodes. As the force
            // layout runs it updates the `x` and `y` properties
            // that define where the node should be centered.
            // To move the node, we set the appropriate SVG
            // attributes to their new values. We also have to
            // give the node a non-zero radius so that it's visible
            // in the container.
            console.log(nodes)
            // node size
            nodes.attr('r', 50)
            // node position
            .attr("cx", function(d) { 
                return d.x;
            })
            .attr("cy", function(d) { return d.y; });
            // We also need to update positions of the links.
            // For those elements, the force layout sets the
            // `source` and `target` properties, specifying
            // `x` and `y` values in each case.
            links.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            texts.attr("transform", function(d) {
                //Moves the labels so that they sit on top of the nodes
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
        layout.start();
        */
    },
    computed: {
        tokens(){
            var tokens = this.$parent.$parent.tokens;
            return JSON.stringify(tokens,null,4);
        }
    },
	components: {
		
	}
});
