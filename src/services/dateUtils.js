/**
 * dateUtils.js
 * 
 * Centralized timestamp utility for the Boutique Manager application.
 * 
 * CONTRACT:
 * - All timestamps stored in state and passed between layers use NUMERIC EPOCH (milliseconds).
 * - This is compatible with Firestore's Timestamp.fromMillis() / .toMillis().
 * - UI components receive numeric timestamps and use formatters from this module to display.
 * - Date strings (e.g. 'YYYY-MM-DD') from user input are converted to epoch at the service boundary.
 * - Null timestamps remain null (e.g. for pending stages with no start/end date).
 */

/**
 * Returns the current timestamp as numeric epoch in milliseconds.
 * This is the ONLY way new timestamps should be created in the app.
 * @returns {number} Current time in ms since Unix epoch
 */
export const now = () => Date.now();

/**
 * Converts any supported date value to numeric epoch (ms).
 * Handles: number (passthrough), ISO string, YYYY-MM-DD string, Date object, null/undefined.
 * @param {number|string|Date|null|undefined} value - The date value to normalize
 * @returns {number|null} Epoch ms or null if input is null/undefined/empty
 */
export const toEpoch = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') {
        // Handle 'YYYY-MM-DD' (append T00:00:00 to avoid timezone ambiguity)
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(value + 'T00:00:00').getTime();
        }
        // Handle full ISO string
        const parsed = new Date(value).getTime();
        if (!isNaN(parsed)) return parsed;
    }
    return null;
};

/**
 * Formats a numeric epoch timestamp to a display-friendly date string.
 * @param {number|null} epoch - Epoch ms
 * @param {string} format - One of 'date' (YYYY-MM-DD), 'short' (DD MMM YYYY), 'full' (DD MMM YYYY, HH:mm)
 * @returns {string} Formatted date string or '' if epoch is null
 */
export const formatDate = (epoch, format = 'short') => {
    if (epoch === null || epoch === undefined) return '';
    const d = new Date(epoch);
    if (isNaN(d.getTime())) return '';

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = (n) => n.toString().padStart(2, '0');

    switch (format) {
        case 'date':
            // YYYY-MM-DD (for form inputs and exports)
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        case 'short':
            // DD MMM YYYY
            return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        case 'full':
            // DD MMM YYYY, HH:mm
            return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        default:
            return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
};


/**
 * Normalizes an entire object's date fields from any format to epoch ms.
 * Only processes keys listed in `dateFields`.
 * @param {Object} obj - The object containing date fields
 * @param {string[]} dateFields - Array of key names to normalize
 * @returns {Object} New object with date fields converted to epoch
 */
export const normalizeDates = (obj, dateFields) => {
    if (!obj) return obj;
    const result = { ...obj };
    dateFields.forEach((field) => {
        if (field in result) {
            result[field] = toEpoch(result[field]);
        }
    });
    return result;
};

/**
 * Converts a Firestore Timestamp to epoch ms.
 * Future-proofing for Firebase integration.
 * @param {Object} firestoreTimestamp - Firestore Timestamp with .toMillis() or {seconds, nanoseconds}
 * @returns {number|null} Epoch ms or null
 */
export const fromFirestoreTimestamp = (firestoreTimestamp) => {
    if (!firestoreTimestamp) return null;
    if (typeof firestoreTimestamp.toMillis === 'function') {
        return firestoreTimestamp.toMillis();
    }
    if (firestoreTimestamp.seconds != null) {
        return firestoreTimestamp.seconds * 1000 + Math.floor((firestoreTimestamp.nanoseconds || 0) / 1000000);
    }
    return toEpoch(firestoreTimestamp);
};

/**
 * Converts epoch ms to a plain object compatible with Firestore Timestamp constructor.
 * Future-proofing for Firebase integration.
 * @param {number|null} epoch - Epoch ms
 * @returns {Object|null} { seconds, nanoseconds } or null
 */
export const toFirestoreTimestamp = (epoch) => {
    if (epoch === null || epoch === undefined) return null;
    return {
        seconds: Math.floor(epoch / 1000),
        nanoseconds: (epoch % 1000) * 1000000,
    };
};
