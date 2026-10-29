const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");

const {
    listMessages,
    addMessage,
    editMessage,
    removeMessage
} = require("../controllers/message.controller");

const router = express.Router();

// Every message route requires a valid JWT.
router.use(authenticateToken);

router.get("/", listMessages);
router.post("/", addMessage);
router.put("/:id", editMessage);
router.delete("/:id", removeMessage);

module.exports = router;