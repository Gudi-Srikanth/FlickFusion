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
    secure: false,     
    sameSite: "lax"
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
  console.log("Received signup request:", req.body);

  try {
    const existingUser = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const defaultProfilePic = "/defaultPfp.jpg";

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
      return res.status(200).json({ message: "Login successful", user });
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
    const result = await db.query("SELECT * FROM users WHERE user_id = $1", [id]);
    const user = result.rows[0];
    done(null, user);
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
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

//GET search results
app.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    // Check if movie is already in database
    const dbresponse = await db.query(
      "SELECT * FROM movies WHERE title ILIKE $1 LIMIT 5",
      [`%${query}%`]
    );

    if (dbresponse.rows.length > 0) {
      console.log("DB search results:", dbresponse.rows);
      return res.json(dbresponse.rows);
    } else {
      // Fetch from TMDB API
      const apiresponse = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_TOKEN}`
        },
        params: { query }
      });

      let searchResults = apiresponse.data.results;
      console.log("TMDB API search results:", searchResults);

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

      searchResults = searchResults.slice(0, 5);
      return res.json(searchResults);
    }
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



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});