const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function createToken(user) {
    return jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        {
            subject: String(user.id),
            expiresIn: process.env.JWT_EXPIRES_IN || "2h"
        }
    );
}

function safeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

async function signup(req, res, next) {
    try {
        const name =
            typeof req.body?.name === "string"
                ? req.body.name.trim()
                : "";

        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password =
            typeof req.body?.password === "string"
                ? req.body.password
                : "";

        if (name.length < 2 || name.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Name must be 2 to 80 characters."
            });
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            email.length > 190
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8 to 72 characters."
            });
        }

        const [existingUsers] = await pool.execute(
            "SELECT id FROM user_tbl WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            `INSERT INTO user_tbl (name, email, password)
             VALUES (?, ?, ?)`,
            [name, email, hashedPassword]
        );

        const user = {
            id: result.insertId,
            name,
            email
        };

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token: createToken(user),
            user
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        next(error);
    }
}

async function login(req, res, next) {
    try {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password =
            typeof req.body?.password === "string"
                ? req.body.password
                : "";

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const [users] = await pool.execute(
            `SELECT id, name, email, password
             FROM user_tbl
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (
            users.length === 0 ||
            !(await bcrypt.compare(password, users[0].password))
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = safeUser(users[0]);

        return res.json({
            success: true,
            message: "Login successful.",
            token: createToken(user),
            user
        });
    } catch (error) {
        next(error);
    }
}

async function me(req, res, next) {
    try {
        const [users] = await pool.execute(
            `SELECT id, name, email
             FROM user_tbl
             WHERE id = ?
             LIMIT 1`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User account not found."
            });
        }

        return res.json({
            success: true,
            user: safeUser(users[0])
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup,
    login,
    me
};