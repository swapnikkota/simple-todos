// simple-todos.js

Tasks = new Mongo.Collection("tasks");
if (Meteor.isClient) {
	
   // At the top of our client code
   Meteor.subscribe("tasks");
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
    if (Session.get("hideCompleted")) {
      // If hide completed is checked, filter tasks
      return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
    } else {
      // Otherwise, return all of the tasks
      return Tasks.find({username : Meteor.user().username}, {sort: {createdAt: -1}});
    }
  },
  hideCompleted: function () {
    return Session.get("hideCompleted");
  },
  // Add to Template.body.helpers
incompleteCount: function () {
  return Tasks.find({username : Meteor.user().username, checked: {$ne: true}}).count();
}
  });
  
  Template.body.events({
	  'submit .new-task' : function(event){
		  console.log(event);
		   var text = event.target.text.value;
			/*Tasks.insert({
			  text: text,
			  createdAt: new Date(), // current time
			  owner: Meteor.userId(),           // _id of logged in user
			  username: Meteor.user().username
			});*/
			// replace Tasks.insert( ... ) with:
			Meteor.call("addTask", text);

			 // Clear form
			event.target.text.value = "";

			// Prevent default form submit
			return false;
	  },
	  "change .hide-completed input": function (event) {
		  Session.set("hideCompleted", event.target.checked);
	  }
  });
  
  
  Template.task.events({
	  "click .toggle-checked": function () {
		  console.log(this.checked);
		  // replace Tasks.update( ... ) with:
			Meteor.call("setChecked", this._id, ! this.checked);

		// Set the checked property to the opposite of its current value
		//Tasks.update(this._id, {$set: {checked: ! this.checked}});
	  },
	  "click .delete": function () {
		//Tasks.remove(this._id);		
		// replace Tasks.remove( ... ) with:
		Meteor.call("deleteTask", this._id);
	  }
  });
  
  // At the bottom of the client code
	Accounts.ui.config({
	  passwordSignupFields: "USERNAME_ONLY"
	});
}


// At the bottom of simple-todos.js, outside of the client-only block
Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});

if (Meteor.isServer) {
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });
}