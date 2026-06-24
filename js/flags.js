/**
 * Convert country code to flag emoji
 * @param {string} countryCode - 2-letter ISO country code (e.g., 'US', 'GB', 'JP')
 * @returns {string} Flag emoji or empty string if invalid
 */
export function getCountryFlag(countryCode) {
    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
        return '';
    }
    
    const code = countryCode.toUpperCase();
    const codePoints = code
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

/**
 * Common country code reference
 * Add country: countryCode pairs as needed in your data
 * Examples:
 * 'US' = United States
 * 'GB' = United Kingdom
 * 'CA' = Canada
 * 'AU' = Australia
 * 'DE' = Germany
 * 'FR' = France
 * 'JP' = Japan
 * 'CN' = China
 * 'IN' = India
 * 'BR' = Brazil
 * 'MX' = Mexico
 * 'KR' = South Korea
 * Full list: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 */
export const countryCodes = {
    // Add your country codes here as needed
};
