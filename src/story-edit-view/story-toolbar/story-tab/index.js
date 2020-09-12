const Vue = require('vue');
const {selectPassages} = require('../../../data/actions/passage');
const uniq = require('lodash.uniq');
const linkParser = require('../../../data/link-parser');

require('./index.less');

module.exports = Vue.extend({
    data: () => ({
        shapes: [],
        store: null,
        storyId: null,
        story: null
    }),
    
    //Any property that gets calculated or created when its call i.e this.graphData 
    //would call the graphdata function
    computed: {
        graphData: function(){
            //all the passages in the story
            var data = this.story.passages;
            //Based on how the link arrow component identifies links
            //We shove it into the passage so every passage knows where it's links go
            data.forEach(passage => {
                //we add a field called links with no repeats
                //has the names of all passages it leads to
                passage.links = uniq(linkParser(passage.text, true));
            });  
            return data;
        },

        tokens: function(){
            var story = this.story;
            var passages = story.passages;
            var tokens = [];
            //Parse the script in each passage and turn the into nodes
            passages.forEach(passage => {
                var script = passage.text;
                passage.tokens = []
                //This pattern matchs any opening and closing tags for html, links, or a macro
                //For a more detailed explanation and visualization visit
                //regexr.com/5bjtm
                var patterns = new RegExp(/\<.*?\>|\<\/.+\>|\[\[|\]\]|\([\w]*:|\)|\(|\[|\]/g) 
                //Split the script into an array of opening and closing tags this helps us deal with html tags
                //where we have to read by word and not by character
                const matches = script.matchAll(patterns);
                const lookupTags = [
                    {open:new RegExp(/\<\w*?\>/),close:new RegExp(/\<\/.+\>/),type:"Html"},
                    {open:new RegExp(/\[\[/),close:new RegExp(/\]\]/),type:"Macro"},
                    {open:new RegExp(/\([\w]*:/),close:new RegExp(/\)/),type:"Macro"},
                    {open:new RegExp(/\[/),close:new RegExp(/\]/),type:"Body"}

                ];
                var previousEnd = 0;
                var start = 0;
                var end = 0;
                var bracketCount = 0;
                var currentPattern = [];
                for (const match of matches) {
                    console.log(`Found ${match[0]} start=${match.index} end=${match.index + match[0].length}.`);
                    //Check if the match is has something other than whitespace
                    if(match[0].replace(/\s/g, '').length>0){
                        for(const tag of lookupTags){
                            if(tag.open.test(match[0])){
                                if(bracketCount<=0){
                                    start=match.index;
                                    currentPattern.push(tag.type);
                                }
                                bracketCount++;
                                console.log(`Open ${match[0]}`)
                                break;
                            }
                            if(tag.close.test(match[0])){
                                bracketCount--;
                                console.log(`Close ${match[0]}`)
                                break;
                            }
                        }
                        console.log(bracketCount);
                        if(bracketCount <= 0){
                            end = match.index + match[0].length;
                            if(start-previousEnd>1 ){
                                passage.tokens.push({
                                    script: script.substring(previousEnd,start), 
                                    type: "Content"
                                });
                            }
                            if(currentPattern[currentPattern.length-1] == "Body"){
                                console.log(`Body ${script.substring(start,end)}`)
                                passage.tokens[passage.tokens.length-1].script +=script.substring(start,end);
                                currentPattern.pop()
                            }else{
                                passage.tokens.push({
                                    script: script.substring(start,end), 
                                    type: currentPattern.pop()
                                });
                            }
                            previousEnd = end;
                        }
                    }
                }

                lastToken = script.substring(end,script.length-1);
                if(end<script.length-1 && lastToken.replace(/\s/g, '').length>0){
                    passage.tokens.push({
                        script: lastToken, 
                        type: "Content"
                    });
                }
                //Next we'll take these tokens and turn them in passages
                tokens.push({
                    "passage":passage.name,
                    "tokens": passage.tokens
                })
            })

            return JSON.stringify(tokens,null,4);

        }
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

            selectPassages(this.store,this.storyId,()=>{
                return true;
            } );
            this.parent.$dispatch('passage-drag-complete',window.innerWidth*-.25,0)
        }
    }
});

