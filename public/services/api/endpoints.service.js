/**
 * @overview 	A sevice that sends get, post, put, and delete requests to the server through http. Allows raw mongoDB queries to be passed to the server. The user creates a new instance of the endpoints service providing an endpoint url to reach and calls api methods on that instance.
 * @author Jon Paul Miles <milesjonpaul@gmail.com>
 * @version 1.0.0
 * @license MIT
 * @example `var menus = new endpoints('menus');
 * var replaceMenu = {
 * 	url: '/new-url',
 * 	classes: 'another-class',
 * 	target:'_self'
 * };
 * //Pass in raw mongoDB queries
 * menus.update({url: '/about'}, replaceMenu).then(cb);`
 */

(function(){
	/**
	 * Sets up a rest endpoint for the given url so create, find, update, and delete can be performed on it.
	 * @constructor
	 * @param  {string} endpoint The URL of the server endpoint to reach. `/api/` prefix is already assumed.
	 * @return {nothing}
	 */
	function endpoints(endpoint) {
		this.endpoint = endpoint || '';
    this.url = endpoint;
	}

	/**
	 * Adds content in the server database for the endpoint passed into the constructor function.
	 * @param  {object} content the item to be added to the database
	 * @return {promise}         An object or array of items that were created
	 */
	endpoints.prototype.create = function(content) {
    return feathers.service(this.url).create(_.clone(content, true));
	};

	/**
	 * Gets data matching the query.
	 * @param  {object} identifier Raw mongoDB query
	 * @return {promise}            An object or array of items matching the query
	 */
	endpoints.prototype.find = function(identifier) {
    return feathers.service(this.url).find({ query: identifier });
	};

	/**
	 * Updates data in the server database identified with a mongoDB query with the replacement data passed in.
	 * @param  {object} identifier  Raw mongoDB query
	 * @param  {object} replacement Whatever data you want to replace the found data with
	 * @return {promise}             Number of items that were updated
	 */
	endpoints.prototype.update = function(identifier, replacement) {
    var rp = _.clone(replacement, true);
    rp.createdAt = undefined;
    rp.updatedAt = undefined;

    return feathers.service(this.url).patch(null, rp, {query: identifier});
	};

	/**
	 * Deletes data from the server database that matches the mongoDB query passed in.
	 * @param  {object} identifier Raw mongoDB query
	 * @return {promise}            http response object
	 */
	endpoints.prototype.delete = function(identifier) {
    let id = null;
    let query = {query: identifier};
    if(identifier._id) { id = identifier._id; query = undefined; }

    return feathers.service(this.url).remove(id, query);
	};

	/**
	 * Returns one item from the server that has the mongoDB _id passed in.
	 * @param  {string} id The _id value of the object to retrieve
	 * @return {promise}    Object that has that id
	 */
	endpoints.prototype.findOne = function(id) {
    return feathers.service(this.url).get(id);
	};

	/**
	 * Updates one item in the database that has the _id passed in with the information in replacement.
	 * @param  {string} id          The `_id` of the mongoDB object
	 * @param  {object} replacement The content to replace the found object with
	 * @return {promise}             Number of items replaced
	 */
	endpoints.prototype.updateOne = function(id, replacement) {
    var rp = _.clone(replacement, true);
    rp.createdAt = undefined;
    rp.updatedAt = undefined;

    return feathers.service(this.url).patch(id, rp);
	}

	/**
	 * Deletes one item from the server database that has the _id that was passed in.
	 * @param  {string} id The _id of the mongoDB object to delete
	 * @return {promise}    http response object
	 */
	endpoints.prototype.deleteOne = id =>  {
    return feathers.service(this.url).remove(id);
	};

	window.endpoints = endpoints
})();
