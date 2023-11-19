import React, { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import './NewsList.css';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [darkTheme, setDarkTheme] = useState(false);

  useEffect(() => {
    axios
      .get("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
      .then((response) => {
        const topStoryIds = response.data.slice(0, 10);
        return Promise.all(
          topStoryIds.map((storyId) =>
            axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json?print=pretty`)
          )
        );
      })
      .then((storyResponses) => {
        const newsData = storyResponses.map((response) => response.data);
        setNews(newsData);
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }, []);

  useEffect(() => {
    const existingBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    setBookmarked(existingBookmarks);
  }, []);

  useEffect(() => {
    // Add or remove the dark-theme class to the container when the dark theme state changes
    const container = document.querySelector('.container');
    if (container) {
      container.classList.toggle('dark-theme', darkTheme);
    }
  }, [darkTheme]);

  const toggleBookmark = (url, title) => {
    const existingBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const updatedBookmarks = existingBookmarks.some((bookmark) => bookmark.url === url)
      ? existingBookmarks.filter((bookmark) => bookmark.url !== url)
      : [...existingBookmarks, { url, title }];

    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    setBookmarked(updatedBookmarks);
  };

  const viewComments = (story) => {
    setSelectedStory(story);
  };

  const closeComments = () => {
    setSelectedStory(null);
  };

  const toggleDarkTheme = () => {
    setDarkTheme((prevDarkTheme) => !prevDarkTheme);
  };

  return (
    <div className={`container mt-4 ${darkTheme ? 'dark-theme' : ''}`}>
      <h1 className="text-center mb-4">OSONEWS</h1>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="darkThemeSwitch"
          checked={darkTheme}
          onChange={toggleDarkTheme}
        />
        <label className="form-check-label" htmlFor="darkThemeSwitch">
          Dark Theme
        </label>
      </div>
      {selectedStory ? (
        <div>
          <button className="btn btn-primary mb-3" onClick={closeComments}>
            Go Back
          </button>
          <h2>{selectedStory.title}</h2>
          <p>
            <strong>Author:</strong> {selectedStory.by}
          </p>
          <p>
            <strong>Likes:</strong> {selectedStory.score}
          </p>
          <p>
            <strong>Comments:</strong> {selectedStory.kids ? selectedStory.kids.length : 0}
          </p>
          <p>
            <strong>Hours Ago:</strong>{" "}
            {calculateHoursAgo(selectedStory.time)}
          </p>
          <h3>Comments</h3>
          {selectedStory.kids ? (
            <ul>
              {selectedStory.kids.map((commentId) => (
                <li key={commentId}>
                  <Comment commentId={commentId} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments</p>
          )}
        </div>
      ) : (
        <>
          <button
            className="btn btn-primary mb-3"
            onClick={() => setShowBookmarked(!showBookmarked)}
          >
            {showBookmarked ? "Go Back" : "View Bookmarks"}
          </button>
          {showBookmarked ? (
            <div>
              <h2>Bookmarks</h2>
              <ul className="list-group">
                {bookmarked.map((bookmark, index) => (
                  <li key={index} className="list-group-item">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                      {bookmark.title}
                    </a>
                    <button
                      className="btn btn-danger btn-sm float-end"
                      onClick={() => toggleBookmark(bookmark.url, bookmark.title)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="list-group">
              {news.map((story) => (
                <li key={story.id} className="list-group-item">
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.title}
                  </a>
                  <p>
                    <strong><i className="bi bi-person"></i></strong> {story.by}
                  </p>
                  <p>
                    <strong><i className="bi bi-hearts"></i></strong> {story.score}
                  </p>
                  <p
                    onClick={() => viewComments(story)}
                    style={{ cursor: "pointer", color: "blue" }}
                  >
                     {story.kids ? story.kids.length : 0}
                     <strong> <i className="bi bi-chat-left-text"></i></strong>
                  </p>
                  <p>
                    <strong></strong>{" "}
                    {calculateHoursAgo(story.time)}
                  </p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => toggleBookmark(story.url, story.title)}
                  >
                    {bookmarked.some((bm) => bm.url === story.url) ? "Remove" : "Bookmark"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

const calculateHoursAgo = (timestamp) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const secondsAgo = currentTime - timestamp;
  const hoursAgo = Math.floor(secondsAgo / 3600);
  return hoursAgo + " hours ago";
};

const Comment = ({ commentId }) => {
  const [comment, setComment] = useState(null);

  useEffect(() => {
    axios
      .get(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json?print=pretty`)
      .then((response) => {
        setComment(response.data);
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }, [commentId]);

  return (
    comment ? (
      <div>
        <p>{comment.text}</p>
        <p>
          <strong><i className="bi bi-person"></i></strong> {comment.by}
        </p>
        <p>
          <strong><i className="bi bi-hearts"></i></strong> {comment.score}
        </p>
        <p>
          <strong></strong>{" "}
          {calculateHoursAgo(comment.time)}
        </p>
      </div>
    ) : (
      <p>Loading...</p>
    )
  );
};

export default NewsList;
