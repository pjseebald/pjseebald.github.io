var pageModule = function() {
	
	// Start by loading the data from json files. Use the data to populate the components in the webpage.
	var baseDataUrl = '../data/';
	var dataUrls = {
		help: 'help.json',
		settings: 'settings.json',
		personal: 'personal.json'
	};
	var dataResults = {};

	// Get deferred object for each data json file
	var deferreds = $.map(dataUrls, function(value, key) {
		return $.getJSON(baseDataUrl + value, function(currentJsonData) {
			dataResults[key] = currentJsonData;
		});
	});

	// After data is loaded, then build the page
	$.when.apply($, deferreds).then(function() {
		buildPage();
	});
	
	/**
	 * Builds the webpage by creating different components.
	 * @return 		Nothing.
	 */
	var buildPage = function() {

		var filterMenuCategories = [
			{name: 'General Type', filterItems: dataResults['personal'].filters.general},
			{name: 'Technical Skills', filterItems: dataResults['personal'].filters.skills.technical},
			{name: 'Organizations', filterItems: dataResults['personal'].filters.organizations}
		];

		/**
		 * Vue app to store events between apps.
		 */
		var eventBus = new Vue({});

		/**
		 * App for title section container. Hub for general actions of opening the filter menu, 
		 * showing help section, and printing the resume.
		 */
		var titleApp = new Vue({
			el: '#title-container',
			data: {
				personTitle : dataResults['personal'].title
			},
			methods: {
				'toggleMenuPane' : function() {
					filterMenuApp.toggleMenuPane();
				},
				'showHelp' : function() {
					helpApp.toggleHelp();
				},
				'printResume' : function() {
					window.print();
				}
			}
		})

		/**
		 * App for the help section
		 */
		var helpApp = new Vue({
			el: '#help-container',
			data : {
				displayHelp : false,
				fullHelpTexts : dataResults['help'].sections,
				interactiveStep: 0
			},
			methods: {
				'toggleHelp' : function() {
					this.displayHelp = !this.displayHelp;
				}
			},
			components: {
				'help-section': {
					props: ['sectiontext'],
					template: '<div class="help-section-container"><span class="help-text-title">{{ sectiontext.title }}</span><span class="help-text-body"><div v-html="sectiontext.body"></div></span></div>'
				}
			}
		});

		/**
		 * App for the filter menu. 
		 * Creates the sections of the menu and handles adding, removing, and searching for filters.
		 */
		var filterMenuApp = new Vue({
			el: '#filter-menu',
			data: {
				filterCategories: filterMenuCategories,
				filterSearchText: '',
				fMenuShow: true,
				showSettings: false,
				match: 'any'
			},
			computed: {
				settings: function() {
					return {
						'match': this.match
					};
				}
			},
			watch: {
				match: function() {
					eventBus.$emit('change-settings', this.settings);
				}
			},
			methods: {
				'clearSearchContents': function() {
					this.filterSearchText = '';
				},
				'toggleMenuPane' : function() {
					this.fMenuShow = !this.fMenuShow;
					eventBus.$emit('toggle-menu');
				},
				'toggleSettingsPane' : function() {
					this.showSettings = !this.showSettings;
				}
			},
			components: {
				'filter-menu-category': {
					props: ['category','ftext'],
					template: '<div class="filter-category" :class="{\'expanded\' : this.expanded}" v-show="!checkEmpty"><div class="category-name-container" v-on:click="toggleExpand()"><span class="filter-category-icon icon"></span><span class="filter-category-name">{{ category.name }}</span></div>\
							<filter-menu-item v-show="expanded || ftext !== \'\'" v-for="(fi, index) in category.filterItems" v-bind:item="fi" :key="index" :ftextitem="ftext" @changeNumChildren="changeChildren">\
							</filter-menu-item>\
						</div>',
					methods: {
						'changeChildren': function(check) {
							this.numChildren = this.numChildren + ( check ? 1 : -1 );
							if (!this.expanded) {
								this.toggleExpand();
							}
						},
						'toggleExpand': function() {
							this.expanded = !this.expanded;
						}
					},
					data: function() {
						return {
							numChildren: this.category.filterItems.length,
							expanded: true
						}
					},
					computed: {
						checkEmpty: function() {
							return (this.numChildren === 0);
						}
					},
					components: {
						'filter-menu-item': {
							created: function() {
								var fmitem = this;
								eventBus.$on('remove-all-filters', function() {
									if (fmitem.isSelected) {
										fmitem.toggleSelection();
									}
								});
								eventBus.$on('removed-filter', function(input) {
									if (!input.menu && (fmitem.item.name === input.name)) {
										fmitem.toggleSelection();
									}
								});
							},
							props: ['item','ftextitem'],
							template: '<div class="filter-menu-item csr-p" v-show="checkMatch(item.name)" v-on:click="toggleSelection($event)" :class="{ selected : isSelected }">{{ item.name }}</div>',
							data: function() {
								return {
									showing: true,
									isSelected: false
								}
							},
							methods: {
								'checkMatch': function(value) {
									var match = this.ftextitem.toLowerCase();
									var check = match === '' ? true : ~value.toLowerCase().indexOf(match) ? true : false;
									if (check ^ this.$data.showing) {
										this.$data.showing = check;
										this.$emit('changeNumChildren', check);
									}
									return check;
								},
								'toggleSelection': function(event) {
									if (event) event.stopPropagation();
									this.$data.isSelected = !this.$data.isSelected;
									var n = this.item.name;
									if (this.$data.isSelected) {	// Selecting
										eventBus.$emit('added-filter', n);
									} else {	// Deselecting
										if (event) {
											eventBus.$emit('removed-filter', {name: n, menu: true});
										}
									}
								}
							}
						}
					}
				}
			}
		});

		/**
		 * App for the filter selection bar (bottom of the page, shows selected filters). 
		 * Creates the bar and the processes for adding/removing filters.
		 */
		var filterSelectionBarApp = new Vue({
			el: '#filter-selections',
			data: {
				selectedList: [],
				openMenu: true
			},
			created: function() {
				var bar = this;
				eventBus.$on('added-filter', function (name) {
					bar.addFilter(name);
				});
				eventBus.$on('removed-filter', function(input) {
					bar.clearFilter(input.name, input.menu);
				});
				eventBus.$on('toggle-menu', function() {
					bar.openMenu = !bar.openMenu;
				});
			},
			methods: {
				'clearAllFilters' : function() {
					this.selectedList = [];
					eventBus.$emit('remove-all-filters');
				},
				'clearFilter' : function(filterName, menu) {
					if (menu || menu === undefined) {
						// If the request came from the menu, then remove the filter from the selectedList
						this.selectedList = this.selectedList.filter( function(e) {return e !== filterName} );
					}
					if (!menu && menu === undefined) {
						// If removal request came from the filter selections bar component, need to send removal to filter menu as well
						eventBus.$emit('removed-filter', {name: filterName, menu: false});
					}
				},
				'addFilter' : function(filterName) {
					if (this.selectedList.indexOf(filterName) === -1) {
						// If the filter isn't in the list already, add it.
						this.selectedList.push(filterName);
					}
				}
			},
			components: {
				'selection-name' : {
					props: ['filter'],
					template: '<div class="selected-filter"><div class="sf-name">{{ filter }}</div><span class="sf-close-icon icon" v-on:click="removeSelFilter()"></span></div>',
					methods: {
						'removeSelFilter' : function () {
							this.$emit('rem-filter', this.filter);
						}
					}
				}
			}
		});

		/**
		 * Vue component defining the menu for each resume section.
		 * The menu contains the functionality for showing and hiding all stories in that section.
		 */
		Vue.component('resume-section-menu', {
			data: function() {
				return {
					visible: false,
					propsAll: {
						show: false,
						hide: false
					}
				}
			},
			methods: {
				'toggleList' : function() {
					this.visible = !this.visible;
				},
				'toggleAllVisibility' : function(visible, event) {
					event.stopPropagation();
					this.propsAll.show = this.propsAll.show ? false : visible;		// Toggle show all
					this.propsAll.hide = this.propsAll.hide ? false : !visible;		// Toggle hide all
					this.$parent.toggleAllVisibility(visible);
				}
			},
			props: ['section'],
			template: '<div class="resume-section icon menu" :class="[section, {\'expanded\': this.visible}]" v-on:click="toggleList()"><ul class="section-menu-lst" v-show="this.visible">\
			<li :class="{\'selected\': this.propsAll.show}" v-on:click="toggleAllVisibility(true, $event)">Show All</li><li :class="{\'selected\': this.propsAll.hide}" v-on:click="toggleAllVisibility(false, $event)">Hide All</li>\
			</ul></div>'
		});

		/**
		 * Vue component defining the resume card: the fundamental unit for displaying a resume story in any section
		 * Has a general form and functionality with inner HTML specific to the type of resume section.
		 */
		Vue.component('resume-card', {
			created: function() {
				var crd = this;
				eventBus.$on('added-filter', function(name) {
					crd.checkVisibility(name, true);
				});
				eventBus.$on('removed-filter', function(name) {
					crd.checkVisibility(name, false);
				});
				eventBus.$on('change-settings', function(settings) {
					crd.checkVisibility();
				});
				eventBus.$on('remove-all-filters', function() {
					crd.matchedFilters = [];
					var initVisibility = crd.visible;
					crd.visible = true;
					crd.changeNumChildren(initVisibility);	// If visibility changed, then change number of children of parent
				});
			},
			data: function() {
				return {
					tags: this.content.tags.split(','),
					visible: true,
					matchedFilters: []
				}
			},
			computed: {
				isVisible : function() {
					// Used to persist state if user chooses to show/hide all
					return this.allVisible ? true : this.allHidden ? false : this.visible;
				}
			},
			methods: {
				/**
				 * Method for checking if resume story is still visible after any event.
				 * Used when adding, removing filters or changing settings
				 */
				'checkVisibility' : function(f, added) {
					var initVisibility = this.visible;
					if (added) {	// Adding a filter to list
						if (this.tags.indexOf(f) > -1) {this.matchedFilters.push(f);}

						this.visible = filterMenuApp.match === 'any' ? (this.matchedFilters.length > 0) : 
							filterMenuApp.match === 'all' ? (this.matchedFilters.length === filterSelectionBarApp.selectedList.length) : true;

					} else {	// Removing a filter from the list
						var filtLen = filterSelectionBarApp.selectedList.length;
						if (f) {
							var i = this.matchedFilters.indexOf(f.name);
							if (i > -1) {this.matchedFilters.splice(i, 1);}
						}

						var mfLen = this.matchedFilters.length;
						// Set visibility depending on settings and current filters
						if (filterMenuApp.match === 'any') {
							this.visible = (filtLen === 0) || !(mfLen === 0);
						} else if (filterMenuApp.match === 'all') {
							this.visible = (filtLen === 0) || (mfLen === filtLen);
						}
					}

					this.changeNumChildren(initVisibility);
				},
				'changeNumChildren' : function(initVisibility) {
					// Check if visibility changed. If so, emit the 'changeNumChildren' event.
					if (initVisibility ? !this.visible : this.visible) {		// XOR ternary operation -- if visibility changes from initial
						this.$emit('changeNumChildren', this.visible);
					}
				}
			},
			components: {
				'education': {
					props: ['content'],
					template: '<div class="card-flex-container"><div class="card-row"><span class="edu-org f-w-b">{{ content.org }}</span><span class="edu-yr">{{ content.gradYear }}</span></div><div class="card-row"><span class="edu-deg">{{ content.degree }}</span><span class="edu-gpa">{{ content.gpa }} GPA</span></div></div>'
				},
				'experience': {
					props: ['content'],
					template: '<div class="card-flex-container"><div class="card-row"><div class="exp-desc">{{ content.description }} <span class="exp-yr">[{{ content.years.start }} - {{ content.years.end }}]</span></div></div></div>'
				},
				'projects': {
					props: ['content'],
					template: '<div class="card-flex-container"><div class="card-row"><div v-html=\"content.description\"></div></div></div>'
				},
				'activities': {
					props: ['content'],
					template: '<div class="card-flex-container"><div class="card-row">{{content.description}}</div></div>'
				}
			},
			props: ['content','type','allHidden','allVisible'],
			template: '<div class="card" :class="[type]" v-show="isVisible"><component :is="type" :content="content"></component></div>'
		});

		/**
		 * App for resume section.
		 * 
		 */
		var resumeApp = new Vue({
			el: '#resume',
			components: {
				'resume-section' : {
					data: function() {
						return {
							sectionContent: dataResults['personal'].resume[this.type],
							setAllVisible: false,
							setAllHidden: false
						}
					},
					methods: {
						// Change visibility for all cards within section
						'toggleAllVisibility' : function(visible) {
							this.setAllVisible = this.setAllVisible ? false : visible;
							this.setAllHidden = this.setAllHidden ? false : !visible;
						}
					},
					components: {
						// Define experience stories within an organization. Use this component to represent organization with cards inside it.
						'experience-org-card': {
							data: function() {
								return {
									numChildren: this.content.descriptions.length
								}
							},
							computed: {
								// Hide the organization card if all children are hidden
								checkEmpty: function() {
									return (this.numChildren === 0 || this.allHidden);
								}
							},
							methods: {
								'changeChildren': function(check) {
									this.numChildren = this.numChildren + ( check ? 1 : -1 );
								},
							},
							props: ['content','allHidden','allVisible'],
							template: '<div class="exp-org-card" v-show="!checkEmpty"><span class="exp-org-card-title">{{content.org}}, {{content.position}}</span><resume-card v-for="(e, index) in content.descriptions" :type="\'experience\'" :key="index" :content="e" @changeNumChildren=\'changeChildren\' :allHidden="allHidden" :allVisible="allVisible"></resume-card></div>'
						}
					},
					props: ['type'],
					template: '<div class="resume-section-container"><resume-section-menu :section="type"></resume-section-menu><div class="section-title" :class="type">{{type.charAt(0).toUpperCase() + type.slice(1)}}</div><div class="section-body" :class="type">\
						<component :is="type === \'experience\' ? \'experience-org-card\' : \'resume-card\'" v-for="(e, index) in this.sectionContent" :key="index" :type="type" :content="e" :allHidden="setAllHidden" :allVisible="setAllVisible"></component></div></div>'
				}
			}
		});
	
	};

return {};

} ();
