const pool = require("../db.js");
const { getAccessLevel } = require("./boardsController.js");

//GET /api/boards/:boardId/items
exports.getItems = async (req, res) => {
  const { boardId } = req.params;
  const access = await getAccessLevel(boardId, req.userId);
  if (!access) return res.status(404).json({ error: "Board not found" });

  const result = await pool.query(
    "SELECT * FROM items WHERE board_id = $1 ORDER BY created_at",
    [boardId],
  );

  res.json(result.rows);
};

//POST /api/boards/:boardId/items
exports.createItem = async (req, res) => {
  const { boardId } = req.params;
  const access = await getAccessLevel(boardId, req.userId);
  if (!access) return res.status(404).json({ error: "Board not found" });
  if (access === "viewer")
    return res.status(403).json({ error: "Read-only access" });

  const { type, url, title, thumbnail_url, pos_x, pos_y } = req.body;
  const result = await pool.query(
    `INSERT INTO items (board_id, type, url, title, thumbnail_url, pos_x, pos_y)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [boardId, type, url, title, thumbnail_url, pos_x || 100, pos_y || 100],
  );
  res.status(201).json(result.rows[0]);
};

// POST /api/boards/:boardId/items/upload  (multipart/form-data, field name "image")
exports.uploadItem = async (req, res) => {
  const { boardId } = req.params;
  const access = await getAccessLevel(boardId, req.userId);
  if (!access) return res.status(404).json({ error: "Board not found" });
  if (access === "viewer")
    return res.status(403).json({ error: "Read-only access" });

  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const { pos_x, pos_y } = req.body;
  const result = await pool.query(
    `INSERT INTO items (board_id, type, url, title, pos_x, pos_y)
     VALUES ($1, 'image', $2, $3, $4, $5) RETURNING *`,
    [boardId, req.file.path, req.file.originalname, pos_x || 100, pos_y || 100],
  );
  res.status(201).json(result.rows[0]);
};

// PATCH /api/items/:id  (used for dragging / resizing / editing)
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { pos_x, pos_y, width, height, title } = req.body;

  // items don't carry board access info directly, so look up their board first
  const itemLookup = await pool.query(
    "SELECT board_id FROM items WHERE id = $1",
    [id],
  );
  if (itemLookup.rows.length === 0) {
    return res.status(404).json({ error: "Item not found." });
  }
  const { board_id } = itemLookup.rows[0];

  const access = await getAccessLevel(board_id, req.userId);
  if (!access) return res.status(404).json({ error: "Item not found." });
  if (access === "viewer")
    return res.status(403).json({ error: "Read-only access" });

  const result = await pool.query(
    `UPDATE items SET
       pos_x = COALESCE($1, pos_x),
       pos_y = COALESCE($2, pos_y),
       width = COALESCE($3, width),
       height = COALESCE($4, height),
       title = COALESCE($5, title)
     WHERE id = $6
     RETURNING *`,
    [pos_x, pos_y, width, height, title, id],
  );

  res.json(result.rows[0]);
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  const itemLookup = await pool.query(
    "SELECT board_id FROM items WHERE id = $1",
    [id],
  );
  if (itemLookup.rows.length === 0) {
    return res.status(404).json({ error: "Item not found" });
  }
  const { board_id } = itemLookup.rows[0];

  const access = await getAccessLevel(board_id, req.userId);
  if (!access) return res.status(404).json({ error: "Item not found" });
  if (access === "viewer")
    return res.status(403).json({ error: "Read-only access" });

  await pool.query("DELETE FROM items WHERE id = $1", [id]);
  res.status(204).send();
};
