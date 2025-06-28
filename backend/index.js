import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import env from "dotenv";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import axios from "axios";

const app = express();
const port = 5000;
const saltRounds = 10;
env.config();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Signup Route
app.post("/signup", async (req, res) => {
  const { display_name, username, password } = req.body;

  try {
    const existingUser = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const defaultProfilePic = "/assets/defaultPfp.jpg";

    const result = await db.query(
      `INSERT INTO users (display_name, username, password_hash, profile_pic_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [display_name, username, hashedPassword, defaultProfilePic]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(500).json({ message: "User creation failed" });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed after signup" });
      }
      res.status(200).json({ message: "Signup successful", user });
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// Login Route
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      
      // Clean user data before sending to client
      const { password_hash, ...safeUser } = user;
      return res.status(200).json({ 
        message: "Login successful", 
        user: safeUser 
      });
    });
  })(req, res, next);
});

// Passport Local Strategy
passport.use(new Strategy(async (username, password, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return cb(null, false);

    const user = result.rows[0];
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) return cb(err);
      if (isMatch) return cb(null, user);
      return cb(null, false);
    });
  } catch (err) {
    return cb(err);
  }
}));

// Serialize the user ID to save in session
passport.serializeUser((user, done) => {
  done(null, user.user_id); 
});

// Deserialize the user from the ID stored in session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query(
      "SELECT user_id, username, display_name, profile_pic_url, created_at FROM users WHERE user_id = $1", 
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});


// Logout route
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }

      res.clearCookie("connect.sid"); 
      res.status(200).json({ message: "Logged out" });
    });
  });
});

// Auth check route for frontend
app.get("/checkAuth", (req, res) => {
  if (req.isAuthenticated()) {
    const { password_hash, ...safeUser } = req.user;
    res.status(200).json({ 
      authenticated: true, 
      user: safeUser 
    });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

//GET search results
app.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    // Search in local DB first
    const dbresponse = await db.query(
      "SELECT * FROM movies WHERE title ILIKE $1  ORDER BY vote_count DESC, title ASC LIMIT 5",
      [`%${query}%`]
    );

    // Filter out broken entries (no title/poster)
    const filteredRows = dbresponse.rows.filter(
      movie => movie.title && movie.poster_path
    );

    if (filteredRows.length > 0) {
      return res.json(filteredRows);
    }

    // If not found or all rows were invalid, fetch from TMDB
    const apiresponse = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`
      },
      params: { query }
    });

    let searchResults = apiresponse.data.results;

    if (searchResults.length > 0) {
      const insertQuery = `
        INSERT INTO movies (
          id, title, poster_path, overview, release_date, vote_average, vote_count,
          adult, original_language, backdrop_path, genre_ids, original_title,
          popularity, video
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, $11, $12,
                $13, $14)
        ON CONFLICT (id) DO NOTHING
      `;

      for (const movie of searchResults) {
        try {
          await db.query(insertQuery, [
            movie.id,
            movie.title,
            movie.poster_path,
            movie.overview,
            movie.release_date && movie.release_date.trim() !== "" ? movie.release_date : null,
            movie.vote_average,
            movie.vote_count,
            movie.adult,
            movie.original_language,
            movie.backdrop_path,
            Array.isArray(movie.genre_ids) ? movie.genre_ids : null,
            movie.original_title,
            movie.popularity,
            movie.video
          ]);
        } catch (dbError) {
          console.error(`DB insert failed for "${movie.title}":`, dbError.message);
        }
      }
    }

    // Only return top 5 search results
    searchResults = searchResults.slice(0, 5);
    return res.json(searchResults);
  } catch (err) {
    console.error("TMDB API error:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

//GET User stats
app.get("/follow-stats/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [followersRes, followingRes] = await Promise.all([
      db.query("SELECT COUNT(*) FROM followers WHERE follower_id = $1", [userId]),
      db.query("SELECT COUNT(*) FROM followers WHERE following_id = $1", [userId])
    ]);

    res.json({
      followers: parseInt(followersRes.rows[0].count),
      following: parseInt(followingRes.rows[0].count)
    });
  } catch (err) {
    console.error("Follow stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

//POST User profile edit
app.post('/edit-profile', async (req, res) => {
  const { user_id, display_name, username, profile_pic_url } = req.body;
  if (!user_id || !display_name || !username) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    const existing = await db.query("SELECT * FROM users WHERE username = $1 AND user_id != $2", [username, user_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }

    const result = await db.query(
      "UPDATE users SET display_name = $1, username = $2, profile_pic_url = $3 WHERE user_id = $4 RETURNING *",
      [display_name, username, profile_pic_url, user_id]
    );

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//GET Movie details
app.get('/movie/:movieId', async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);

  if (isNaN(movieId)) {
    return res.status(400).json({ success: false, error: "Invalid movie ID" });
  }

  try {
    const movieResult = await db.query(`
      SELECT 
        id, title, poster_path, overview, release_date, 
        vote_average, vote_count, backdrop_path, genre_ids
      FROM movies 
      WHERE id = $1
    `, [movieId]);

    if (movieResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }

    const movie = movieResult.rows[0];

    // Fetch genre names
    let genres = [];
    if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
      const genreResult = await db.query(`
        SELECT g.genre_name 
        FROM UNNEST($1::int[]) AS genre_ids
        JOIN genres g ON g.genre_id = genre_ids
      `, [movie.genre_ids]);

      genres = genreResult.rows.map(g => g.genre_name);
    }

    return res.status(200).json({
      success: true,
      movie: { ...movie, genres }
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Database operation failed", 
      details: err.message 
    });
  }
});

//GET Movie rating
app.get('/movie/:movieId/rating', async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ success: false, error: "Invalid movie ID" });
  }
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }
    const result = await db.query('SELECT rating FROM ratings WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User hasn't rated the movie yet" });
    } else {
      return res.status(200).json({
        success: true,
        rating: result.rows[0].rating
      });
    }
  } catch (err) {
    console.error("Error fetching movie rating:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch movie rating" });
  }
});

