const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const boards = require("../controllers/boardsController.js");
const items = require("../controllers/itemsController.js");

router.use(requireAuth);

router.get("/", boards.getBoards);
router.post("/", boards.createBoard);
router.delete("/:id", boards.deleteBoard);

router.get("/:boardId/items", items.getItems);
router.post("/:boardId/items", items.createItem);

module.exports = router;
