import { Mongo } from 'meteor/mongo';

export const Tasks = new Mongo.Collection('tasks');

// db.tasks.find({"hashTags":/h/});
