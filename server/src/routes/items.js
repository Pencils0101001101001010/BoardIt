const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const items = require("../controllers/itemsController.js");

router.use(requireAuth);

router.patch("/:id", items.updateItem);
router.delete("/:id", items.deleteItem);

module.exports = router;
