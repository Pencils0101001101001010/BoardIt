const pool = require("../db.js");

exports.getBoards = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM boards WHERE user_id = $1 ORDER BY created_at DESC",
    [req.userId],
  );
  res.json(result.rows);
};

exports.createBoard = async (req, res) => {
  const { name } = req.body;
  const result = await pool.query(
    "INSERT INTO boards (user_id, name) VALUES ($1, $2) RETURNING *",
    [req.userId, name || "Untitled Board"],
  );
  res.status(201).json(result.rows[0]);
};

exports.deleteBoard = async (req, res) => {
  const result = pool.query(
    "DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId],
  );
  if ((await result).rows.length === 0)
    return res.status(404).json({ error: "Boards not found." });

  res.status(204).send();
};

// helper other controllers can reuse to confirm a board belongs to this user
exports.assertOwnsBoard = async (boardId, userId) => {
  const result = await pool.query(
    "SELECT id FROM boards WHERE id = $1 AND user_id = $2",
    [boardId, userId],
  );
  return result.rows.length > 0;
};
