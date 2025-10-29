import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const TOKEN_EXPIRATION = '7d'; // 7 days

class FallbackDatabase {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.chatHistory = new Map();
        this.nextUserId = 1;
        this.nextSessionId = 1;
        this.nextChatId = 1;
        
        // Create demo user
        this.createDemoUser();
    }

    async init() {
        console.log('Using fallback in-memory database');
        return Promise.resolve();
    }

    async createDemoUser() {
        const hashedPassword = await bcrypt.hash('demo123', 10);
        const demoUser = {
            id: 1,
            name: 'Demo User',
            email: 'demo@example.com',
            password_hash: hashedPassword,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        };
        this.users.set(1, demoUser);
        console.log('Demo user created: demo@example.com');
    }

    async createUser(name, email, password) {
        // Check if user already exists
        for (const user of this.users.values()) {
            if (user.email === email) {
                throw new Error('User already exists with this email');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: this.nextUserId++,
            name,
            email,
            password_hash: hashedPassword,
            created_at: new Date().toISOString(),
            last_login: null
        };

        this.users.set(user.id, user);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        };
    }

    async validatePassword(email, password) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                const isValid = await bcrypt.compare(password, user.password_hash);
                return { valid: isValid, user: isValid ? user : null };
            }
        }
        return { valid: false, user: null };
    }

    async createSession(userId) {
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();
        
        const session = {
            id: this.nextSessionId++,
            user_id: userId,
            token,
            expires_at: expiresAt,
            created_at: new Date().toISOString()
        };

        this.sessions.set(token, session);
        return { token, expiresAt };
    }

    async deleteSession(token) {
        this.sessions.delete(token);
    }

    async validateSession(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const session = this.sessions.get(token);
            
            if (!session || new Date(session.expires_at) < new Date()) {
                return null;
            }

            const user = this.users.get(decoded.userId);
            if (!user) {
                return null;
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email
            };
        } catch (error) {
            return null;
        }
    }

    async updateLastLogin(userId) {
        const user = this.users.get(userId);
        if (user) {
            user.last_login = new Date().toISOString();
        }
    }

    async getUserStats() {
        const totalUsers = this.users.size;
        const activeSessions = Array.from(this.sessions.values())
            .filter(session => new Date(session.expires_at) > new Date()).length;
        
        return { totalUsers, activeSessions };
    }

    async saveChatMessage(userId, sessionId, message, isUser) {
        const chatMessage = {
            id: this.nextChatId++,
            user_id: userId,
            session_id: sessionId,
            message,
            is_user: isUser ? 1 : 0,
            created_at: new Date().toISOString()
        };

        if (!this.chatHistory.has(sessionId)) {
            this.chatHistory.set(sessionId, []);
        }
        
        this.chatHistory.get(sessionId).push(chatMessage);
    }

    async getChatHistory(userId, sessionId) {
        const sessionHistory = this.chatHistory.get(sessionId) || [];
        return sessionHistory
            .filter(msg => msg.user_id === userId)
            .map(msg => ({
                message: msg.message,
                is_user: msg.is_user,
                created_at: msg.created_at
            }));
    }
}

export const fallbackDatabase = new FallbackDatabase();
