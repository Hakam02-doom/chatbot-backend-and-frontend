import { cacheService } from './cacheService.js';

class ConversationMemory {
    constructor() {
        this.conversations = new Map(); // Store conversations by session ID
        this.maxConversationLength = 20; // Keep last 20 messages per conversation
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes session timeout
    }

    // Generate or get session ID (for now, we'll use a simple approach)
    getSessionId() {
        // In a real app, this would come from user session/cookies
        // For now, we'll use a default session
        return 'default_session';
    }

    // Add message to conversation history
    addMessage(sessionId, role, content) {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, {
                messages: [],
                lastActivity: Date.now()
            });
        }

        const conversation = this.conversations.get(sessionId);
        conversation.messages.push({ role, content, timestamp: Date.now() });
        conversation.lastActivity = Date.now();

        // Keep only the last maxConversationLength messages
        if (conversation.messages.length > this.maxConversationLength) {
            conversation.messages = conversation.messages.slice(-this.maxConversationLength);
        }

        console.log(`Added ${role} message to conversation ${sessionId}. Total messages: ${conversation.messages.length}`);
    }

    // Get conversation history for context
    getConversationContext(sessionId) {
        if (!this.conversations.has(sessionId)) {
            return [];
        }

        const conversation = this.conversations.get(sessionId);
        
        // Check if session has expired
        if (Date.now() - conversation.lastActivity > this.sessionTimeout) {
            console.log(`Session ${sessionId} expired, clearing conversation`);
            this.conversations.delete(sessionId);
            return [];
        }

        return conversation.messages;
    }

    // Clear conversation for a session
    clearConversation(sessionId) {
        this.conversations.delete(sessionId);
        console.log(`Cleared conversation for session ${sessionId}`);
    }

    // Clear all conversations
    clearAllConversations() {
        this.conversations.clear();
        console.log('Cleared all conversations');
    }

    // Get conversation stats
    getStats() {
        const activeConversations = Array.from(this.conversations.values()).filter(
            conv => Date.now() - conv.lastActivity < this.sessionTimeout
        );

        return {
            totalConversations: this.conversations.size,
            activeConversations: activeConversations.length,
            totalMessages: activeConversations.reduce((sum, conv) => sum + conv.messages.length, 0)
        };
    }

    // Clean up expired conversations
    cleanup() {
        const now = Date.now();
        for (const [sessionId, conversation] of this.conversations.entries()) {
            if (now - conversation.lastActivity > this.sessionTimeout) {
                this.conversations.delete(sessionId);
                console.log(`Cleaned up expired session: ${sessionId}`);
            }
        }
    }
}

// Export singleton instance
export const conversationMemory = new ConversationMemory();

// Clean up expired conversations every 10 minutes
setInterval(() => {
    conversationMemory.cleanup();
}, 10 * 60 * 1000);

export default conversationMemory;
