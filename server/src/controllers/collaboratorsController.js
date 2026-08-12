const pool = require("../db");
const { getAccessLevel } = require("./boardsController");

// POST /api/boards/:boardId/share  { email, role }
exports.addCollaborator = async (req, res) => {
  const { boardId } = req.params;
  const { email, role } = req.body;

  const access = await getAccessLevel(boardId, req.userId);
  if (access !== "owner")
    return res
      .status(403)
      .json({ error: "Only the owner can share this board" });

  const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: "No user found with that email" });
  }
  const targetUserId = userResult.rows[0].id;

  const result = await pool.query(
    `INSERT INTO board_collaborators (board_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (board_id, user_id) DO UPDATE SET role = $3
     RETURNING *`,
    [boardId, targetUserId, role || "editor"],
  );
  res.status(201).json(result.rows[0]);
};

// GET /api/boards/:boardId/collaborators
exports.getCollaborators = async (req, res) => {
  const { boardId } = req.params;
  const access = await getAccessLevel(boardId, req.userId);
  if (!access) return res.status(404).json({ error: "Board not found" });

  const result = await pool.query(
    `SELECT bc.id, bc.user_id, bc.role, u.email FROM board_collaborators bc
     JOIN users u ON u.id = bc.user_id
     WHERE bc.board_id = $1`,
    [boardId],
  );
  res.json(result.rows);
};

// DELETE /api/boards/:boardId/collaborators/:userId
exports.removeCollaborator = async (req, res) => {
  const { boardId, userId } = req.params;
  const access = await getAccessLevel(boardId, req.userId);
  if (access !== "owner")
    return res
      .status(403)
      .json({ error: "Only the owner can remove collaborators" });

  await pool.query(
    "DELETE FROM board_collaborators WHERE board_id = $1 AND user_id = $2",
    [boardId, userId],
  );
  res.status(204).send();
};
