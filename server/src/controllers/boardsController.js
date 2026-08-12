const pool = require("../db.js");

exports.getBoards = async (req, res) => {
  const result = await pool.query(
    `SELECT b.*, 'owner' AS access_level FROM boards b WHERE b.user_id = $1
     UNION
     SELECT b.*, bc.role AS access_level FROM boards b
     JOIN board_collaborators bc ON bc.board_id = b.id
     WHERE bc.user_id = $1
     ORDER BY created_at DESC`,
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
// returns 'owner' | 'editor' | 'viewer' | null
exports.getAccessLevel = async (boardId, userId) => {
  const ownerCheck = await pool.query(
    "SELECT id FROM boards WHERE id = $1 AND user_id = $2",
    [boardId, userId],
  );
  if (ownerCheck.rows.length > 0) return "owner";

  const collabCheck = await pool.query(
    "SELECT role FROM board_collaborators WHERE board_id = $1 AND user_id = $2",
    [boardId, userId],
  );
  if (collabCheck.rows.length > 0) return collabCheck.rows[0].role;

  return null;
};
