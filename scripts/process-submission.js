const fs = require('fs');
const path = require('path');

// Read the event data payload sent from the GitHub action runner environment
const issueBody = process.env.ISSUE_BODY;
if (!issueBody) {
    console.error("No issue body text detected.");
    process.exit(1);
}

// Highly precise extraction helper tailored to your exact issue format
function extractField(fieldName) {
    const escaped = fieldName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`-\\s*\\*\\*${escaped}\\*\\*\\s*:\\s*(.*)`, 'i');
    const match = issueBody.match(regex);
    return match ? match[1].trim() : null;
}

// Parse fields out of your exact markdown schema
let player = extractField("Player");
const levelChosen = extractField("Level Chosen");
const percentStr = extractField("Percent achieved");
const hzStr = extractField("Hardware Refresh Metrics");
const mobileStr = extractField("Mobile Run");
const videoLink = extractField("Completion Video Proof");

// Clean up the "*(Case Sensitive)*" text if it was appended to the username
if (player) {
    player = player.replace(/\s*\*\(\s*Case\s*Sensitive\s*\)\*/i, '').trim();
}

// Convert numbers safely
const percent = percentStr ? parseInt(percentStr.replace(/[^0-9]/g, ''), 10) : NaN;
const hz = hzStr ? parseInt(hzStr.replace(/[^0-9]/g, ''), 10) : 240;
const isMobile = mobileStr && (mobileStr.toLowerCase().includes('yes') || mobileStr.toLowerCase().includes('true'));

console.log("--- Extracted Metadata Debug Logs ---");
console.log(`Player: ${player}`);
console.log(`Level Target: ${levelChosen}`);
console.log(`Percent: ${percent}%`);
console.log(`Hardware: ${hz}Hz`);
console.log(`Mobile: ${isMobile}`);
console.log(`Video Link: ${videoLink}`);
console.log("-------------------------------------");

// Check that vital parameters exist before processing file mutations
if (!player || !levelChosen || isNaN(percent) || !videoLink) {
    console.error("Parsing failed. Crucial record fields are missing or formatted incorrectly in the markdown text block.");
    process.exit(1);
}

// Preserves capitalization, but switches ALL spaces into underscores
// Example: "The Ultimate Phase" becomes "The_Ultimate_Phase"
const cleanFileName = levelChosen.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
const targetFilePath = path.join(__dirname, '../data', `${cleanFileName}.json`);

if (!fs.existsSync(targetFilePath)) {
    console.error(`Target level asset file could not be located at path target: ${targetFilePath}`);
    console.error(`Expected to find a file at: data/${cleanFileName}.json`);
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
    console.log(`Success! Successfully injected record into ${cleanFileName}.json for player ${player}.`);
} catch (err) {
    console.error("JSON payload modification error:", err);
    process.exit(1);
}
