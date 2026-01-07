/* global db */

const moviesDb = db.getSiblingDB("movies");
const comedy = moviesDb.comedy;

/* Click IntelliShell to open a new shell */
/* To begin creating a new database, first execute the use command to switch to a new database. At this moment, you won't see any new database yet */

comedy.drop();

/* Select the following command and press Ctrl + Enter or click F9 (to execute the selected command) */
/* The command saves some data to the database. 
/* Afterwards the new database "movies" will be created */
/* In the process a new collection called "comedy" will also be created in the database. */

comedy.insert({
  name: "Ted",
  year: 2012,
  tagline: "Ted is coming",
  cast: ["Mark Walhlberg", "Mila Kunis", "Seth MacFarlane"],
  technical: { runningTime: 106, language: "English", prizes: 13, nominations: 27 },
  sequel: "Ted 2",
  merits: { budget: 50, boxOffice: 535 },
  comments: [
    { by: "Steve", text: "Loved the movie" },
    { by: "Dave", text: "Really funny!" },
  ],
});

/* Right click on Collections at the left. Choose Refresh All */
/* Right click on movies > Collections > comedy at the left. Choose Open Collection Tab => a new tab is opened. Take a look at it */
/* There are multiple View Modes. You can change the View Mode using the buttons at the upper right. The default mode is Table View */

/* New in version 3.2: insertOne: inserts a single document into a collection */
comedy.insertOne({
  name: "We're the Millers",
  year: 2013,
  tagline: "If anyone asks",
  cast: ["Jennifer Aniston", "Luis Guzmán", "Ed Helms", "Kathryn Hahn"],
  technical: { runningTime: 110, language: "English" },
  merits: { budget: 37, boxOffice: 270 },
  comments: [
    { by: "Taylor", text: "First class movie!" },
    { by: "Rob", text: "I like it" },
  ],
});

/* New in version 3.2: insertMany: inserts multiple documents into a collection */
comedy.insertMany([
  {
    name: "The Hangover",
    year: 2009,
    tagline: "Some guys just can't handle Vegas",
    cast: ["Bradley Cooper", "Ed Helms", "Zach Galifianakis"],
    technical: { runningTime: 100, language: "English" },
    sequel: "The Hangover Part II",
    merits: { budget: 35, boxOffice: 467.5 },
    comments: [
      { by: "Alex", text: "Dude, it rocked" },
      { by: "Steve", text: "The best movie ever!" },
    ],
  },

  {
    name: "The Hangover Part II",
    year: 2011,
    tagline: "Bangkok has them now",
    cast: ["Bradley Cooper", "Ed Helms", "Zach Galifianakis"],
    technical: { runningTime: 102, language: "English" },
    sequel: "The Hangover Part III",
    merits: { budget: 80, boxOffice: 581 },
    comments: [
      { by: "Anne", text: "Liked the first part better" },
      { by: "Robin", text: "Over the top" },
    ],
  },
]);

/* Insert a new comedy
    - name: 'Ted 2'
    - year: 2015
    - tagline: 'Ted is coming, again' 
    - cast: ['Mark Walhlberg', 'Seth MacFarlane', 'Amanda Seyfried', 'Morgan Freeman']
    - technical: {runningTime: 115, language: 'English'},   
    - merits: {budget: 85} 
    - comments:[{by:'Anne', text:'Funny'}, {by:'Kate', text:'I still love Ted'}, {by:'Leo', text:'Nice movie'}]
    */
comedy.insert({
  name: "Ted 2",
  year: 2015,
  tagline: "Ted is coming again",
  cast: ["Mark Walhlberg", "Seth MacFarlane", "Amanda Seyfried", "Morgan Freeman"],
  technical: { runningTime: 115, language: "English" },
  sequel: "Ted 2",
  merits: { budget: 85 },
  comments: [
    { by: "Anne", text: "Funny" },
    { by: "Kate", text: "I still love Ted" },
    { by: "Leo", text: "Nice movie" },
  ],
});

/* To read all data from a collection */
comedy.find();

/* Conditional operators */
/* How do you do an 'equal to' query? Just match the value for the queried key */
comedy.find({ year: 2012 });

/* Find all movies released in the year 2013 */

