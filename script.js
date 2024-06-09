let currentPage = 0;
const storiesPerPage = 100; // Change this value as needed

async function fetchTopStories(startIndex) {
  console.log("Fetching top stories...");
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
	const endIndex = Math.min(startIndex + storiesPerPage, storyIds.length);
	const selectedStories = storyIds.slice(startIndex, endIndex);
	console.log("Top stories fetched:", selectedStories);
	return selectedStories;
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
  const youtubeRegex = /<a href="(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be).*/g;
  return youtubeRegex.test(text);
}

function extractYouTubeLinks(text) {
  // Decode URLs
  text = text.replace(/&#x([0-9a-fA-F]+);/g, function(match, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  });
  const youtubeRegex = /<a href="(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be).*/g;
  return text.match(youtubeRegex);
}
function displayComments(story, comments) {
  const commentsContainer = document.getElementById('comments');

  const storyDetails = document.createElement('details');
  storyDetails.innerHTML = `
    <summary><a href="${story.url}" target="_blank">${story.title}</a></summary>
    <p>Author: ${story.by}</p>
    <p>Score: ${story.score}</p>
    <p>Number of Comments: ${story.descendants}</p>
    <p>Time: ${new Date(story.time * 1000).toLocaleString()}</p>
  `;
  commentsContainer.appendChild(storyDetails);

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    const youTubeLinks = extractYouTubeLinks(comment.text);

    commentElement.innerHTML = `
      <p>${comment.text}</p>
      <p>Upvotes: ${comment.score}</p>
      <p>Posted by: ${comment.by}</p>
      <p>Time: ${new Date(comment.time * 1000).toLocaleString()}</p>
      <div> 
        ${youTubeLinks ? youTubeLinks.map(link => `<a href="${link}" target="_blank">${link}</a>`).join('<br>') : ''}
      </div>
    `;
    storyDetails.appendChild(commentElement);
  });
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
}
async function main() {
  console.log("Starting main function...");
  let totalStories = 0;
  let totalComments = 0;

  document.getElementById('prevPage').addEventListener('click', async () => {
    if (currentPage > 0) {
      currentPage--;
      await loadStories(currentPage * storiesPerPage);
    }
  });

  document.getElementById('nextPage').addEventListener('click', async () => {
    currentPage++;
    await loadStories(currentPage * storiesPerPage);
  });

  async function loadStories(startIndex) {
    const topStories = await fetchTopStories(startIndex);

    document.getElementById('prevPage').disabled = currentPage === 0;
    //document.getElementById('nextPage').disabled = (currentPage + 1) * storiesPerPage >= totalStories;

    for (const storyId of topStories) {
      const story = await fetchStoryDetails(storyId);

      if (story && story.kids) {
        totalStories++;
        const comments = await fetchComments(story.kids);
        totalComments += comments.length;

        const filteredComments = comments.filter(comment => comment && comment.text && containsYouTubeLink(comment.text));

        console.log("Filtered comments:", filteredComments);
        if (filteredComments.length > 0) {
          displayComments(story, filteredComments);
        }
      }
    const counter = document.getElementById('counter');
    counter.textContent = `Searched ${totalStories} stories and ${totalComments} comments.`;
    }

    console.log("Main function completed.");
  }

  await loadStories(0);
}

main();
