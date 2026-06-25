const fs = require('fs');
const path = require('path');

// Read the event data payload sent from the GitHub action runner environment
const issueBody = process.env.ISSUE_BODY;
if (!issueBody) {
    console.error("No issue body text detected.");
    process.exit(1);
}

// Helper function to extract lines matching our specific markdown parameters
function extractField(regex) {
    const match = issueBody.match(regex);
    return match ? match[1].trim() : null;
}

// Parse fields out of the issue text body using Regular Expressions
const player = extractField(/-\s\*\*Player\*\*:\s*(.*)/i);
const levelPath = extractField(/-\s\*\*Level File Path Identifier\*\*:\s*`?(.*?)`?(\s|$)/i);
const percent = parseInt(extractField(/-\s\*\*Percent achieved\*\*:\s*(\d+)%/i), 10);
const hz = parseInt(extractField(/-\s\*\*Hardware Refresh Metrics\*\*:\s*(\d+)Hz/i), 10);
const mobileStr = extractField(/-\s\*\*Mobile Run\*\*:\s*(.*)/i);
const videoLink = extractField(/-\s\*\*Completion Video Proof\*\*:\s*(.*)/i);

const isMobile = mobileStr && mobileStr.toLowerCase().includes('yes');

// Check that vital parameters exist before processing file mutations
if (!player || !levelPath || isNaN(percent) || !videoLink) {
    console.error("Parsing failed. Crucial record fields are missing from the submission markdown text block.");
    process.exit(1);
}

// Define the exact relative path location to your levels data directory
const targetFilePath = path.join(__dirname, '../data', `${levelPath}.json`);

if (!fs.existsSync(targetFilePath)) {
    console.error(`Target level asset file could not be located at path target: ${targetFilePath}`);
    process.exit(1);
}

// Read, update, and write the new record to the target level file array string
try {
    const fileData = fs.readFileSync(targetFilePath, 'utf8');
    const levelJson = JSON.parse(fileData);

    // Ensure the internal records array structure initialization exists
    if (!levelJson.records) {
        levelJson.records = [];
    }

    // Build the new record entry item structure matching your schema rules
    const newRecordEntry = {
        user: player,
        percent: percent,
        hz: hz,
        mobile: isMobile,
        link: videoLink
    };

    // Push entry into array block
    levelJson.records.push(newRecordEntry);

    // Save formatted JSON back down to disk storage
    fs.writeFileSync(targetFilePath, JSON.stringify(levelJson, null, 4), 'utf8');
    console.log(`Success! Successfully injected record into ${levelPath}.json for player ${player}.`);
} catch (err) {
    console.error("JSON payload modification error:", err);
    process.exit(1);
}