/* Use these special forms for greater than and less than comparisons in queries, 
since they have to be represented in the query document:
    - db.collection.find({ "field" : { $gt: value } } );   // greater than  : field > value
    - db.collection.find({ "field" : { $lt: value } } );   // less than  :  field < value
    - db.collection.find({ "field" : { $gte: value } } );  // greater than or equal to : field >= value 
    - db.collection.find({ "field" : { $lte: value } } );  // less than or equal to : field <= value
*/
comedy.find({ year: { $lt: 2012 } });
comedy.find({ year: { $gt: 2010 } });

/* Find all movies from the year 2011 until now */

/* To search an object inside an object, just use the regular JavaScript dot notation 
   of the target object as the key and quote it. The '' around 'merits.budget' are mandatory */
/* Find all movies with a budget over 50 million dollar */
comedy.find({ "merits.budget": { $gt: 50 } });

/* Find all movies of which the runningTime is longer than 105 minutes */
comedy.find({ "technical.runningTime": { $gt: 105 } });

/* Find all movies of which the language is English */
comedy.find({ "technical.language": "English" });

/* You can also combine these operators to specify ranges */
comedy.find({ year: { $gt: 2010, $lt: 2013 } });

/* Find all movies with runningTime between 100 and 110 */
comedy.find({ "technical.runningTime": { $gt: 100, $lt: 110 } });

/* Until now all fields of the documents are shown in the result */
/* What if you want to get only some particular field in the result? */
comedy.find({ year: { $lt: 2012 } }, { name: true });

/* In the above example, we excluded most fields by not specifying them 
in the second parameter of the find() function. 
To get more than one exclusive field in the results you might do something like this */
comedy.find({ year: { $lt: 2012 } }, { name: true, year: true });

/* Give name and boxOffice of all movies with boxOffice over 500 million dollar */
comedy.find({ "merits.boxOffice": { $gt: 500 } }, { name: true, "merits.boxOffice": true });

/* What if you want to get almost all except for some fields in the result? */
comedy.find({ year: { $lt: 2012 } }, { name: false });

/* Give name and boxOffice of all movies with boxOffice over 500. Get rid of _id */
comedy.find(
  { "merits.boxOffice": { $gt: 500 } },
  { name: true, "merits.boxOffice": true, _id: false }
);

/* A quoted number is a string, and is not the same as the actual number */
comedy.find({ year: 2012 });
/* is totally different from */
comedy.find({ year: "2012" });

/* Use $ne for "not equals" */
comedy.find({ year: { $ne: 2011 } });

/* The $in operator is analogous to the SQL IN modifier, 
allowing you to specify an array of possible matches. */
comedy.find({ year: { $in: [2010, 2011, 2012] } });

/* Find all comedies with a budget of 50, 60, 70 or 80 */
comedy.find({ "merits.budget": { $in: [50, 60, 70, 80] } });

/* The $nin operator is similar to $in except that it selects objects for which 
the specified field does not have any value in the specified array. */
comedy.find({ year: { $nin: [2010, 2011, 2012] } });

/* Find all comedies that have a runningTime other than 100 or 105 */
comedy.find({ "technical.runningTime": { $nin: [100, 105] } });

/* The $or operator lets you use boolean or in a query. 
You give $or an array of expressions, any of which can satisfy the query. */
/* The $or operator retrieves matches for each or clause individually and 
eliminates duplicates when returning results. */
comedy.find({ $or: [{ year: 2012 }, { name: "The Hangover" }] });

/* Find all comedies with the name Ted or The Hangover from the year 2012 */
comedy.find({ year: 2012, $or: [{ name: "Ted" }, { name: "The Hangover" }] });

/* Find all comedies with a boxOffice over 500 from the year 2010 or 2011 */
comedy.find({ "merits.boxOffice": { $gt: 500 }, $or: [{ year: 2010 }, { year: 2011 }] });

/* The $nor operator lets you use a boolean or expression to do queries. 
You give $nor a list of expressions, none of which can satisfy the query. */
/* Find all comedies except for Ted or The Hangover */
comedy.find({ $nor: [{ name: "Ted" }, { name: "The Hangover" }] });

