
const pool = require("../config/db");

async function getMessages(userId) {
    const [messages] = await pool.execute(
        `SELECT
            id,
            userId AS user_id,
            message,
            createdAt AS created_at,
            updatedAt AS updated_at
         FROM message_tbl
         WHERE userId = ?
         ORDER BY createdAt DESC, id DESC`,
        [userId]
    );

    return messages;
}

async function createMessage(userId, message) {
    const [result] = await pool.execute(
        `INSERT INTO message_tbl (userId, message)
         VALUES (?, ?)`,
        [userId, message]
    );

    const [messages] = await pool.execute(
        `SELECT
            id,
            userId AS user_id,
            message,
            createdAt AS created_at,
            updatedAt AS updated_at
         FROM message_tbl
         WHERE id = ? AND userId = ?`,
        [result.insertId, userId]
    );

    return messages[0];
}

async function updateMessage(userId, messageId, message) {
    const [result] = await pool.execute(
        `UPDATE message_tbl
         SET message = ?
         WHERE id = ? AND userId = ?`,
        [message, messageId, userId]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    const [messages] = await pool.execute(
        `SELECT
            id,
            userId AS user_id,
            message,
            createdAt AS created_at,
            updatedAt AS updated_at
         FROM message_tbl
         WHERE id = ? AND userId = ?`,
        [messageId, userId]
    );

    return messages[0] || null;
}

async function deleteMessage(userId, messageId) {
    const [result] = await pool.execute(
        `DELETE FROM message_tbl
         WHERE id = ? AND userId = ?`,
        [messageId, userId]
    );

    return result.affectedRows > 0;
}

module.exports = {
    getMessages,
    createMessage,
    updateMessage,
    deleteMessage
};
