import crypto from 'crypto';

class UserService {
    constructor() {
        // In-memory storage for demo purposes
        // In production, use a proper database
        this.users = new Map();
        this.sessions = new Map();
        
        // Create a demo user
        this.createDemoUser();
    }

    createDemoUser() {
        const demoUser = {
            id: 'demo-user-1',
            name: 'Demo User',
            email: 'demo@example.com',
            password: this.hashPassword('demo123'),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        this.users.set(demoUser.email, demoUser);
    }

    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async signup(name, email, password) {
        // Check if user already exists
        if (this.users.has(email)) {
            throw new Error('User already exists with this email');
        }

        // Validate input
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (!email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }

        // Create new user
        const userId = crypto.randomUUID();
        const user = {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        this.users.set(user.email, user);

        // Generate token
        const token = this.generateToken();
        this.sessions.set(token, {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString()
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        };
    }

    async login(email, password) {
        const user = this.users.get(email.toLowerCase().trim());
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.users.set(user.email, user);

        // Generate token
        const token = this.generateToken();
        this.sessions.set(token, {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString()
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            token
        };
    }

    async validateToken(token) {
        const session = this.sessions.get(token);
        if (!session) {
            return null;
        }

        const user = this.users.get(session.email);
        if (!user) {
            this.sessions.delete(token);
            return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };
    }

    async logout(token) {
        this.sessions.delete(token);
        return { success: true };
    }

    async getUserStats() {
        return {
            totalUsers: this.users.size,
            activeSessions: this.sessions.size,
            users: Array.from(this.users.values()).map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }))
        };
    }

    // Clean up expired sessions (call this periodically)
    cleanupExpiredSessions() {
        const now = new Date();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [token, session] of this.sessions.entries()) {
            const sessionAge = now - new Date(session.createdAt);
            if (sessionAge > maxAge) {
                this.sessions.delete(token);
            }
        }
    }
}

export const userService = new UserService();

// Clean up expired sessions every hour
setInterval(() => {
    userService.cleanupExpiredSessions();
}, 60 * 60 * 1000);
