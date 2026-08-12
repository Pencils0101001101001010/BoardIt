const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const boards = require("../controllers/boardsController.js");
const items = require("../controllers/itemsController.js");
const upload = require("../middleware/upload");

router.use(requireAuth);

router.get("/", boards.getBoards);
router.post("/", boards.createBoard);
router.post("/:boardId/items/upload", upload.single("image"), items.uploadItem);
router.delete("/:id", boards.deleteBoard);

router.get("/:boardId/items", items.getItems);
router.post("/:boardId/items", items.createItem);

module.exports = router;