/* Find all comedies not released in the years 2010 or 2011 */
comedy.find({ $nor: [{ year: 2010 }, { year: 2011 }] });

/* The $and operator lets you use boolean and in a query. 
You give $and an array of expressions, all of which must match to satisfy the query. */
comedy.find({ $and: [{ year: { $gt: 2010 } }, { year: { $lt: 2012 } }] });

/* Find all movies for which the boxOffice exceeded over 500 million dollar and the budget was lower than or equal to 50 million dollar */
comedy.find({ $and: [{ "merits.boxOffice": { $gt: 500 } }, { "merits.budget": { $lte: 50 } }] });

/* You can also query an array */
comedy.find({ cast: "Bradley Cooper" });

/* When the key is an array, you can look for an object inside the array */
comedy.find({ "comments.by": "Steve" });

/* Find all movies that have comments by Rob or Alex */
comedy.find({ $or: [{ "comments.by": "Rob" }, { "comments.by": "Alex" }] });

/* The $size operator matches any array with the specified number of elements. */
comedy.find({ comments: { $size: 2 } });

/* Find all movies with 4 actors */
comedy.find({ cast: { $size: 4 } });

/* You cannot use $size to find a range of sizes (for example: arrays with more than 1 element). 
If you need to query for a range, create an extra size field that you increment when you add elements. */

/* You can even use regular expressions in your queries */
/* i means it's case-insensitive */
comedy.find({ name: { $regex: /bill|ted/i } });

/* An example with a syntax a bit shorter */
comedy.find({ name: /The hangover.*/i });

/* Another way of writing the same */
comedy.find({ name: { $regex: "The hangover.*", $options: "i" } });

/* Find all movies for which the comments contain the word love */
comedy.find({ "comments.text": /.*love.*/i });

/* If you wish to specify both a regex and another operator for the same field, 
you need to use the $regex clause.  */
comedy.find({ name: { $regex: /The hangover.*/i, $nin: ["The Hangover Part II"] } });

/* The $not meta operator can be used to negate the check performed by a standard operator. */
comedy.find({ name: { $not: /The hangover.*/i } });

/* Find all movies for which the comments do not contain the word like */
comedy.find({ "comments.text": { $not: /.*like.*/i } });

/* The following doesn't work! --> "errmsg" : "$not needs a regex or a document" */
comedy.find({ year: { $not: 2012 } });

/* Find all comedies that were not released in 2012 */
comedy.find({ year: { $ne: 2012 } });

/* MongoDB queries support JavaScript expressions! */
comedy.find({ $where: 'this.year > 2009 && this.name !== "Ted"' });

/* Try to retrieve the same result as in the previous query, but not using JavaScript */
comedy.find({ year: { $gt: 2009 }, name: { $ne: "Ted" } });

/* Note that the flexibility of JavaScript expressions comes at a price
It is slower than native MongoDB operators. */

/* MongoDB has another operator called $where. Using which you can perform SQL's WHERE-like operations. */
comedy.find({ $where: "this.year > 2011" });

/* Find all comedies that were released in 2011 or later with Ed Helms as part of the cast */
comedy.find({ cast: "Ed Helms", $where: "this.year >= 2011" });

/* Find all movies that were commented by Steve and have a budget of 50 million dollar or more */
comedy.find({ "comments.by": "Steve", $where: "this.merits.budget >= 50" });

/* Find all movies with 3 comments or more */
comedy.find({ $where: "this.comments.length >= 2" }); //THIS YOU CANT DO WITH STANDARD MONGO

/* Again, like JavaScript expressions $where is slower than native operators. 
Use JavaScript expressions and $where ONLY when you can't accomplish the query using native operators. */

/* The $all operator is similar to $in, 
but instead of matching any value in the specified array all values in the array must be matched. */
/* An array can have more elements than those specified by the $all criteria. 
$all specifies a minimum set of elements that must be matched. */
comedy.find({ cast: { $all: ["Bradley Cooper", "Ed Helms"] } });
comedy.find({ cast: { $all: ["Bradley Cooper", "Mila Kunis"] } });

/* Find all movies commented by Anne and Robin */
comedy.find({ "comments.by": { $all: ["Anne", "Robin"] } });

