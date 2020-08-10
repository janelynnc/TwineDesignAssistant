const Vue = require('vue');
const {selectPassages} = require('../../../data/actions/passage');
require('./index.less');

module.exports = Vue.extend({
    data: () => ({
        shapes: [],
        story: null,
        store: null,
        parent: null
    }),
 	
	components: {
		'side-modal': require('../../../ui/side-modal')
	},
    
    template: require('./index.html'),
    ready(){
        selectPassages(this.store,this.story.id,()=>{
            return true;
        } );
        this.parent.$dispatch('passage-drag-complete',window.innerWidth*.25,0)
    },

    destroyed() {
        console.log("destroyed")
        
    },

	methods: {
        showNew() {
            this.shapes.push("shape")
            console.log(this.story)
        },
 
        remove(){
            if(this.shapes.length>0){
                this.shapes.pop()
            }
        },

        pushLeft(){
            selectPassages(this.store,this.story.id,()=>{
                return true;
            } );
            this.parent.$dispatch('passage-drag-complete',window.innerWidth*-.25,0)
        }
    }
});

