// Security utilities for XSS prevention

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text safe for HTML insertion
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escapes HTML attributes to prevent XSS
 * @param {string} attr - The attribute value to escape
 * @returns {string} - Escaped attribute value
 */
function escapeAttribute(attr) {
    if (typeof attr !== 'string') return attr;
    return attr
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Sanitizes user input by removing dangerous patterns
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    // Remove script tags and event handlers
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '');
}

/**
 * Validates phone number format (Peru)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhone(phone) {
    const phoneRegex = /^[9][0-9]{8}$/;
    return phoneRegex.test(phone);
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Rate limiter to prevent abuse
 */
const RateLimiter = {
    requests: {},
    limit: 10, // max requests
    window: 60000, // 1 minute

    check: function (action) {
        const now = Date.now();
        if (!this.requests[action]) {
            this.requests[action] = [];
        }

        // Clean old requests
        this.requests[action] = this.requests[action].filter(t => now - t < this.window);

        if (this.requests[action].length >= this.limit) {
            return false; // Rate limited
        }

        this.requests[action].push(now);
        return true;
    }
};

// Export for use in other scripts
window.securityUtils = {
    escapeHtml,
    escapeAttribute,
    sanitizeInput,
    isValidPhone,
    isValidEmail,
    RateLimiter
};
