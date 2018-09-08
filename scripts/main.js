var pageModule = function() {
	
	const svgSource = './img/icons.svg';
	
	const _showAllText = 'Show All';
	const _hideAllText = 'Hide All';
	
	let getHash = function() {
		return window.location.hash.substring(1);
	};
	
	// Start by loading the data from json files. Use the data to populate the components in the webpage.
	const baseDataUrl = '../data/';
	const dataUrls = {
		help: 'help.json',
		settings: 'settings.json',
		personal: 'personal.json',
		layout: 'layout.json'
	};
	const dataResults = {};

	// Get deferred object for each data json file
	var deferreds = $.map(dataUrls, function(value, key) {
		return $.getJSON(baseDataUrl + value, function(currentJsonData) {
			dataResults[key] = currentJsonData;
		});
	});

	let results = {};
	// After data is loaded, then build the page
	$.when.apply($, deferreds).then(function() {
		results = buildPage();
	});
	
	/**
	 * Stores for managing variables referenced by multiple apps.
	 * filters: manages which filters are selected in the menu to apply to resume stories.
	 */
	const filtersStore = {
		selectedSections: {},
		selected: [],
		clearSelected: function(section) {
			if (section in this.selectedSections) {
				this.selectedSections[section].length = 0;
			}
		},
		addSelectedFilter: function(name, section) {
			if (name === _showAllText || name === _hideAllText) {
				this.clearSelected(section);
				return;
			}
			
			if (!this.selectedSections.hasOwnProperty(section)) {
				this.selectedSections[section] = [];
			}
			this.selectedSections[section].push(name);
		},
		removeSelectedFilter: function(name, section) {
			if (name !== _showAllText && name !== _hideAllText) {
				this.selectedSections[section].splice(this.selectedSections[section].indexOf(name), 1);
			}
		},
		getFilters: function(section) {
			return this.selectedSections.hasOwnProperty(section) ? this.selectedSections[section] : [];
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
	
	const targetStore = {
		currentTarget : '',
		updateTarget : function(section) {
			if (section) {
				this.currentTarget = section;
			} else {
				let hash = getHash();
				this.currentTarget = hash === '' ? 'welcome' : hash;
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
		let sections = [];
		for (index in dataResults['layout'].sections) {
			sections.push(dataResults['layout'].sections[index].name);
		}
		targetStore.updateTarget();

		/**
		 * Vue app to store events between apps.
		 */
		let eventBus = new Vue({});
		
		/**
		 * Event watcher for hash change
		 */
		window.onhashchange = function() {
			eventBus.$emit('change-section', getHash());
		};

		/**
		 * App for title section container. Hub for general actions of opening the filter menu, 
		 * showing help section, and printing the resume.
		 */
		let titleApp = new Vue({
			el: '#title-container',
			data: {
				personTitle: dataResults['personal'].title,
			}
		});
		
		let navApp = new Vue({
			el: '#nav-container',
			created: function() {
				eventBus.$on('print-resume', () => {this.printResume();});
				eventBus.$on('change-section', (section) => {this.updateSection(section);});
				eventBus.$on('toggle-mobile-menu', () => {this.mobileHide = !this.mobileHide;});
				eventBus.$on('close-mobile-menu', () => {this.mobileHide = true;});
			},
			data: {
				mobileHide : true,
				curSection : targetStore.currentTarget,
				navSections : dataResults['layout'].sections
			},
			computed: {
				'currentSection' : function() {
					return this.curSection;
				}
			},
			methods: {
				'printResume' : function() {window.print();},
				'updateSection' : function (section) {
					this.curSection = section;
				}
			},
			components: {
				'nav-item' : {
					methods: {
						'updateSection' : function (section) {
							eventBus.$emit('close-mobile-menu');
						},
						'matchesSection' : function(section) {
							return this.cursection === section || (section === 'welcome' ? this.cursection === '' : false);
						},
					},
					props: ['section','cursection'],
					template: `<li class="csr-p main-nav-item transform-scale transition-transform disp-flex" v-on:click="updateSection(section.name)" :class="[{'selected' : matchesSection(section.name)},{'resume-nav-item' : section['resume-section']}]"><a class="main-nav-link disp-flex" :href="'#' + section.name"><div v-html="section.text"></div></a></li>`
				}
			}
		});
		
		let mobileNavApp = new Vue({
			el: '#mobile-nav-bar',
			methods: {
				'toggleMobileMenu': function() {
					eventBus.$emit('toggle-mobile-menu');
				},
				'closeMobileMenu': function() {
					eventBus.$emit('close-mobile-menu');
				},
				'printResume' : function() {
					eventBus.$emit('print-resume');
				}
			}
		});
		
		/**
		 *	Card that uses an icon.
		 */
		Vue.component('icon-card', {
			data : function() {
				return {
					svgSource : svgSource
				};
			},
			methods: {
				performFunction : function() {
					switch (this.fxn) {
						case 'print':
							eventBus.$emit('print-resume');
							break;
					}
				}
			},
			props : ['type', 'svgid', 'spantext', 'fxn', 'imgsrc'],
			template : `<component :is="type" class="icon-card csr-p transform-scale transition-transform disp-flex" v-on:click="performFunction()">
							<svg v-if="imgsrc === ''" :class="svgid + ' icon'" :aria-labelledby="svgid + '-svg-title ' + svgid + '-svg-desc'" role="img">
								<use :xlink:href="svgSource + '#' + svgid" ></use>
							</svg>
							<img v-if="imgsrc !== ''" :src="imgsrc" class="img-icon"></img>
							<span class="icon-card-text f-w-b">{{ spantext }}</span>
						</component>`
		});
		
		/**
		 *	List of filters (or tags)
		 *	This list contains filter-list-items as components
		 */
		Vue.component('filter-list', {
			methods: {
				'sectionEvent' : function(info) {
					this.$emit('section-event', info);
				}
			},
			props: ['filters','sectionType'],
			template: `<ul class="resume-filter-list disp-flex" v-show="filters.length > 0">
						<filter-list-item :sectionType="sectionType" v-for="(f, index) in filters" :key="index" :name="f" @section-event="sectionEvent"></filter-list-item>
					</ul>`,
			components: {
				'filter-list-item': {
					created : function() {
						eventBus.$on('added-filter', (input) => {
							if (this.name === _hideAllText || this.name === _showAllText) {
								return;
							}
							
							if (input.section === this.sectionType && input.filterName === this.name && !this.selected) {
								this.selected = true;
							}
						});
						eventBus.$on('removed-filter', (input) => {
							if (input.section === this.sectionType && input.filterName === this.name && this.selected) {
								this.selected = false;
							}
						});
						eventBus.$on('clear-all-filters', (section) => {
							if (section === this.sectionType) {
								this.selected = false;
							}
						});
					},
					data: function() {
						return {
							selected : false,
							hovering: false
						}
					},
					methods: {
						'toggleFilter' : function() {
							let n = this.name;
							let eventData = {'filterName' : n};
							
							if (this.name !== _showAllText && this.name !== _hideAllText) {
								this.selected = !this.selected;
								eventData.eventName = this.selected ? 'added-filter' : 'removed-filter';
							} else {
								eventBus.$emit('clear-all-filters', this.sectionType);
								eventData.eventName = 'added-filter';
							}

							this.$emit('section-event', eventData);
						},
						'hoverFilter' : function() {
							this.hovering = !this.hovering;
							
							let eventData = {};
							if (this.hovering) {
								eventData.eventName = 'hover-filter';
								eventData.filterName = this.name;
							} else {
								eventData.eventName = 'hover-filter-end';
							}
							
							this.$emit('section-event', eventData);
						}
					},
					props: ['name','sectionType'],
					template: `<li class="filter-list-item csr-p transition-transform" :class="{'selected': selected}" v-on:click.stop="toggleFilter()" v-on:mouseover="hoverFilter" v-on:mouseleave="hoverFilter">{{ name }}</li>`
				}
			}
		});

		/**
		 * Vue component defining the resume card: the fundamental unit for displaying a resume story in any section
		 * Has a general form and functionality with inner HTML specific to the type of resume section.
		 */
		Vue.component('resume-card', {
			created: function() {
				eventBus.$on('added-filter', (input) => {
					if (input.section === this.specType) {
						this.checkVisibility(input.filterName, true);
					}
				});
				eventBus.$on('removed-filter', (input) => {
					if (input.section === this.specType) {
						this.checkVisibility(input.filterName, false);
					}
				});
				eventBus.$on(['change-settings','reset-default-settings'], () => {
					this.checkVisibility();
				});
				eventBus.$on('clear-all-filters', () => {
					this.visible = true;
				});
				eventBus.$on('hover-filter', (input) => {
					if (this.specType === input.section && this.matchesFilter(input.filterName)) {
						this.hovering = true;
					}
				});
				eventBus.$on('hover-filter-end', () => {
					this.hovering = false;
				});
				eventBus.$on('removed-card', (input) => {
					if ((input.section === this.specType) && (input.index == this.i)) {
						this.visible = false;
					}
				});
				
				// Add the section type to the list of tags (+ capitalize first letter)
				this.tags.push(this.type.charAt(0).toUpperCase() + this.type.slice(1));
			},
			data: function() {
				return {
					tags: this.content.tags ? this.content.tags.split(',') : [],
					visible: true,
					hovering: false,
					expanded: true,
					svgSource: svgSource
				}
			},
			methods: {
				/**
				 * Method for checking if resume story is still visible after any event.
				 * Used when adding, removing filters or changing settings
				 */
				'checkVisibility' : function(filterName, added) {
					if (added) {	// Adding a filter to list
						if (filterName === _showAllText) {
							this.visible = true;
							return;
						}
						else if (filterName === _hideAllText) {
							this.visible = false;
							return;
						}
					} 
					this.visible = this.matchesRequiredFilters();
				},
				'matchesFilter' : function(filterName) {
					return this.tags.includes(filterName);
				},
				'matchesRequiredFilters' : function() {
					let matchSetting = settingsStore.settings['filterMatch'];
					let curFilters = filtersStore.getFilters(this.specType);
					let total = 0;
					
					// Figure out how many of current filters are in this card's tags.
					for (let filter of curFilters) {
						if (this.tags.includes(filter)) {
							total++;
						}
					}

					if (matchSetting === 'all') {
						return (total === curFilters.length);
					} else if (matchSetting === 'any') {
						return (curFilters.length === 0 || total > 0);
					}
				},
				'removeCard' : function() {
					this.visible = false;
					let output = {'index': this.i, 'section': this.specType};
					eventBus.$emit('removed-card', output);
				}
			},
			components: {
				'education': {
					props: ['content'],
					template: `<div class="card-flex-container disp-flex">
								<div class="card-row disp-flex">
									<span class="edu-yr">{{ content.gradYear }}</span>
									<span class="edu-deg">{{ content.degree }}</span>
								</div>
							</div>`
				},
				'experience': {
					props: ['content'],
					template: `<div class="card-flex-container disp-flex">
								<div class="card-row disp-flex">
									<div class="exp-desc">{{ content.description }}</div>
								</div>
							</div>`
				},
				'projects': {
					props: ['content'],
					template: `<div class="card-flex-container disp-flex">
								<div class="card-row disp-flex">
									<div v-html="content.description"></div>
								</div>
							</div>`
				},
				'activities': {
					props: ['content'],
					template: `<div class="card-flex-container disp-flex">
								<div class="card-row disp-flex">{{content.description}}</div>
							</div>`
				},
				'help': {
					props: ['content'],
					template: `<div class="card-flex-container disp-flex">
								<div class="card-row disp-flex">
									<div v-html="content.body"></div>
								</div>
							</div>`
				}
			},
			props: ['content','type','specType','i'],
			template: `<transition-group name="fading" mode="out-in" class="card-transition-container"><div class="card disp-flex" :class="[type, {'expanded': expanded}, {'hovering': hovering}]" key="i" v-if="visible">
				<div class="card-title disp-flex">
					<h3 class="card-title-text">{{ content.title }}</h3>
					<div class="card-title-collapse csr-p" v-on:click="removeCard" tooltip="Hide" tooltip-left>
						<svg class="icon collapse-icon-svg" aria-labelledby="collapse-svg-title collapse-svg-desc" role="img">
							<use :xlink:href="svgSource + '#collapse'"></use>
						</svg>
					</div>
				</div>
				<component key="desc" :is="type" :content="content"></component>
			</div></transition-group>`
		});

		/**
		 * App for resume section.
		 * Contains cards for each resume story
		 */
		let resumeApp = new Vue({
			el: '#mpc-wrapper',
			created: function() {
				eventBus.$on('change-resume-section', (type) => {
					this.showSection = type;
				});
				eventBus.$on('change-section', (section) => {
					this.updateSection(section);
				});

			},
			methods: {
				'toggleHelp': function() {
					eventBus.$emit('toggle-help');
				},
				'printResume' : function() {window.print();},
				'changeShowSection' : function(section) {
					this.showSection = section;
				},
				'changeSection' : function(section) {
					eventBus.$emit('change-section', section);
				},
				'updateSection' : function(section) {
					this.curSection = section;
				},
				'resetDefaultSettings': function() {
					settingsStore.resetDefaults();
					eventBus.$emit('reset-default-settings');
				}
			},
			watch : {
				route : function() {
					eventBus.$emit('change-section', getHash());
				}
			},
			data: {
				settings: dataResults.settings,
				showHelp : false,
				fullHelpTexts : dataResults['help'].sections,
				curSection : targetStore.currentTarget,
				route : window.location.hash,
				beginningSection: true,
				endSection: false,
				fullResume: dataResults['personal'].resume,
			},
			computed: {
				currentHash : function() {
					let s = this.curSection;
					return window.location.hash.substring(1);
				},
				currentSection : function() {
					return this.curSection;
				},
				curSectionIndex: function() {
					return sections.indexOf(this.currentSection);
				},
				nextSection: function() {
					let i = this.curSectionIndex;
					let next = i+1;
					this.endSection = (next === sections.length);
					return (this.endSection) ? '' : sections[next];
				},
				prevSection: function() {
					let i = this.curSectionIndex;
					let prev = i-1;
					this.beginningSection = (prev === -1);
					return (this.beginningSection) ? '' : sections[prev];
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
								updateSettingValue: function(newValue) {
									this.curSettingValue = newValue ? newValue : settingsStore.defaults[this.settingName];
									if (newValue) {
										settingsStore.changeSetting(this.settingName, this.curSettingValue);
									}
								}
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
												eventBus.$emit('change-settings', {key: this.settingName, value: newValue});
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
				'resume-section' : {
					data: function() {
						return {
							showAllText: _showAllText,
							hideAllText: _hideAllText,
							sectionContent: dataResults['personal'].resume[this.type]
						}
					},
					methods: {
						'sectionEvent' : function(info) {
							info.section = this.filterSectionName;
							if (info.eventName === 'added-filter') {
								filtersStore.addSelectedFilter(info.filterName, this.filterSectionName);
							} else if (info.eventName === 'removed-filter') {
								filtersStore.removeSelectedFilter(info.filterName, this.filterSectionName);
							}
							
							eventBus.$emit(info.eventName, info);
						}
					},
					computed: {
						cardContent: function() {
							return (this.type === 'experience' ? this.sectionContent[this.i]['descriptions'] : this.sectionContent);
						},
						sectionTagList: function() {
							let sectionTags = [];
							let contents = this.cardContent;

							for (let i = 0; i < contents.length; i++) {
								let content = contents[i];
								let tags = content.tags.split(',');
								for (let j = 0; j < tags.length; j++) {
									let tag = tags[j];
									if (!(tag === "") && !sectionTags.includes(tag)) {
										sectionTags.push(tag);
									}
								}
							}

							sectionTags.sort();
							return sectionTags;
						},
						filterSectionName: function() {
							return this.type === 'experience' ? this.type + "-" + this.sectionContent[this.i]['org'] : this.type;
						}
					},
					props: ['type','i'],
					template: `<section class="resume-section-container disp-flex">
								<h2 class="resume-container-title no-print">{{type.charAt(0).toUpperCase() + type.slice(1)}}</h2>
								<h3 v-if="type === 'experience'" class="exp-section-title">{{ sectionContent[i]['org'] + ', ' + sectionContent[i]['position'] }}</h3>
								<filter-list :filters="[showAllText, hideAllText]" :sectionType="type" class="filter-list-all no-print" @section-event="sectionEvent"></filter-list>
								<filter-list :filters="sectionTagList" :sectionType="type" @section-event="sectionEvent"></filter-list>
								<div class="section-body disp-flex" :class="type">
									<div class="card-container disp-flex">
										<resume-card v-for="(e, index) in cardContent" :key="index" :type="type" :specType="filterSectionName" :content="e" :i="index"></resume-card>
									</div>
								</div>
							</section>`
				}
				
			}
		});
		
		return {
			'resumeApp' : resumeApp,
			'navApp' : navApp,
			'titleApp' : titleApp
		};
	}

} ();