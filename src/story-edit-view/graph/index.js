/*
Draws connector lines between passages.
*/

const Vue = require('vue');
const d3 = require('d3');
const dagre = require('dagre');
const dagreD3 = require('dagre-d3')
const linkParser = require('./link-parser');
const { map } = require('core-js/fn/array');
const tokenize = require('./tokenize');
const covertToNode = require('./translate');
const graphData = require('./graphData');
const passage = require('../../data/actions/passage');
require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
        mode: null
    },
    
    ready() {
        console.log("graphData");
    },
    computed: {
        tokens: function(){
            var tokens = tokenize(this.$parent.$parent.story);
            return JSON.stringify(tokens,null,4);
        },
        nodes: function(){
            var tokens = tokenize(this.$parent.$parent.story);
            var passages = covertToNode(tokens);
            return JSON.stringify(passages,null,4);
        },
        graph: function(){
            var story = this.$parent.$parent.story;
            var tokens = tokenize(this.$parent.$parent.story);
            var passages = covertToNode(tokens);
            var data = graphData(passages,story);
            return JSON.stringify(data.edges,null,4);
        },
        draw: function(){
            //Converts story passages into parsable graphdata
            var story = this.$parent.$parent.story;
            var tokens = tokenize(this.$parent.$parent.story);
            var passages = covertToNode(tokens);
            var data = graphData(passages,story);


            //Dagre-layout setup
            var g = new dagre.graphlib.Graph();
            // Set an object for the graph label
            g.setGraph({});
            // Default to assigning a new object as a label for each new edge.
            g.setDefaultEdgeLabel(function() { return {}; });

            data.nodes.forEach(node => {
               g.setNode(node.index,{label: JSON.stringify(node,null,2)})
            });

            data.edges.forEach((value,key) => {
                for(const entry of value){
                    g.setEdge(key.index,entry.index);
                }
            });

            
            // Create the renderer
            var render = new dagreD3.render();

            // Run the renderer. This is what draws the final graph.
            render(d3.select("#graph"), g);

        }
    },
	components: {
		
	}
});