/* $exists checks for existence (or lack thereof) of a field. */
comedy.find({ tagline: { $exists: true } });
comedy.find({ "merits.boxOffice": { $exists: true } });

/* Find all movies that have a sequel */
comedy.find({ sequel: { $exists: true } });

/* Find all movies that have a sequel of the Hangover */
comedy.find({ sequel: { $exists: true, $regex: /.*hangover.*/i } });

/* Find all movies which have a field prizes and which won more than 10 prizes */
comedy.find({ "technical.prizes": { $exists: true, $gt: 10 } });

/* In the mongo shell, the primary method for the read operation is the db.collection.find() method. 
This method queries a collection and returns a cursor to the returning documents.
To access the documents, you need to iterate the cursor. 
However, in the mongo shell, if the returned cursor is not assigned 
to a variable using the var keyword, then the cursor is automatically 
iterated up to 20 times to print up to the first 20 documents in the results.
When you assign the cursor returned from the find() method 
to a variable using the var keyword, the cursor does not automatically iterate. */
const cursor = comedy.find({ year: { $gt: 2010 } });

/* You can call the cursor variable in the shell to iterate up to 20 times
– if there are 20 documents – and print the matching documents */
cursor;

/* You can also use the cursor method next() to access the documents */
cursor.rewind();
while (cursor.hasNext()) {
  console.log(JSON.stringify(cursor.next(), null, 2));
}

/* You can use the cursor method forEach() to iterate the cursor and access the documents */
cursor.rewind();
cursor.forEach((doc) => console.log(JSON.stringify(doc, null, 2)));

/* You can use the toArray() method to iterate the cursor and return the documents in an array */
const documentArray = comedy.find({ year: { $gt: 2010 } }).toArray();
const myDocument = documentArray[1];
console.log(myDocument);

/* The toArray() method loads into RAM all documents returned by the cursor; 
the toArray() method exhausts the cursor. */

/* Try to get the following result */
/* 
Ted --> Mark Walhlberg,Mila Kunis,Seth MacFarlane
We're the Millers --> Jennifer Aniston,Luis Guzmán,Ed Helms,Kathryn Hahn
The Hangover --> Bradley Cooper,Ed Helms,Zach Galifianakis
The Hangover Part II --> Bradley Cooper,Ed Helms,Zach Galifianakis
*/
comedy.find({}, { cast: true, name: true }).forEach((x) => console.log(`${x.name} --> ${x.cast}`));

/* Any good database system should have a count() method 
which returns the number of records that will be returned for a query. 
MongoDB too has a count() method which you can call on a collection to get the count of the results. */

/* This will return the total number of documents in the collection comedy */
comedy.count();

/* This will return the total number movies with the value of year more than 2009 */
comedy.count({ year: { $gt: 2009 } });

/* Find the number of movies witch are commented by Steve */
comedy.count({ "comments.by": "Steve" });

/* To limit the collection to just two */
comedy.find().limit(2);

/* The skip() expression allows one to specify at which object 
the database should begin returning results. */
comedy.find().skip(1).limit(2);

/* In the shell, a limit of 0 is equivalent to setting no limit at all. */

/* sort() is analogous to the ORDER BY statement in SQL - 
it requests that items be returned in a particular order. 
You can pass sort() a key pattern which indicates the desired order for the result. */
comedy.find().sort({ name: 1 });

/* Sort the movies chronologically */
comedy.find().sort({ year: 1 });

/* Sort the movies reverse chronologically */
comedy.find().sort({ year: -1 });

/* Use indexes in MongoDB */
/* The following operation creates an ascending index on the year field */
comedy.createIndex({ year: 1 });

/* Update data in MongoDB */
/* Suppose you would want to add a new field to the movie Ted. 
What comes to your mind instantly might look something like this (do not execute this!) */
comedy.update({ name: "Ted" }, { director: "Seth MacFarlane" }); //BAD BAD BAD!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/* HOLD IT! That's about to do something disastrous. 
It will overwrite the whole document with {director:'Seth MacFarlane'}, 
instead of updating it by appending a new field.
The right way to do is: */
comedy.update({ name: "Ted" }, { $set: { director: "Seth MacFarlane" } }); // $set is very IMPORTANT !!!!!!!!!!!!!

