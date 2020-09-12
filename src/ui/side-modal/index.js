/*
A generic modal dialog component. This implements the Thenable mixin and
resolves itself when it is closed.
*/

const Vue = require('vue');
const domEvents = require('../../vue/mixins/dom-events');
const { thenable, symbols: { reject, resolve } } =
	require('../../vue/mixins/thenable');
const story = require('../../data/actions/story');

const animationEndEvents = [
	'animationend',
	'webkitAnimationEnd',
	'MSAnimationEnd',
	'oAnimationEnd'
];

require('./index.less');

const SideModal = module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		class: '',
		title: '',
		origin: null,
		canWiden: false,
		canClose: {
			type: Function,
			required: false
		},
		parent: null
	},


	computed: {
		classes() {
			return this.class + (this.wide ? ' wide' : '');
		}
	},

	ready() {
		/*
		If an origin is specified, set it as the point the modal dialog grows
		out of.
		*/
		console.log(this)

		if (this.origin) {
			const originRect = this.origin.getBoundingClientRect();

		}

		let body = document.querySelector('body');

		body.classList.add('modalOpen');
		this.on(body, 'keyup', this.escapeCloser);

		/*
		We have to listen manually to the end of the transition in order to an
		emit an event when this occurs; it looks like Vue only consults the
		top-level element to see when the transition is complete.
		*/

		const notifier = () => {
			/*
			This event is currently only listened to by <code-mirror> child
			components.
			*/
			this.$broadcast('transition-entered');

		};


	},
	beforeDestroy(){
		console.log(this.$parent)
		this.$parent.pushLeft();
	},

	destroyed() {
		let body = document.querySelector('body');
		body.classList.remove('modalOpen');
		this.$emit('destroyed');
	},

	methods: {
		close(message) {
			if (typeof this.canClose === 'function' && !this.canClose()) {
				return;
			}

			this.$emit('close', message);
		},

		toggleWide() {
			this.wide = !this.wide;
			console.log(this)
		},

		reject(message) {
			if (typeof this.canClose === 'function' && !this.canClose()) {
				return;
			}

			this.$emit('reject', message);
		},

		escapeCloser(e) {
			if (e.keyCode === 27) {
				e.preventDefault();
				this.close();
			}
		}
	},

	events: {
		close(message) {
			this[resolve](message);
			this.$parent.pushLeft();
			this.$destroy(true);
		},

		reject(message) {
			this[reject](message);
			this.$destroy(true);
		}
	},

	mixins: [domEvents, thenable]
});

/*
We have to transition in our individual parts through a custom transition.
*/

SideModal.transition('modal-dialog', {
	beforeEnter: function(el) {
		let overlay = el.querySelector('#side-modal-overlay');

		overlay.classList.add('fade-in-out-transition', 'fade-in-out-enter');

	},

	enter: function(el, done) {
		let overlay = el.querySelector('#side-modal-overlay');
		Vue.nextTick(() => {
			overlay.classList.remove('fade-in-out-enter');
			overlay.addEventListener('transitionend', done);
		});
	},

	leave: function(el, done) {
		let overlay = el.querySelector('#side-modal-overlay');
		overlay.classList.add('fade-in-out-leave');
		overlay.addEventListener('transitionend', done);
	}
});
