import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import env from "dotenv";
import bcrypt from 'bcrypt';

const app = express();
const port = 5000;
const saltRounds = 10;

app.use(bodyParser.json());
app.use(cors());
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

// Route to handle POST requests to "/signup"
app.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    // Extract data from request body
    const { username, password } = req.body;
    const hashedPassword= bcrypt.hash(password,saltRounds);
    const query = `INSERT INTO users ( username, password) VALUES ($1, $2)`;
    await db.query(query, [username, hashedPassword]);

    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;
    const usercheck = await db.query('SELECT * FROM users WHERE username=$1', [username]);
    console.log(usercheck.rows);
    if (usercheck.rows.length > 0) {
      const storedHashedPassword = usercheck.rows[0].password;
      const match = await bcrypt.compare(password, storedHashedPassword);
      if (match) {
        res.send("Sign in was s")
      } else {
        console.log("Wrong Password. Try Again");
        res.status(401).send("Wrong Password");
      }
    } else {
      console.log('User not registered. Sign up please');
      res.status(404).send('User not registered');
    }
  } catch (error) {
    console.log('An unexpected error occurred. We are sorry', error);
    res.status(500).send('An unexpected error occurred');
  }
});
// Route to handle GET requests to "/"
app.get("/", (req, res) => {
  res.send("Welcome to your backend server!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
