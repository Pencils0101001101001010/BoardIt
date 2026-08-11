const pool = require("../db.js");
const { assertOwnsBoard } = require("./boardsController.js");

//GET /api/boards/:boardId/items
exports.getItems = async (req, res) => {
  const { boardId } = req.params;
  if (!(await assertOwnsBoard(boardId, req.userId))) {
    return res.status(404).json({ error: "Board not found." });
  }

  const result = await pool.query(
    "SELECT * FROM items WHERE board_id = $1 ORDER BY created_at",
    [boardId],
  );

  res.json(result.rows);
};

//POST /api/boards/:boardId/items
exports.createItem = async (req, res) => {
  const { boardId } = req.params;

  if (!(await assertOwnsBoard(boardId, req.userId))) {
    return res.status(404).json({ error: "Board not found." });
  }

  const { type, url, title, thumbnail_url, pos_x, pos_y } = req.body;
  const result = await pool.query(
    `INSERT INTO items (board_id, type, url, title, thumbnail_url, pos_x, pos_y)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [boardId, type, url, title, thumbnail_url, pos_x || 100, pos_y || 100],
  );
  res.status(201).json(result.rows[0]);
};

// PATCH /api/items/:id  (used for dragging / resizing / editing)

exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { pos_x, pos_y, width, height, title } = req.body;

  const result = await pool.query(
    `UPDATE items SET
       pos_x = COALESCE($1, pos_x),
       pos_y = COALESCE($2, pos_y),
       width = COALESCE($3, width),
       height = COALESCE($4, height),
       title = COALESCE($5, title)
     WHERE id = $6
       AND board_id IN (SELECT id FROM boards WHERE user_id = $7)
     RETURNING *`,
    [pos_x, pos_y, width, height, title, id, req.userId],
  );

  if (result.rows.length === 0)
    return res.status(404).json({ error: "Item not found." });

  res.json(result.rows[0]);
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  const result = await pool.query(
    `DELETE FROM items WHERE id = $1
       AND board_id IN (SELECT id FROM boards WHERE user_id = $2)
     RETURNING id`,
    [req.params.id, req.userId],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Item not found" });
  res.status(204).send({ message: "Item deleted" });
};
