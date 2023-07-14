"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
           <i class="bi bi-star"></i>
         </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//TODO: getStoryElementByID function (id)


/** create an event listener for when click on star for favorite
 * add to the favorites list */
async function handleFavoriteClick(evt) {
  evt.preventDefault();

  //console.log('Evt Target: ', evt.target);
  const $li = $(evt.target).closest('li');
  //console.log('closest li', $li);
  const id = $li.attr('id');
  //console.log('id: ', id);
  const story = await Story.getStoryByID(id);

  if (!currentUser.favorites  //if story is not favorite
    .some(
      favStory => favStory.storyId === story.storyId
    )) {
    await currentUser.favorite(story);
    console.log('find star: ', $(evt.target));
    $(evt.target)
      .addClass('bi-star-fill')
      .removeClass('bi-star');
  } else {
    await currentUser.unFavorite(story);
    $(evt.target)
      .addClass('bi-star')
      .removeClass('bi-star-fill');
  }
}

//TODO: event delegate for handleFavorite Click
$allStoriesList.on('click', '.bi-star', handleFavoriteClick);

/** create a function for marking as favorite
 * check if story is in our favorite list
 * if so, render the DOM as star being filled in
*/

/** create a function for marking as unfavorite */



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Takes a single story, generates HTML and puts at the top of the story list */

function putStoryOnPage(story) {
  console.log('putStoryOnPage called with story', story);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  //TODO: Decide whether to update the user's view here
}

/** Pulls data from the add story form, adds it to the storyList and
 *  renders it to the DOM
 */
async function addStoryAndDisplay(evt) {
  console.log('handle Add Story And Submit: ', evt);
  evt.preventDefault();
  //get form data
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();
  const newStoryData = {
    author: author,
    title: title,
    url: url,
  };
  //call addStory
  const story = await storyList.addStory(currentUser, newStoryData);
  //put on page
  putStoryOnPage(story);
}

$addStoryForm.on('submit', addStoryAndDisplay);
