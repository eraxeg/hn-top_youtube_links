async function fetchTopStories() {
  console.log("Fetching top stories...");
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
  console.log("Top stories fetched:", storyIds.slice(0, 200));
  return storyIds.slice(0, 200);  // Fetch top 30 stories for example
}

async function fetchStoryDetails(storyId) {
  console.log(`Fetching details for story ID: ${storyId}`);
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
  const story = await response.json();
  console.log("Story details:", story);
  return story;
}

async function fetchComments(commentIds) {
  console.log(`Fetching comments for comment IDs: ${commentIds}`);
  const comments = await Promise.all(commentIds.map(async (commentId) => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
    return await response.json();
  }));
  console.log("Fetched comments:", comments);
  return comments;
}

function containsYouTubeLink(text) {
  // Decode URLs
  text = text.replace(/&#x([0-9a-fA-F]+);/g, function(match, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  });
  console.log(text);
  const youtubeRegex = /<a href="https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)\?si=[a-zA-Z0-9_-]+/g;
  return youtubeRegex.test(text);
}

function extractYouTubeLinks(text) {
  // Decode URLs
  text = text.replace(/&#x([0-9a-fA-F]+);/g, function(match, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  });
  const youtubeRegex = /<a href="https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)\?si=[a-zA-Z0-9_-]+/g;
  return text.match(youtubeRegex);
}

function displayComments(comments) {
  const commentsContainer = document.getElementById('comments');
  commentsContainer.innerHTML = '';

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    const youTubeLinks = extractYouTubeLinks(comment.text);

    commentElement.innerHTML = `
      <p>${comment.text}</p>
      <p>Posted by: ${comment.by}</p>
      <p>Time: ${new Date(comment.time * 1000).toLocaleString()}</p>
      <hr>
    `;
    commentsContainer.appendChild(commentElement);
  });
}
async function fetchCommentsForStory(storyId) {
  console.log(`Fetching comments for story ID: ${storyId}`);
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
  const story = await response.json();
  console.log("Story details:", story);
  if (story && story.kids) {
    const comments = await fetchComments(story.kids);
    return comments;
  } else {
    console.log("No comments found for story ID:", storyId);
    return [];
  }
}

async function justOne() {
  console.log("Starting main function...");
  const comments = await fetchCommentsForStory(40618079);

  const filteredComments = comments.filter(comment => comment && comment.text && containsYouTubeLink(comment.text));

  console.log("Filtered comments:", filteredComments);
  if (filteredComments.length > 0) {
    displayComments(filteredComments);
  } else {
    console.log("No comments match the criteria.");
  }

  console.log("Main function completed.");
}

async function main() {
  console.log("Starting main function...");
  const topStories = await fetchTopStories();
  let totalStories = 0;
  let totalComments = 0;
  const counter = document.getElementById('counter');
  for (const storyId of topStories) {
    const story = await fetchStoryDetails(storyId);

    if (story && story.kids) {
      totalStories++;
      const comments = await fetchComments(story.kids);
      totalComments += comments.length;
      //const filteredComments = comments.filter(comment => comment && comment.text && containsYouTubeLink(comment.text) && comment.score > 10);
      const filteredComments = comments.filter(comment => comment && comment.text && containsYouTubeLink(comment.text));
      //const filteredComments = comments;

      console.log("Filtered comments:", filteredComments);
      if (filteredComments.length > 0) {
        displayComments(filteredComments);
      }
    }
		counter.textContent = `Searched ${totalStories} stories and ${totalComments} comments.`;
  }
  console.log("Main function completed.");
}

main();

