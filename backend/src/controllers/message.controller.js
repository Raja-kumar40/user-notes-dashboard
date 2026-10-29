const messageService = require("../services/message.service");

function parseId(value) {
    const id = Number(value);

    return Number.isSafeInteger(id) && id > 0
        ? id
        : null;
}

function validateMessage(value) {
    if (typeof value !== "string") {
        return null;
    }

    const message = value.trim();

    if (message.length < 1 || message.length > 500) {
        return null;
    }

    return message;
}

async function listMessages(req, res, next) {
    try {
        const messages = await messageService.getMessages(
            req.user.id
        );

        return res.json({
            success: true,
            messages
        });
    } catch (error) {
        next(error);
    }
}

async function addMessage(req, res, next) {
    try {
        const message = validateMessage(req.body?.message);

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message must be 1 to 500 characters."
            });
        }

        const createdMessage =
            await messageService.createMessage(
                req.user.id,
                message
            );

        return res.status(201).json({
            success: true,
            message: createdMessage
        });
    } catch (error) {
        next(error);
    }
}

async function editMessage(req, res, next) {
    try {
        const messageId = parseId(req.params.id);

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID."
            });
        }

        const message = validateMessage(req.body?.message);

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message must be 1 to 500 characters."
            });
        }

        const updatedMessage =
            await messageService.updateMessage(
                req.user.id,
                messageId,
                message
            );

        if (!updatedMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        return res.json({
            success: true,
            message: updatedMessage
        });
    } catch (error) {
        next(error);
    }
}

async function removeMessage(req, res, next) {
    try {
        const messageId = parseId(req.params.id);

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID."
            });
        }

        const deleted = await messageService.deleteMessage(
            req.user.id,
            messageId
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        return res.json({
            success: true,
            message: "Message deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listMessages,
    addMessage,
    editMessage,
    removeMessage
};