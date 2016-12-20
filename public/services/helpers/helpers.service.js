window.app.factory('helpers', function () {
  var service = {};

  /**
   * Receives a title for a blog post and makes a url version of it for navigation purposes.
   * EX: My First Post = my-first-post
   * @param {string} title The title for the blog article
   * @return {string} The generated url
   */
  service.convertUrlToTitle = title => {
    return title.replace(/[ ]/g, "-").toLowerCase();
  }

  return service;
})