//POST Movie rating
app.post('/movie/:movieId/rating', async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ success: false, error: "Invalid movie ID" });
  }

  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const { rating } = req.body;
    const existingRating = await db.query(
      `SELECT rating FROM ratings WHERE user_id = $1 AND movie_id = $2`,
      [userId, movieId]
    );

    const movieInfo = await db.query(
      `SELECT vote_average, vote_count FROM movies WHERE id = $1`,
      [movieId]
    );

    if (movieInfo.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }

    let { vote_average, vote_count } = movieInfo.rows[0];

    let newAverage;

    if (existingRating.rows.length > 0) {
      const oldRating = existingRating.rows[0].rating;

      await db.query(
        `UPDATE ratings SET rating = $1 WHERE user_id = $2 AND movie_id = $3`,
        [rating, userId, movieId]
      );

      newAverage = ((vote_average * vote_count) - oldRating + rating) / vote_count;
    } else {
      await db.query(
        `INSERT INTO ratings (user_id, movie_id, rating) VALUES ($1, $2, $3)`,
        [userId, movieId, rating]
      );

      vote_count += 1;
      newAverage = ((vote_average * (vote_count - 1)) + rating) / vote_count;
    }
    const updateResult = await db.query(
      `UPDATE movies SET vote_average = $1, vote_count = $2 WHERE id = $3`,
      [newAverage, vote_count, movieId]
    );

    if (updateResult.rowCount === 0) {
      return res.status(400).json({ success: false, error: "Failed to update movie rating" });
    }

    return res.status(200).json({
      success: true,
      newAverageRating: newAverage.toFixed(2)
    });

  } catch (err) {
    console.error("Error in posting movie rating", err);
    return res.status(500).json({ success: false, error: "Failed to submit movie rating" });
  }
});

//GET User review for a movie
app.get('/movie/:movieId/user-review', async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ success: false, error: "Invalid movie ID" });
  }

  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const result = await db.query(`
      SELECT r.*, u.display_name, u.profile_pic_url 
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.user_id = $1 AND r.movie_id = $2
    `, [userId, movieId]);

    const hasReviewed = result.rows.length > 0;

    return res.status(200).json({
      success: true,
      hasReviewed,
      review: hasReviewed ? result.rows[0] : null
    });
  } catch (err) {
    console.error("Error fetching user review:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch user review" });
  }
});

// GET Movie reviews excluding current user's review
app.get('/movie/:movieId/reviews', async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ success: false, error: "Invalid movie ID" });
  }

  try {
    const userId = req.user?.user_id || req.user?.id; // Handles both naming conventions
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const result = await db.query(`
      SELECT r.*, u.display_name, u.profile_pic_url
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.movie_id = $1 AND r.user_id != $2
      ORDER BY r.created_at DESC
    `, [movieId, userId]);

    return res.status(200).json({
      success: true,
      reviews: result.rows
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Database operation failed", 
      details: err.message 
    });
  }
});


//POST Movie review
app.post('/movie/:movieId/reviews', async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ success: false, error: "Invalid movie ID" });
  }
  return res.status(501).json({ success: false, error: "Not implemented" });
});



//GET User recent activity(recent reviews, ratings)

//GET Latest Releases

//GET Popular recent reviews 

//GET Popular reviewers

//GET Movie reccomendations (May not implement this)


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});