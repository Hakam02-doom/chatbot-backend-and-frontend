import { database } from './database.js';
import { fallbackDatabase } from './database-fallback.js';

class DatabaseWrapper {
    constructor() {
        this.useFallback = false;
        this.primaryDb = database;
        this.fallbackDb = fallbackDatabase;
    }

    async init() {
        try {
            await this.primaryDb.init();
            console.log('Using SQLite database');
        } catch (error) {
            console.error('SQLite failed, using fallback database:', error.message);
            this.useFallback = true;
            await this.fallbackDb.init();
        }
    }

    async createUser(name, email, password) {
        if (this.useFallback) {
            return this.fallbackDb.createUser(name, email, password);
        }

        try {
            return await this.primaryDb.createUser(name, email, password);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.createUser(name, email, password);
        }
    }

    async validatePassword(email, password) {
        if (this.useFallback) {
            return this.fallbackDb.validatePassword(email, password);
        }

        try {
            return await this.primaryDb.validatePassword(email, password);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.validatePassword(email, password);
        }
    }

    async createSession(userId) {
        if (this.useFallback) {
            return this.fallbackDb.createSession(userId);
        }

        try {
            return await this.primaryDb.createSession(userId);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.createSession(userId);
        }
    }

    async deleteSession(token) {
        if (this.useFallback) {
            return this.fallbackDb.deleteSession(token);
        }

        try {
            return await this.primaryDb.deleteSession(token);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.deleteSession(token);
        }
    }

    async validateSession(token) {
        if (this.useFallback) {
            return this.fallbackDb.validateSession(token);
        }

        try {
            return await this.primaryDb.validateSession(token);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.validateSession(token);
        }
    }

    async updateLastLogin(userId) {
        if (this.useFallback) {
            return this.fallbackDb.updateLastLogin(userId);
        }

        try {
            return await this.primaryDb.updateLastLogin(userId);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.updateLastLogin(userId);
        }
    }

    async getUserStats() {
        if (this.useFallback) {
            return this.fallbackDb.getUserStats();
        }

        try {
            return await this.primaryDb.getUserStats();
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.getUserStats();
        }
    }

    async saveChatMessage(userId, sessionId, message, isUser) {
        if (this.useFallback) {
            return this.fallbackDb.saveChatMessage(userId, sessionId, message, isUser);
        }

        try {
            return await this.primaryDb.saveChatMessage(userId, sessionId, message, isUser);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.saveChatMessage(userId, sessionId, message, isUser);
        }
    }

    async getChatHistory(userId, sessionId) {
        if (this.useFallback) {
            return this.fallbackDb.getChatHistory(userId, sessionId);
        }

        try {
            return await this.primaryDb.getChatHistory(userId, sessionId);
        } catch (error) {
            console.error('SQLite error, falling back to in-memory database');
            this.useFallback = true;
            return this.fallbackDb.getChatHistory(userId, sessionId);
        }
    }
}

export const databaseWrapper = new DatabaseWrapper();
