$(function() {

	var Field = Backbone.Model.extend({
		defaults: {
			fieldid: '',
			label: 'Label',
			value: 'value',
			controltype: 'inputText',
			muniCode: '',
			rules: []
		},

		initialize: function() {
			this.on('change', this.valueChanged);
		},

		valueChanged: function() {
			if (this.collection !== undefined) this.collection.trigger('modelChanged', this)
		},
	});

	var FieldCollection = Backbone.Collection.extend({
		model: Field,

		initialize: function() {
			this.on('modelChanged', this.modelChanged);
		},

		modelChanged: function(model) {

		}
	});

	var templateStore = {
		templates: [],

		getTemplate: function(templateName) {
			var that = this;
			var template = _.find(this.templates, function(template) {
				if (template.name === templateName) return template;
			});

			if (template !== undefined) return template;

			$.ajax({
				url: 'templates/' + templateName,
				success: function(templateContent) {
					template = {
						name: templateName,
						content: templateContent
					};
					that.templates.push(template);
				},
				async: false
			});

			return template;
		}
	};
	_.bindAll(templateStore);

	var FieldView = Backbone.View.extend({
		className: 'control-group',

		events: {
			'blur .input': 'valueChanged',
			'keyup .input': 'keypress'
		},

		keypress: function(event) {
			if (event.altKey && event.ctrlKey) {
				var muni = '';
				var currentMuni = this.model.get('muniCode');
				switch (event.keyCode) {
				case 77:
					if (currentMuni === '' || currentMuni !== 'm') muni = 'm';
					this.model.set('muniCode', muni);
					break;
				case 85:
					if (currentMuni === '' || currentMuni !== 'u') muni = 'u';
					this.model.set('muniCode', muni);
					break;
				case 78:
					if (currentMuni === '' || currentMuni !== 'n') muni = 'n';
					this.model.set('muniCode', muni);
					break;
				case 73:
					if (currentMuni === '' || currentMuni !== 'i') muni = 'i';
					this.model.set('muniCode', muni);
					break;
				default:
					break;
				}
				this.$('.input').focus();
			}
		},

		valueChanged: function(event) {
			var value = this.$('.input').val();
			this.model.set({
				value: value
			});
		},

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},

		render: function() {
			var template = templateStore.getTemplate(this.model.get('controltype') + '.html');

			if (template !== undefined) {
				this.$el.html(Mustache.render(template.content, this.model.toJSON()));
				(this.model.get('muniCode') !== '') ? this.$('.muniCode').addClass('visible') : this.$('.muniCode').addClass('invisible');
				this.$('.input').mask('999-999-9999');
				this.$('.input').val(this.model.get('value'));				
			}

			return this;
		},

		clear: function() {
			this.model.clear();
		}
	});

	var Page = Backbone.Model.extend({
		defaults: {
			pageid: '',
			category: '',
			name: ''
		}
	});

	var PageCollection = Backbone.Collection.extend({
		model: Page
	});

	var PagesView = Backbone.View.extend({
		el: $('#navTree'),

		pageCollection: new PageCollection(),

		template: function () {
			var that = this;

			if (this.templateContent === undefined) {				
				$.ajax({
					url: 'templates/navtree.html',
					success: function(templateContent) {
						that.templateContent = templateContent;
					},
					async: false
				});
			} 

			return this.templateContent;
		},

		initialize: function() {
			this.pageCollection.bind('reset', this.render, this);
		},

		render: function () { 
			var objects = {categories: []};
			var plainCollection = this.pageCollection.toJSON();
			var groupedCollection = _.groupBy(plainCollection, 'category');

			var count = 1;
			for (name in groupedCollection) {
				objects.categories.push({
					pid: count,
					category: name,
					pages: _.filter(plainCollection, function (item) { return item.category === name })
				});

				count++;
			}

			this.$el.html(Mustache.render(this.template(),objects));
				
		}
	});	

	var FieldsFormView = Backbone.View.extend({
		el: $('#fieldsFormView'),

		fieldCollection: new FieldCollection(),

		initialize: function() {
			this.fieldCollection.bind('add', this.addOne, this);
			this.fieldCollection.bind('reset', this.addAll, this);
		},

		addField: function(field) {
			this.fieldCollection.add(field);
		},

		addOne: function(field) {
			var view = new FieldView({
				model: field
			});
			this.$('#containerLeft').append(view.render().el);
		},

		addAll: function() {
			this.fieldCollection.each(this.addOne);
		}
	});

	var FormzAppView = Backbone.View.extend({
		el: $('#formzAppView'),

		fieldsView: new FieldsFormView(),

		pagesView: new PagesView(),

		initialize: function() {
		},

		events: {
			'click .btnSave': 'save'
		},

		save: function() {
			alert('save');
		},

		render: function() {

		}		
	});

	window.App = new FormzAppView();
	App.fieldsView.fieldCollection.reset(DataProvider.getFieldsByPage());
	App.pagesView.pageCollection.reset(DataProvider.getPagesByForm());

});
