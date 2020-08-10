const Vue = require('vue');
const storyTab = require('../../../story-edit-view/story-toolbar/story-tab');
require('./index.less');
 
module.exports = Vue.extend({
    data: () => ({
   
    }),
 
    props: {
       
	},

    template: require('./index.html'),
    
	methods: {
        addStoryWindow(){
			new storyTab().$mountTo(document.body);
		}
    }
});

