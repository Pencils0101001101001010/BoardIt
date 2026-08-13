const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db.js");

const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Email and an 8+ character password is required." });
  }

  const exiting = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (exiting.rows.length > 0) {
    return res
      .status(409)
      .json({ error: "An account with this email already exists. " });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userResult = await client.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash],
    );
    const user = userResult.rows[0];

    //Give every user a starter board
    await client.query("INSERT INTO boards (user_id, name) VALUES ($1, $2)", [
      user.id,
      "My first board.",
    ]);

    await client.query("COMMIT");

    const token = signToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
};

// GET /api/auth/me — used by the frontend to restore a session on refresh
exports.me = async (req, res) => {
  const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [
    req.userId,
  ]);
  if (result.rows.length === 0)
    return res.status(404).json({ error: "User not found." });
  res.json({ user: result.rows[0] });
};
