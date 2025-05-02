// lib/mcp/adapters/redditAdapter.js
import axios from "axios";
import { createModelContext } from "../modelContext"; // Import the standard structure

// --- Reddit API Authentication (Copied from previous api route) ---
async function getRedditAccessToken() {
  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");
  try {
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      `grant_type=password&username=${encodeURIComponent(
        process.env.REDDIT_USERNAME
      )}&password=${encodeURIComponent(process.env.REDDIT_PASSWORD)}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "User-Agent": process.env.REDDIT_USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Reddit Adapter Error: Failed to get Access Token:",
      error.response?.data || error.message
    );
    throw new Error("Reddit Adapter: Failed to authenticate.");
  }
}

// --- Transform Reddit Post Data to ModelContext ---
function transformRedditPost(post, brandQuery) {
  const data = post.data;
  if (!data) return null;

  const mentionText = data.selftext || data.title || ""; // Use body or title

  return createModelContext({
    id: `reddit_${data.id}`,
    sourceType: "reddit",
    sourceIdentifier: data.id,
    url: `https://www.reddit.com${data.permalink}`,
    text: mentionText,
    title: data.title,
    author: {
      id: data.author_fullname, // Might not always be available
      name: data.author,
      url: `https://www.reddit.com/user/${data.author}`,
    },
    // parent: null, // Could add subreddit info here if needed
    metadata: {
      createdAt: new Date(data.created_utc * 1000).toISOString(),
      redditScore: data.score,
      redditNumComments: data.num_comments,
      redditSubreddit: data.subreddit_name_prefixed,
      // Add other potentially useful fields like 'upvote_ratio', 'link_flair_text' etc.
    },
    fetchedAt: new Date().toISOString(),
    tags: brandQuery ? [brandQuery] : [],
    rawSourceData: data, // Optional: include raw data
  });
}

// --- Fetch Mentions from Reddit ---
export async function fetchMentions(brandQuery) {
  console.log(`Reddit Adapter: Fetching mentions for "${brandQuery}"`);
  if (!brandQuery) return [];

  try {
    const accessToken = await getRedditAccessToken();
    const searchUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(
      brandQuery
    )}&type=link&sort=new&limit=25`; // Search posts

    const redditResponse = await axios.get(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": process.env.REDDIT_USER_AGENT,
      },
    });

    const posts = redditResponse.data?.data?.children ?? [];
    console.log(`Reddit Adapter: Found ${posts.length} potential posts.`);

    // Transform raw posts into ModelContext objects
    const modelContexts = posts
      .map((post) => transformRedditPost(post, brandQuery))
      .filter((mc) => mc !== null && mc.text); // Ensure transformation succeeded and has text

    console.log(
      `Reddit Adapter: Transformed ${modelContexts.length} posts to ModelContext.`
    );
    return modelContexts;
  } catch (error) {
    console.error(
      `Reddit Adapter Error fetching mentions for "${brandQuery}":`,
      error.message
    );
    // Don't throw, return empty array or partial results if applicable
    // Or re-throw if the calling service should handle it
    // throw error; // Or handle more gracefully
    return []; // Return empty on error for now
  }
}

// TODO: Add fetchComments function if needed later
