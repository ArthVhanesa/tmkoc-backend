const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Firebase Firestore instance
const db = admin.firestore();

app.get("/", (req, res) => {
  res.send("TMKOC Perfect episode");
});

// GET route to retrieve all episodes
app.get("/episodes", async (req, res) => {
  try {
    const episodesRef = db.collection("tmkoc-episodes");
    const snapshot = await episodesRef.get();

    const episodes = [];
    snapshot.forEach((doc) => {
      const episodeData = doc.data();
      episodes.push(episodeData);
    });

    res.json({ episodes: episodes });
  } catch (error) {
    console.error("Error retrieving episodes:", error);
    res.status(500).json({ error: "Failed to retrieve episodes" });
  }
});

// POST route to submit a new episode
app.post("/episodes", async (req, res) => {
  try {
    const { youtubeVideoID, episodeName } = req.body;

    // Create a new document in 'tmkoc-episodes' collection
    await db.collection("tmkoc-episodes").add({
      youtubeVideoID,
      episodeName,
    });

    res.status(201).json({ message: "Episode submitted successfully" });
  } catch (error) {
    console.error("Error submitting episode:", error);
    res.status(500).json({ error: "Failed to submit episode" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
