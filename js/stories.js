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
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

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

/** Takes a single story, generates HTML and puts on page */

function putStoryOnPage(story) {
  console.log('putStoryOnPage called with story', story);
  const $story = generateStoryMarkup(story);
  $allStoriesList.append($story);
  //TODO: Decide whether to update the user's view here
}

/** Pulls data from the add story form, adds it to the storyList and
 *  renders it to the DOM
 */
async function handleAddStorySubmit(evt) {
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
  const story = await storyList.addStory(newStoryData);
  //put on page
  putStoryOnPage(story);
}

$addStoryForm.on('submit', handleAddStorySubmit);
