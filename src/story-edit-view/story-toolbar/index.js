// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
const zoomMappings = require('../zoom-settings');
const storyTab = require('./story-tab');
const {playStory, testStory} = require('../../common/launch-story');
const {updateStory} = require('../../data/actions/story');
const {selectPassages} = require('../../data/actions/passage');
require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		},

		zoomDesc: {
			type: String,
			required: true
		}
	},

	components: {
		'story-menu': require('./story-menu'),
		'story-search': require('./story-search')
		
	},

	methods: {
		setZoom(description) {
			this.updateStory(this.story.id, {zoom: zoomMappings[description]});
		},

		test() {
			testStory(this.$store, this.story.id);
		},

		play() {
			playStory(this.$store, this.story.id);
		},

		addPassage() {
			this.$dispatch('passage-create');
		},

		addStoryWindow(){
			new storyTab({
				data: {
					story: this.story,
					store: this.$store,
					parent: this
				}
			}).$mountTo(document.body);
		}
	},

	vuex: {
		actions: {
			updateStory,
			selectPassages
		}
	}
});
