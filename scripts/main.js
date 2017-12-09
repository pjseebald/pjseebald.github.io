var pageModule = function() {
	
	// Testing
	var baseDataUrl = '../data/';
	var dataUrls = {
		help: 'help.json',
		settings: 'settings.json',
		personal: 'personal.json'
	};
	var dataResults = {};
	
	var deferreds = $.map(dataUrls, function(value, key) {
		return $.getJSON(baseDataUrl + value, function(currentJsonData) {
			dataResults[key] = currentJsonData;
		});
	});
	
	console.log(dataResults);
	
	$.when.apply($, deferreds).then(function() {
		console.log('Initialized.');
		initialize();
	});
	
	
	var helpText = {
		"sections": [
			{
				"title": "What do the icons mean?",
				"body": "<div class=\"help-icon-row\"><div id=\"help-filter-menu\" class=\"help icon\"></div><span class=\"help-icon-txt\">Toggles the menu containing resum&#233; filters.</span></div><div class=\"help-icon-row\"><div id=\"help-goto\" class=\"help icon\"></div><span class=\"help-icon-txt\">Opens my LinkedIn profile.</span></div><div class=\"help-icon-row\"><div id=\"help-help\" class=\"help icon\"></div><span class=\"help-icon-txt\">Displays help window.</span></div><div class=\"help-icon-row\"><div id=\"help-resume-section-menu\" class=\"help icon\"></div><span class=\"help-icon-txt\">More options for selecting stories within a section.</span></div><div id=\"help-icon-settings\" class=\"help icon\"></div><span class=\"help-icon-txt\">Display settings for filter menu and resum&#233;.</span></div><div class=\"help-icon-row\"><div id=\"help-icon-clear\" class=\"help icon\"></div><span class=\"help-icon-txt\">Clear search text.</span></div>"
			},
			{
				"title": "What is this webpage?",
				"body": "An interactive resume, where you get to choose what you see. Why look at a resume where you have to search through blocks of black and white text to find the pieces relevant to you? Just select the items in the filter menu that interest you. Then print it out!"
			},
			{
				"title": "How to use this webpage?",
				"body": "Select any relevant filters from the menu on the left and use the section menus to show/hide and expand/collapse the cards as needed. You can also search for filters in the menu. Then either view the descriptions or print a formatted resume based only on the stories selected using the filters."
			},
			{
				"title": "Why did you make this webpage?",
				"body": "For many reasons. Personally, because it was fun and it helped me learn a new Javascript framework (Vue.js). But also because I feel there are issues with traditional resumes. First, they all look so similar because of formatting standards. Second, we are told to tailor our resume to each job as well as keep it to one page, potentially removing things I'd want to show. But despite the time people invest in tailoring a resume to each job, that resume might get thrown out before anyone even looks at it, or a hiring manager will only look at it for 7 seconds. This webpage doesn't solve every problem, but I believe it shows a creative way for hiring managers to look at my profile through the lens of what skills they want to see. This is a resume that is easy to tailor for whoever is viewing it. Since I have many different experiences that span many different subjects, I feel it's useful for people to view my resume through the lens of what subjects interest them."
			},
			{
				"title": "How can I contact you?",
				"body": "Send me a LinkedIn message! Use the icon next to the help to access my LinkedIn page. Please let me know what you think of the site, good or bad, and please tell me if you happen to find any defects or have any suggestions."
			},
			{
				"title": "Tell me more about your background.",
				"body": "Since resume stories can be dry and lacking context, I always enjoy discussing my background. I started out as a mechanical engineer in undergraduate college. Continued to graduate school because I wanted to have a stronger education and because I wanted more experience working hands-on in a laboratory. As it turned out the experience was very helpful, but I didn't really enjoy working in the laboratory. But I did enjoy programming during a computational fluid dynamics course. After realizing how well my problem solving skills could translate to programming despite lacking a software engineering background, I loaded up on online classes and personal projects in an attempt to transition to either data science or software engineering. As such, I have entered the field of software engineering with a desire to always continue my learning, and this project has been a part of that by putting it into practice."
			}
		]
	};

	var settingsData = {
		"filterMatch" : {
			"type": "radio",
			"heading": "Stories must match:",
			"inputs": [{
					"id": "any",
					"value": "any",
					"labelText": "ANY selected filters"
				},
				{
					"id": "all",
					"value": "all",
					"labelText": "ALL selected filters"
				}
			]
		}
	};

	var personData = {
		"name": "Paul Seebald",
		"title": "Paul Seebald, Ph.D.",
		"filters": {
			"general": [
				{"name": "Data Analysis"},
				{"name": "Mechanical Engineering"},
				{"name": "Software Engineering"},
				{"name": "Teaching"},
				{"name": "Volunteer"}
			],
			"skills": {
				"technical": [
					{"name": "APIs"},
					{"name": "Cloud"},
					{"name": "CSS"},
					{"name": "Data Modeling"},
					{"name": "HTML"},
					{"name": "Java"},
					{"name": "Javascript"},
					{"name": "jQuery"},
					{"name": "Labview"},
					{"name": "Matlab"},
					{"name": "Microsoft Excel"},
					{"name": "PowerShell"},
					{"name": "Python"},
					{"name": "SQL"},
					{"name": "Time Series Analysis"},
					{"name": "TM1"}
				]
			},
			"organizations": [
				{"name": "IBM"},
				{"name": "Purdue University"},
				{"name": "Grove City College"}
			]
		},
		"resume": {
			"experience": [{
					"org": "IBM",
					"position": "Software Engineer",
					"descriptions": [
						{"years": {"start": 2017, "end": 2017}, "description": "Tested scripts for DevOps to create and maintain virtual machines in the cloud.", "tags": "PowerShell,IBM,Cloud,Software Engineering"},
						{"years": {"start": 2016, "end": 2017}, "description": "Added features and fixed defects for front-end TM1 modeling workspace in BDD agile project and continuous delivery cycle. Worked with HTML, CSS, and Javascript with jQuery for front-end development and Java for back-end service with a REST API.", "tags": "IBM,HTML,CSS,Java,Javascript,jQuery,TM1,APIs,Software Engineering"},
						{"years": {"start": 2015, "end": 2017}, "description": "Developed and supported Java utility that consumed multiple API's (REST and Java) for IBM Cognos TM1 and IBM Decision Optimization software. Adapted for local & cloud architecture.", "tags": "Data Modeling,IBM,APIs,Java,Cloud,Software Engineering"},
						{"years": {"start": 2015, "end": 2015}, "description": "Created data model for online cloud trial with thousands of users and assisted with maintenance.", "tags": "Data Modeling,IBM,TM1,Cloud,Software Engineering"},
						{"years": {"start": 2014, "end": 2015}, "description": "Designed and built data models for financial planning and forecasting applications in IBM Cognos TM1.", "tags": "Data Modeling,IBM,TM1,Microsoft Excel,Software Engineering"}
					]
				},{
					"org": "Purdue University",
					"position": "Doctoral Researcher",
					"descriptions": [
						{"years": {"start": 2014, "end": 2014}, "description": "Led and evaluated students in fluid mechanics experimental laboratory sessions.", "tags": "Data Analysis,Purdue University,Mechanical Engineering,Teaching"},
						{"years": {"start": 2013, "end": 2014}, "description": "Quantitatively determined measures of turbulence for the injection of supercritical fluids.", "tags": "Data Analysis,Purdue University,Mechanical Engineering,Time Series Analysis,Matlab"},
						{"years": {"start": 2013, "end": 2014}, "description": "Wrote computational algorithm in MATLAB that identified fluid jet edge in thousands of high-resolution images, then calculated correlation-based length scales.", tags: "Data Analysis,Purdue University,Mechanical Engineering,Time Series Analysis,Matlab,Software Engineering"},
						{"years": {"start": 2013, "end": 2014}, "description": "Analyzed irregularly spaced time series data with advanced algorithms written in MATLAB.", "tags": "Data Analysis,Purdue University,Mechanical Engineering,Time Series Analysis,Matlab"},
						{"years": {"start": 2013, "end": 2014}, "description": "Taught multiple class sessions of numerical methods and fluid mechanics lab for graduate students on and off campus.", "tags": "Data Analysis,Purdue University,Mechanical Engineering,Teaching"},
						{"years": {"start": 2012, "end": 2013}, "description": "Designed and programmed data acquisition program for laboratory in LabVIEW.", "tags": "Data Analysis,Purdue University,Mechanical Engineering,Time Series Analysis,Matlab"},
					]
				}
			],
			"education": [
				{"org": "Purdue University", "gpa": "3.85", "degree": "Ph.D. in Mechanical Engineering", "gradYear": "2014", "tags": "Purdue University,Mechanical Engineering"},
				{"org": "Grove City College", "gpa": "3.88", "degree": "B.S. in Mechanical Engineering", "gradYear": "2007", "tags": "Grove City College,Mechanical Engineering"}
			],
			"projects": [
				{"description": "Built an interactive resume website using Javascript framework Vue.js.", "tags": "HTML,Javascript,jQuery,CSS,Software Engineering"},
				{"description": "Designed, built, and maintained interactive web page for managing a college football team roster.", "tags": "HTML,Javascript,jQuery,CSS,Software Engineering"},
				{"description": "Used linear and nonlinear regression analysis to calculate the monetary value of draft picks compared to free agents for an NFL team.", "tags": "Data Analysis,Python"},
				{"description": "Compiled, HTML formatted, and emailed unread tweets through Python and the Twitter API. Used a database to store read tweet ID's.", "tags": "Python,APIs,HTML,Software Engineering,SQL"},
				{"description": "Performed consulting for 247Sports to develop appropriate scoring equation utilizing multiple factors. Utilized Python web scraping to compile data.", "tags": "Python,Data Analysis"},
				{"description": "Wrote Arduino (C++ derivative) program to control motor timing for food supply system.", "tags":"Software Engineering"}
			],
			"activities": [
				{"description": "Independent learning through online classes for database/SQL, Powershell, Java, R programming, data science, and many others.", "tags": "Software Engineering,Java,SQL,PowerShell"},
				{"description": "Volunteering as a weekly reading tutor for local elementary school.", "tags": "Volunteer"},
				{"description": "Presented scientific concepts to middle school students for IBM E-Week as a volunteer.", "tags": "IBM,Volunteer"},
				{"description": "Presented research poster to junior high students at Next Generation Scholars poster event.", "tags": "Purdue University,Volunteer"},
				{"description": "Volunteered for MATHCOUNTS event.", "tags":"Volunteer,Purdue University"},
				{"description": "Served as Mentor for incoming Purdue graduate students.", "tags":"Purdue University,Volunteer"},
				{"description": "Founded Grove City College ME Honor Society.", "tags":"Grove City College,Mechanical Engineering"}
				
			]
		}
	};

	var filterMenuCategories = [
		{name: 'General Type', filterItems: personData.filters.general},
		{name: 'Technical Skills', filterItems: personData.filters.skills.technical},
		{name: 'Organizations', filterItems: personData.filters.organizations}
	];

	var eventBus = new Vue({});

	var titleApp = new Vue({
		el: '#title-container',
		data: {
			personTitle : personData.title
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

	// For the help app
	var helpApp = new Vue({
		el: '#help-container',
		data : {
			displayHelp : false,
			fullHelpTexts : helpText.sections,
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

	// For the filter menu
	var filterMenuApp = new Vue({
		el: '#filter-menu',
		data: {
			filterCategories: filterMenuCategories,
			filterText: '',
			fMenuShow: true,
			showSettings: false,
			match: 'any'
		},
		computed: {
			settings: function(value) {
				return {
					'match': this.match
				};
			},
			settingsIconTooltip: function() {
				return this.showSettings ? 'Filters' : 'Settings'
			}
		},
		watch: {
			match: function() {
				eventBus.$emit('change-settings', this.settings);
			}
		},
		methods: {
			'clearSearchContents': function() {
				this.filterText = '';
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
						template: '<div class="filter-menu-item csr-p" v-show="checkMatch(item.name)" v-on:click="toggleSelection($event)" :class="{ selected : isSelected }">			{{ item.name }}</div>',
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

	var filterSelectionBarApp = new Vue({
		el: '#filter-selections',
		data: {
			selectedList: [],
			openMenu: true
		},
		computed : {
			currentHt: function() {
				return $(this.$el).outerHeight(true);
			}
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
					this.selectedList = this.selectedList.filter( function(e) {return e !== filterName} );
				}
				if (!menu && menu === undefined) {
					// If removal request came from the filter selections bar component, need to send removal to filter menu as well
					eventBus.$emit('removed-filter', {name: filterName, menu: false});
				}
			},
			'addFilter' : function(filterName) {
				if (this.selectedList.indexOf(filterName) === -1) {
					this.selectedList.push(filterName);
				}
			},
			'getCurrentHt' : function() {
				return $(this.$el).outerHeight(true);
			}
		},
		components: {
			'selection-name' : {
				props: ['filter'],
				template: '<div class="selected-filter"><div class="sf-name">{{ filter }}</div><span class="sf-close-icon icon" v-on:click="removeSelFilter()"></span></div>',
				methods: {
					'removeSelFilter' : function () {
						var f = this.filter;
						this.$emit('rem-filter', this.filter);
					}
				}
			}
		}
	});

	// Register the resume section menu
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
				if (this.visible) {
					$(this.$el).find('ul').css('background-color','inherit');
				}
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

	// Register the resume card: the fundamental unit for displaying a resume story in any section
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
					if (filterMenuApp.match === 'any') {
						this.visible = (filtLen === 0) || !(mfLen === 0);
					} else if (filterMenuApp.match === 'all') {
						this.visible = (filtLen === 0) || (mfLen === filtLen);
					}
				}
				
				// Check if visibility changed. If so, emit the 'changeNumChildren' event.
				this.changeNumChildren(initVisibility);
			},
			'changeNumChildren' : function(initVisibility) {
				if (initVisibility ? !this.visible : this.visible) {		// XOR ternary operation -- if visibility changes
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

	var resumeApp = new Vue({
		el: '#resume',
		data: {
			experiences: personData.experiences,
			education: personData.education
		},
		components: {
			'resume-section' : {
				data: function() {
					return {
						sectionContent: personData.resume[this.type],
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

return {};

} ();
