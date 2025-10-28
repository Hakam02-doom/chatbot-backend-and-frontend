import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(path.join(__dirname, 'users.db'), (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    is_active BOOLEAN DEFAULT 1,
                    profile_data TEXT
                )
            `;

            const createSessionsTable = `
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `;

            const createChatHistoryTable = `
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_id TEXT NOT NULL,
                    message TEXT NOT NULL,
                    is_user BOOLEAN NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `;

            this.db.serialize(() => {
                this.db.run(createUsersTable);
                this.db.run(createSessionsTable);
                this.db.run(createChatHistoryTable);
                console.log('Database tables created successfully');
                resolve();
            });
        });
    }

    async createUser(name, email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if user already exists
                const existingUser = await this.getUserByEmail(email);
                if (existingUser) {
                    throw new Error('User already exists with this email');
                }

                // Hash password
                const saltRounds = 12;
                const passwordHash = await bcrypt.hash(password, saltRounds);

                const sql = `
                    INSERT INTO users (name, email, password_hash, created_at, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;

                this.db.run(sql, [name, email, passwordHash], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            name,
                            email,
                            createdAt: new Date().toISOString()
                        });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async validatePassword(email, password) {
        try {
            const user = await this.getUserByEmail(email);
            if (!user) {
                return { valid: false, user: null };
            }

            const isValid = await bcrypt.compare(password, user.password_hash);
            return { valid: isValid, user: isValid ? user : null };
        } catch (error) {
            throw error;
        }
    }

    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
            this.db.run(sql, [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async createSession(userId) {
        return new Promise((resolve, reject) => {
            const token = jwt.sign({ userId }, this.jwtSecret, { expiresIn: '7d' });
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            const sql = `
                INSERT INTO user_sessions (user_id, token, expires_at)
                VALUES (?, ?, ?)
            `;

            this.db.run(sql, [userId, token, expiresAt.toISOString()], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ token, sessionId: this.lastID });
                }
            });
        });
    }

    async validateSession(token) {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jwt.verify(token, this.jwtSecret);
                
                const sql = `
                    SELECT u.*, s.expires_at 
                    FROM users u 
                    JOIN user_sessions s ON u.id = s.user_id 
                    WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP
                `;

                this.db.get(sql, [token], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row) {
                        resolve({
                            id: row.id,
                            name: row.name,
                            email: row.email,
                            createdAt: row.created_at,
                            lastLogin: row.last_login
                        });
                    } else {
                        resolve(null);
                    }
                });
            } catch (error) {
                resolve(null);
            }
        });
    }

    async deleteSession(token) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE user_sessions SET is_active = 0 WHERE token = ?';
            this.db.run(sql, [token], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async saveChatMessage(userId, sessionId, message, isUser) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO chat_history (user_id, session_id, message, is_user)
                VALUES (?, ?, ?, ?)
            `;
            this.db.run(sql, [userId, sessionId, message, isUser ? 1 : 0], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async getChatHistory(userId, sessionId, limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT message, is_user, created_at
                FROM chat_history
                WHERE user_id = ? AND session_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            `;
            this.db.all(sql, [userId, sessionId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.reverse()); // Reverse to get chronological order
                }
            });
        });
    }

    async getUserStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN last_login > datetime('now', '-7 days') THEN 1 END) as active_users_7d,
                    COUNT(CASE WHEN last_login > datetime('now', '-30 days') THEN 1 END) as active_users_30d
                FROM users 
                WHERE is_active = 1
            `;
            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
                resolve();
            });
        });
    }
}

export const database = new Database();