/* The above command will reorder the fields, but worry not, the data is safe and intact.
The db.collection.update() method modifies existing documents in a collection. 
The db.collection.update() method can accept query criteria to determine which documents to update.
By default, the db.collection.update() method updates a single document.
Operations performed by an update are atomic within a single document. */

/* With the multi option, update() can update all documents in a collection that match a query. 
Otherwise the update method will affect only 1 document. Which document will be affected, is undefined. */
comedy.update(
  { name: /The hangover.*/i },
  { $set: { director: "Todd Phillips" } },
  { multi: true }
);

/* Add a new field voiceOver: 'Patrick Stewart' to both Ted movies */
comedy.update({ name: /ted.*/i }, { $set: { voiceOver: "Patrick Stewart" } }, { multi: true });

/* If the update() method includes upsert: true and no documents match the query portion 
of the update operation, then the update operation creates a new document. 
If there are matching documents, then the update operation with the upsert: true 
modifies the matching document or documents.
By specifying upsert: true, applications can indicate, in a single operation, 
that if no matching documents are found for the update, an insert should be performed. */
comedy.update({ name: "The Hangover Part III" }, { $set: { year: 2013 } }, { upsert: true });

/* If you want to update at most a single document that match a specified filter 
even though multiple documents may match the specified filter. New in version 3.2 */
comedy.updateOne({ name: /The hangover.*/i }, { $set: { distributedBy: "Warner Bros Pictures" } });

/* If you want to update all documents that match a specified filter. New in version 3.2 */
comedy.updateMany({ name: /The hangover.*/i }, { $set: { distributedBy: "Warner Bros Pictures" } });

/* Update all Ted documents so the distribution company is Universal Pictures */
comedy.updateMany({ name: /ted.*/i }, { $set: { distributedBy: "Universal Pictures" } });

/* Write operations – if they affect multiple documents – are not isolated transactions, 
instead they can affect a few documents, then yield and allow other readers 
or writers to operate and then pick up again to affect some more documents. 
However, an individual document manipulation is always atomic with respect to any concurrent readers or writers. 
So no reader or writer in the system will see the document half updated. */

/* How do you update a value which is an array? */
comedy.update({ name: "Ted" }, { $push: { cast: "Joel McHale" } });

/* Add the actor 'Giovanni Ribisi' to the cast of Ted */
comedy.update({ name: "Ted" }, { $push: { cast: "Giovanni Ribisi" } });

/* If you need to remove something from the cast array, you can do it this way */
comedy.update({ name: "Ted" }, { $pull: { cast: "Giovanni Ribisi" } });

/* You can also use $pop to remove the first element */
comedy.update({ name: "Ted" }, { $pop: { cast: -1 } });

/* You can also use $pop to remove the last element */
comedy.update({ name: "Ted" }, { $pop: { cast: 1 } });

/* How can you delete a field from a document? */
comedy.update({ name: "Ted" }, { $unset: { cast: 1 } });

/* Remove the voiceOver field from both Ted movies */
comedy.updateMany({ name: /ted.*/i }, { $unset: { voiceOver: 1 } });

/* In case you want to delete a field from all the documents of a collection */
/* The false parameter is for upsert option, true is for multiple option. 
We set multiple option to true because we want to delete them all from the collection. */
comedy.update({}, { $unset: { cast: 1 } }, false, true);

/* How can you delete a document from a collection? */
comedy.remove({ name: /Ted*/i });
/* The above command deletes a single document OR ALL DOCUMENTS that match a specified filter. */

/* If you want to delete at most a single document that match a specified filter 
even though multiple documents may match the specified filter. New in version 3.2*/
comedy.deleteOne({ name: /The Hangover*/i });

/* If you want to delete all documents that match a specified filter. New in version 3.2 */
comedy.deleteMany({ name: /The Hangover*/i });

/* How do you empty a collection of its documents? */
comedy.remove({});
/* Note, the above command does not delete the collection, 
it just empties the collection like the SQL truncate command. */

/* How do you drop a collection? */
comedy.drop();

/* How do you drop a database? */
moviesDb.dropDatabase();
