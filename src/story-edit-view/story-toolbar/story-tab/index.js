const Vue = require('vue');
const {selectPassages} = require('../../../data/actions/passage');
const uniq = require('lodash.uniq');
const linkParser = require('../../../data/link-parser');

require('./index.less');

module.exports = Vue.extend({
    data: () => ({
        mode: "GraphData",
        store: null,
        storyId: null,
        story: null
    }),
    
    //Any property that gets calculated or created when its call i.e this.graphData 
    //would call the graphdata function
    computed: {

    },

	components: {
        'side-modal': require('../../../ui/side-modal'),
        'graph' : require('../../../story-edit-view/graph')
	},
    
    template: require('./index.html'),
    //This runs when this componenent is added (think awake)
    ready(){
        console.log("story");
        console.log(this.graphData);
        

        //select all passages
        selectPassages(this.store,this.storyId,()=>{
            return true;
        } );
        //Ask the story editor to offset everything in the x direction by
        //window.innerWidth*.25 where wndow.innerWidth is the browser width
        this.parent.$dispatch('passage-drag-complete',window.innerWidth*.25,0)
    },

    destroyed() {
        console.log(this)
        
    },

	methods: {
        graphData() {
            this.mode = "GraphData";
        },
 
        tokens(){
            this.mode = "Tokens";
        },

        nodes(){
            this.mode = "Nodes"
        },

        pushLeft(){

            selectPassages(this.store,this.storyId,()=>{
                return true;
            } );
            this.parent.$dispatch('passage-drag-complete',window.innerWidth*-.25,0)
        }
    }
});

