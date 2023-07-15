"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    let url = new URL(this.url);
    return url.hostname;
  }


  /**Takes an id and interacts with the API to return a Story instance */

  static async getStoryByID(id) {

    const response = await axios.get(
      `https://hack-or-snooze-v3.herokuapp.com/stories/${id}`
    );

    console.log('getStoryByID server response:', response);

    const story = new Story({
      storyId: response.data.story.storyId,
      title: response.data.story.title,
      author: response.data.story.author,
      url: response.data.story.url,
      username: response.data.story.username,
      createdAt: response.data.story.createdAt
    });

    console.log(story);

    return story;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    console.log('addStory called with user', user, 'newStory', newStory);
    // UNIMPLEMENTED: complete this function!
    const response = await axios.post(`${BASE_URL}/stories`, {
      token: user.loginToken,
      story: newStory,
    });

    console.log('response from server:', response);

    const story = new Story(response.data.story);
    this.stories.unshift(story);
    return story;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }


  /************************ USER TOKEN METHODS ********************************/


  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }



  /*************************FAVORITES LIST METHODS ****************************/


  /** create a method that allows user to favorite a story
   * input: Story instance
   * send a request to API for un-favoriting and updates user favorites
  */

  async favorite(story) { //TODO: should this take an id?
    console.log('Favorite Story: ', story);
    // access user favorite
    // add the story to the list
    currentUser.favorites.push(story);
    const response = await axios.post( //save response for error handling later
      `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
      { token: currentUser.loginToken }
    );
    console.log('favorite response from server:', response);
  }


  /**Allows user to un-favorite a story
   * input: Story instance
   * send a request to API for un-favoriting and updates user favorites
   */
  async unFavorite(storyToUnfavorite) {
    console.log('unFavorite Story: ', storyToUnfavorite);
    // access user favorite
    // remove the story to the list

    const indexToSplice = this.favorites.findIndex(
      story => story.storyId === storyToUnfavorite.storyId
    );
    //TODO: Remove from list and send to API
    this.favorites.splice(indexToSplice, 1);

    const postRequestURL = (
      `${BASE_URL}/users/` +
      `${currentUser.username}/favorites/${storyToUnfavorite.storyId}`
    );
    //TODO: ADDED Delete and removed Post in axios
    const response = await axios.delete( //save response for error handling later
      postRequestURL,
      { token: currentUser.loginToken }
    );
    console.log("unfavorite server response:", response);
  }
}
