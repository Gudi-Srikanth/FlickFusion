import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import env from "dotenv";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";

const app = express();
const port = 5000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

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
    const result = await db.query(
      "INSERT INTO users (display_name, username, password) VALUES ($1, $2, $3) RETURNING *",
      [display_name, username, hashedPassword]
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

// Auth check route for frontend
app.get("/checkAuth", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

// Passport Local Strategy
passport.use(new Strategy(async (username, password, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return cb(null, false);

    const user = result.rows[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
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
  done(null, user.user_id); // or whatever your user primary key is
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
