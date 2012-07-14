Todos = new Meteor.Collection('todos');

Session.set('filter', null);

Session.set('editing_todo', null);

if (Meteor.is_client) {

	/////////////////////////////////////////////////////////////////////////
	// The following two functions are taken from the official Meteor 
	// "Todos" example
	// The original code can be viewed at: https://github.com/meteor/meteor
	/////////////////////////////////////////////////////////////////////////

	// Returns an event_map key for attaching "ok/cancel" events to
	// a text input (given by selector)
	var okcancel_events = function (selector) {
		return 'keyup '+selector+', keydown '+selector+', focusout '+selector;
	};
	
	// Creates an event handler for interpreting "escape", "return", and "blur"
	// on a text field and calling "ok" or "cancel" callbacks.
	var make_okcancel_handler = function (options) {
		var ok = options.ok || function () {};
		var cancel = options.cancel || function () {};
		
		return function (evt) {
			if (evt.type === 'keydown' && evt.which === 27) {
				// escape = cancel
				cancel.call(this, evt);
	
			} else if (evt.type === 'keyup' && evt.which === 13 || 
				evt.type === 'focusout') {
				// blur/return/enter = ok/submit if non-empty
				var value = String(evt.target.value || '');
				if (value)
					ok.call(this, value, evt);
				else
					cancel.call(this, evt);
			}
		};
	};

	Template.todoapp.has_todos = function() {
		return Todos.find().count();
	};
	
	Template.todoapp.events = {};
	
	Template.todoapp.events[okcancel_events('#new-todo')] =
	  make_okcancel_handler({
		ok: function (title, evt) {
		  Todos.insert({title: title, completed: false, created_at: new Date().getTime()});
		  evt.target.value = "";
		}
	  });
	
	Template.main.todos = function() {
		var filter = {};
		switch (Session.get('filter')) {
			case 'active':
				filter.completed = false;
				break;
			case 'completed':
				filter.completed = true;
				break;
		}
		return Todos.find(filter, {sort: {created_at: 1}});
	};
	
	Template.main.todos_not_completed = function() {
		return Todos.find({completed: false}).count();
	};
	
	Template.main.events = {
		'click input#toggle-all': function(evt) {
			var completed = true;
			if (!Todos.find({completed: false}).count()) completed = false;
			Todos.find({}).forEach(function(todo) {
				Todos.update({'_id': todo._id}, {$set: {completed: completed}});
			});
		}
	};
	
	Template.todo.todo_completed = function() {
		return this.completed;
	};
	
	Template.todo.todo_editing = function() {
		return Session.equals('editing_todo', this._id);
	};
	
	Template.todo.events = {
		'click input.toggle': function() {
			Todos.update(this._id, {$set: {completed: !this.completed}});
		},
		'dblclick div.view': function() {
			Session.set('editing_todo', this._id);
		},
		'click button.destroy': function() {
			Todos.remove(this._id);
		}
	};
	
	Template.todo.events[okcancel_events('li.editing input.edit')] =
	  make_okcancel_handler({
		  ok: function (value) {
			Todos.update(this._id, {$set: {title: value}});
			Session.set('editing_todo', null);
		  },
		  cancel: function () {
			Session.set('editing_todo', null);
		  }
	  });
	
	Template.footer.todos_not_completed = function() {
		return Todos.find({completed: false}).count();
	};
	
	Template.footer.todos_one_not_completed = function() {
		return Todos.find({completed: false}).count() == 1;
	};
	
	Template.footer.todos_completed = function() {
		return Todos.find({completed: true}).count();
	};
	
	Template.footer.filter_all_selected = function() {
		return Session.equals('filter', null);
	};
	
	Template.footer.filter_active_selected = function() {
		return Session.equals('filter', 'active');
	};
	
	Template.footer.filter_completed_selected = function() {
		return Session.equals('filter', 'completed');
	};
	
	Template.footer.events = {
		'click button#clear-completed': function() {
			Todos.remove({completed: true});
		},
		'click #filters span.all': function() {
			Session.set('filter', null);
		},
		'click #filters span.active': function() {
			Session.set('filter', 'active');
		},
		'click #filters span.completed': function() {
			Session.set('filter', 'completed');
		}
	};
};