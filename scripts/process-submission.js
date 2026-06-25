const fs = require('fs');
const path = require('path');

// Read the event data payload sent from the GitHub action runner environment
const issueBody = process.env.ISSUE_BODY;
if (!issueBody) {
    console.error("No issue body text detected.");
    process.exit(1);
}

// Resilient helper function to extract data fields regardless of markdown variations
function extractField(fieldName) {
    // Escapes special characters and looks for the field name dynamically
    const escapedFieldName = fieldName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Flexible regex matching: accommodates missing bullets, spaces, and single/double asterisks
    const regex = new RegExp(`(?:[^\\w\\n]*)${escapedFieldName}[^*:]*\\*?\\*?\\s*:\\s*(.*)`, 'i');
    const match = issueBody.match(regex);
    return match ? match[1].trim() : null;
}

// Parse fields using the robust scanner strings
const player = extractField("Player");
const levelPath = extractField("Level File Path Identifier") || extractField("Level Chosen");
const percentStr = extractField("Percent achieved");
const hzStr = extractField("Hardware Refresh Metrics");
const mobileStr = extractField("Mobile Run");
const videoLink = extractField("Completion Video Proof");

// Convert data formats safely
const percent = percentStr ? parseInt(percentStr.replace(/[^0-9]/g, ''), 10) : NaN;
const hz = hzStr ? parseInt(hzStr.replace(/[^0-9]/g, ''), 10) : 360; // Default fallback to 360Hz if blank
const isMobile = mobileStr && (mobileStr.toLowerCase().includes('yes') || mobileStr.toLowerCase().includes('true'));

console.log("--- Extracted Metadata Debug Logs ---");
console.log(`Player: ${player}`);
console.log(`Level Target: ${levelPath}`);
console.log(`Percent: ${percent}%`);
console.log(`Hardware: ${hz}Hz`);
console.log(`Mobile: ${isMobile}`);
console.log(`Video Link: ${videoLink}`);
console.log("-------------------------------------");

// Check that vital parameters exist before processing file mutations
if (!player || !levelPath || isNaN(percent) || !videoLink) {
    console.error("Parsing failed. Crucial record fields are missing or formatted incorrectly in the markdown text block.");
    process.exit(1);
}

// Clean up any markdown code ticks if passed by the template (e.g., `sonic-wave` -> sonic-wave)
const cleanLevelPath = levelPath.replace(/[`']/g, '').trim();
const targetFilePath = path.join(__dirname, '../data', `${cleanLevelPath}.json`);

if (!fs.existsSync(targetFilePath)) {
    console.error(`Target level asset file could not be located at path target: ${targetFilePath}`);
    process.exit(1);
}

// Read, update, and write the new record to the target level file array string
try {
    const fileData = fs.readFileSync(targetFilePath, 'utf8');
    const levelJson = JSON.parse(fileData);

    if (!levelJson.records) {
        levelJson.records = [];
    }

    const newRecordEntry = {
        user: player,
        percent: percent,
        hz: hz,
        mobile: isMobile,
        link: videoLink
    };

    levelJson.records.push(newRecordEntry);

    fs.writeFileSync(targetFilePath, JSON.stringify(levelJson, null, 4), 'utf8');
    console.log(`Success! Successfully injected record into ${cleanLevelPath}.json for player ${player}.`);
} catch (err) {
    console.error("JSON payload modification error:", err);
    process.exit(1);
}
