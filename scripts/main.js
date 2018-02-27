var pageModule = function() {
	
	// Start by loading the data from json files. Use the data to populate the components in the webpage.
	const baseDataUrl = '../data/';
	const dataUrls = {
		help: 'help.json',
		settings: 'settings.json',
		personal: 'personal.json'
	};
	const dataResults = {};

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
	 * Stores for managing variables referenced by multiple apps.
	 * filters: manages which filters are selected in the menu to apply to resume stories.
	 */	
	var filters = {
		selected: [],
		addSelected: function(name) {
			this.selected.push(name);
		},
		clearSelected: function() {
			this.selected.length = 0;
		},
		removeSelected: function(name) {
			this.selected.splice(this.selected.indexOf(name), 1);
		}
	}
	
	/**
	 * Stores for managing variables referenced by multiple apps.
	 * filters: manages which filters are selected in the menu to apply to resume stories.
	 */
	const filtersStore = {
		selected: [],
		addSelected: function(name) {
			if (this.selected.includes(name)) {
				this.selected.push(name);
			}
		},
		clearSelected: function() {this.selected.length = 0;},
		removeSelected: function(name) {
			if (this.selected.includes(name)) {
				this.selected.splice(this.selected.indexOf(name), 1);
			}
		}
	};
	
	const settingsStore = {
		settings: {},
		defaults: {},
		changeSetting: function(key, value) {this.settings[key] = value;},
		resetDefaults: function(init) {
			let initSettings = dataResults.settings;
			for (let i = 0; i < initSettings.length; i++) {
				let key = initSettings[i].name;
				if (init) {		// Initializing defaults from the file
					this.defaults[key] = initSettings[i].defaultValue;
				}
				this.settings[key] = this.defaults[key];
			}
		}
	};
	
	/**
	 * Builds the webpage by creating different components.
	 * @return 		Nothing.
	 */
	let buildPage = function() {
		
		// Apply default settings
		settingsStore.resetDefaults(true);

		const filterMenuCategories = [
			{name: 'General', filterItems: dataResults['personal'].filters.general},
			{name: 'Technical Skills', filterItems: dataResults['personal'].filters.skills.technical},
			{name: 'Sections', filterItems: dataResults['personal'].filters.sections},
			{name: 'Organizations', filterItems: dataResults['personal'].filters.organizations}
		];

		/**
		 * Vue app to store events between apps.
		 */
		let eventBus = new Vue({});

		/**
		 * App for title section container. Hub for general actions of opening the filter menu, 
		 * showing help section, and printing the resume.
		 */
		let titleApp = new Vue({
			el: '#title-container',
			created: function() {
				eventBus.$on('toggle-help', () => {this.showWelcome = !this.showWelcome;});
				eventBus.$on('print-resume', () => {this.printResume();});
			},
			data: {
				personTitle: dataResults['personal'].title,
				showWelcome: true
			},
			methods: {
				'toggleMenuPane' : function() {eventBus.$emit('toggle-filter-menu');},
				'showHelp' : function() {
					if (!this.showWelcome) {
						eventBus.$emit('toggle-help');
					}
				},
				'showResume' : function() {
					if (this.showWelcome) {
						eventBus.$emit('toggle-help');
					}
				},
				'printResume' : function() {window.print();}
			}
		})

		/**
		 * App for the filter menu. 
		 * Creates the sections of the menu and handles adding, removing, and searching for filters.
		 */
		let menuApp = new Vue({
			el: '#filter-menu',
			created: function() {
				eventBus.$on('toggle-filter-menu', (openMenu) => {this.toggleMenuPane(openMenu);});
				eventBus.$on('change-setting', (keyval) => {this.changeGlobalSetting(keyval);});
			},
			data: {
				filterCategories: filterMenuCategories,
				settings: dataResults.settings,
				filterSearchText: '',
				fMenuShow: false,
				showSettings: false
			},
			methods: {
				'clearSearchContents': function() {this.filterSearchText = '';},
				'toggleMenuPane' : function(openMenu) {
					this.fMenuShow = openMenu ? true : !this.fMenuShow;
					this.showSettings = false;
				},
				'toggleSettingsPane' : function() {this.showSettings = !this.showSettings;},
				'clearAllFilters': function() {
					filtersStore.clearSelected();
					eventBus.$emit('remove-all-filters');
				},
				'changeGlobalSetting': function(setting) {
					settingsStore.changeSetting(setting.key, setting.value);
					eventBus.$emit('change-settings');
				},
				'resetDefaultSettings': function() {
					settingsStore.resetDefaults();
					eventBus.$emit('reset-default-settings');
				}
			},
			components: {
				'setting-item': {
					props: ['item'],
					template: `<div class="setting-wrapper">
								<label class="settings heading">{{ item.heading }}</label>
								<component :is="item.type + '-setting'" :inputs="item.inputs" :settingName="item.name"></component>
							</div>`,
					components: {
						'radio-setting': {
							created: function() {
								eventBus.$on('reset-default-settings', () => {
									this.updateSettingValue();
								});
							},
							data: function() {
								return {
									curSettingValue: settingsStore.defaults[this.settingName]
								}
							},
							methods: {
								updateSettingValue: function(newValue) {this.curSettingValue = newValue ? newValue : settingsStore.defaults[this.settingName];}
							},
							props: ['inputs','settingName'],
							template: `<ul>
										<li class="radio-wrapper" v-for="(settingOption, index) in inputs" :key="index">
											<radio-setting-input :settingName="settingName" :settingId="settingOption.id" :settingValue="settingOption.value" :curValue="curSettingValue" @changeValue="updateSettingValue"></radio-setting-input>\
											<label class="settings" :for="settingOption.id">{{ settingOption.labelText }}</label>
											<div class="check"></div>
										</li>
									</ul>`,
							components: {
								'radio-setting-input': {
									computed: {
										radioValue: {
											get: function() {return this.curValue;},
											set: function(newValue) {
												this.$emit('changeValue', newValue);
												eventBus.$emit('change-setting', {key: this.settingName, value: newValue});
											}
										}
									},
									props: ['settingName','settingId','settingValue','curValue'],
									template: `<input type="radio" :name="settingName" :id="settingId" :value="settingValue" v-model="radioValue" :thisCurValue="curValue" />`
								}
							}
						}
					}
				},
				'filter-menu-category': {
					props: ['category','ftext'],
					template: `<div class="filter-category" :class="{'expanded' : this.expanded}" v-show="!checkEmpty">
								<div class="category-name-container" v-on:click="toggleExpand()">
									<span class="filter-category-icon icon"></span>
									<span class="filter-category-name">{{ category.name }}</span>
								</div>
								<filter-menu-item v-show="expanded || ftext !== ''" v-for="(fi, index) in category.filterItems" v-bind:item="fi" :key="index" :ftextitem="ftext" @changeNumChildren="changeChildren">
								</filter-menu-item>
							</div>`,
					methods: {
						'changeChildren': function(addChild) {
							this.numChildren = this.numChildren + ( addChild ? 1 : -1 );
							if (!this.expanded) {
								this.toggleExpand();
							}
						},
						'toggleExpand': function() {this.expanded = !this.expanded;}
					},
					data: function() {
						return {
							numChildren: this.category.filterItems.length,
							expanded: true,
							breakToggleLoop: false
						}
					},
					computed: {
						checkEmpty: function() {return (this.numChildren === 0);}
					},
					components: {
						'filter-menu-item': {
							created: function() {
								eventBus.$on('remove-all-filters', () => {
									if (fmitem.isSelected) {
										fmitem.toggleSelection();
									}
								});
							},
							props: ['item','ftextitem'],
							template: `<div class="filter-menu-item csr-p" v-show="checkMatch(item.name)" v-on:click.stop="toggleSelection($event)" :class="{ selected : isSelected }">{{ item.name }}</div>`,
							data: function() {
								return {
									showing: true,
									isSelected: false
								}
							},
							methods: {
								'checkMatch': function(value) {
									let matchValue = this.ftextitem.toLowerCase();
									let doesMatch = matchValue === '' ? true : value.toLowerCase().includes(matchValue) ? true : false;
									if (doesMatch ^ this.$data.showing) {
										this.$data.showing = doesMatch;
										this.$emit('changeNumChildren', doesMatch);
									}
									return doesMatch;
								},
								'toggleSelection': function(event) {
									this.$data.isSelected = !this.$data.isSelected;
									let n = this.item.name;
									if (this.$data.isSelected) {	// Selecting
										filtersStore.addSelected(n);
										eventBus.$emit('added-filter', n);
									} else {	// Deselecting
										filtersStore.removeSelected(n);
										if (event) {
											eventBus.$emit('removed-filter', n);
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
		 * Vue component defining the resume card: the fundamental unit for displaying a resume story in any section
		 * Has a general form and functionality with inner HTML specific to the type of resume section.
		 */
		Vue.component('resume-card', {
			created: function() {
				eventBus.$on('added-filter', (name) => {
					this.checkVisibility(name, true);
				});
				eventBus.$on('removed-filter', (name) => {
					this.checkVisibility(name, false);
				});
				eventBus.$on(['change-settings','reset-default-settings'], () => {
					this.checkVisibility();
				});
				eventBus.$on('remove-all-filters', () => {
					this.matchedFilters.length = 0;
					let initVisibility = this.visible;
					this.visible = true;
					this.changeNumChildren(initVisibility);	// If visibility changed, then change number of children of parent
				});
				
				// Add the section type to the list of tags (+ capitalize first letter)
				this.tags.push(this.type.charAt(0).toUpperCase() + this.type.slice(1));
			},
			data: function() {
				return {
					tags: this.content.tags.split(','),
					visible: true,
					matchedFilters: []
				}
			},
			methods: {
				/**
				 * Method for checking if resume story is still visible after any event.
				 * Used when adding, removing filters or changing settings
				 */
				'checkVisibility' : function(filterName, added) {
					let initVisibility = this.visible;
					let matchSetting = settingsStore.settings.filterMatch;
					if (added) {	// Adding a filter to list
						if (this.tags.includes(filterName)) {this.matchedFilters.push(filterName);}

						// Setting visibility of card based on settings and filters
						this.visible = matchSetting === 'any' ? (this.matchedFilters.length > 0) : 
							matchSetting === 'all' ? (this.matchedFilters.length === filtersStore.selected.length) : true;
					} else {	// Removing a filter from the list OR changing settings
						let filtLen = filtersStore.selected.length;
						if (filterName && !Array.isArray(filterName) && this.matchedFilters.includes(filterName)) {	// Removing one filter from the list
							this.matchedFilters.splice(this.matchedFilters.indexOf(filterName), 1);
						}

						// Setting final visibility
						let mfLen = this.matchedFilters.length;
						// Set visibility depending on settings and current filters
						if (matchSetting === 'any') {
							this.visible = (filtLen === 0) || !(mfLen === 0);
						} else if (matchSetting === 'all') {
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
					template: `<div class="card-flex-container">
								<div class="card-row">
									<span class="edu-org f-w-b">{{ content.org }}</span>
									<span class="edu-yr">{{ content.gradYear }}</span>
								</div>
								<div class="card-row">
									<span class="edu-deg">{{ content.degree }}</span>
								</div>
							</div>`
				},
				'experience': {
					props: ['content'],
					template: `<div class="card-flex-container">
								<div class="card-row">
									<div class="exp-desc">{{ content.description }} <span class="exp-yr">[{{ content.years.start }} - {{ content.years.end }}]</span></div>
								</div>
							</div>`
				},
				'projects': {
					props: ['content'],
					template: `<div class="card-flex-container">
								<div class="card-row">
									<div v-html="content.description"></div>
								</div>
							</div>`
				},
				'activities': {
					props: ['content'],
					template: `<div class="card-flex-container">
								<div class="card-row">{{content.description}}</div>
							</div>`
				}
			},
			props: ['content','type'],
			template: `<div class="card" :class="[type]" v-if="visible"><component :is="type" :content="content"></component></div>`
		});

		/**
		 * App for resume section.
		 * Contains cards for each resume story
		 */
		let resumeApp = new Vue({
			el: '#main-page',
			created: function() {
				eventBus.$on('toggle-help', () => {
					this.showWelcome = !this.showWelcome;
					if (this.showWelcome) {
						this.showHelp = true;
					}
				});
			},
			methods: {
				'toggleFilterMenu': function() {
					eventBus.$emit('toggle-filter-menu', true);
				},
				'toggleHelp': function() {
					eventBus.$emit('toggle-help');
				},
				'printResume': function() {
					eventBus.$emit('print-resume');
				}
			},
			data: {
				showWelcome: true,
				showHelp: false,
				fullHelpTexts : dataResults['help'].sections,
			},
			components: {
				'help-section': {
					props: ['sectiontext'],
					template: `<div class="help-section-container" :class="sectiontext.class ? sectiontext.class : ''">
								<span class="help-text-title">{{ sectiontext.title }}</span>
								<span class="help-text-body">
									<div v-html="sectiontext.body"></div>
								</span>
							</div>`
				},
				'resume-section' : {
					data: function() {
						return {
							sectionContent: dataResults['personal'].resume[this.type],
							showSection: true
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
								checkEmpty: function() {return (this.numChildren === 0);}
							},
							methods: {
								'changeChildren': function(addChild) {this.numChildren = this.numChildren + ( addChild ? 1 : -1 );},
							},
							props: ['content'],
							template: `<div class="exp-org-card" v-show="!checkEmpty">
										<span class="exp-org-card-title">{{content.org}}, {{content.position}}</span>
										<resume-card v-for="(e, index) in content.descriptions" :type="'experience'" :key="index" :content="e" @changeNumChildren='changeChildren'></resume-card>
									</div>`
						}
					},
					props: ['type'],
					template: `<div class="resume-section-container">
								<div class="section-title arrow" :class="[type,{'closed down': !showSection}, {'up': showSection}]" v-on:click="showSection = !showSection">{{type.charAt(0).toUpperCase() + type.slice(1)}}</div>
								<div class="section-body" :class="type" v-show="showSection">
									<component :is="type === 'experience' ? 'experience-org-card' : 'resume-card'" v-for="(e, index) in this.sectionContent" :key="index" :type="type" :content="e"></component>
								</div>
							</div>`
				}
			}
		});
	}

return {};

} ();
