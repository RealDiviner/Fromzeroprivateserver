const fs = require('fs');
const path = require('path');

const issueBody = process.env.ISSUE_BODY;
if (!issueBody) {
    console.error("No issue body text detected.");
    process.exit(1);
}

function extractField(fieldName) {
    const escaped = fieldName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`-\\s*\\*\\*${escaped}\\*\\*\\s*:\\s*(.*)`, 'i');
    const match = issueBody.match(regex);
    return match ? match[1].trim() : null;
}

let player = extractField("Player");
const countryStr = extractField("Country"); // New field parser
const levelChosen = extractField("Level Chosen");
const percentStr = extractField("Percent achieved");
const hzStr = extractField("Hardware Refresh Metrics");
const mobileStr = extractField("Mobile Run");
const videoLink = extractField("Completion Video Proof");

if (player) {
    player = player.replace(/\s*\*\(\s*Case\s*Sensitive\s*\)\*/i, '').trim();
}

// Clean up country code to be just the 2-letter uppercase ISO variant (e.g., "US")
// Strips away any emojis passed by the form text automatically
let country = countryStr ? countryStr.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() : "UN"; 

const percent = percentStr ? parseInt(percentStr.replace(/[^0-9]/g, ''), 10) : NaN;
const hz = hzStr ? parseInt(hzStr.replace(/[^0-9]/g, ''), 10) : 240;
const isMobile = mobileStr && (mobileStr.toLowerCase().includes('yes') || mobileStr.toLowerCase().includes('true'));

console.log("--- Extracted Metadata Debug Logs ---");
console.log(`Player: ${player}`);
console.log(`Country: ${country}`);
console.log(`Level Target: ${levelChosen}`);
console.log(`Percent: ${percent}%`);
console.log(`Hardware: ${hz}Hz`);
console.log(`Mobile: ${isMobile}`);
console.log(`Video Link: ${videoLink}`);
console.log("-------------------------------------");

if (!player || !levelChosen || isNaN(percent) || !videoLink) {
    console.error("Parsing failed. Crucial fields are missing or formatted incorrectly.");
    process.exit(1);
}

const cleanFileName = levelChosen.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
const targetFilePath = path.join(__dirname, '../data', `${cleanFileName}.json`);

if (!fs.existsSync(targetFilePath)) {
    console.error(`Target level asset file could not be located at path target: ${targetFilePath}`);
    process.exit(1);
}

try {
    const fileData = fs.readFileSync(targetFilePath, 'utf8');
    const levelJson = JSON.parse(fileData);

    if (!levelJson.records) {
        levelJson.records = [];
    }

    // Injects the country code directly into the record schema object
    const newRecordEntry = {
        user: player,
        country: country, // Stored safely as "US", "GB", etc.
        percent: percent,
        hz: hz,
        mobile: isMobile,
        link: videoLink
    };

    levelJson.records.push(newRecordEntry);

    fs.writeFileSync(targetFilePath, JSON.stringify(levelJson, null, 4), 'utf8');
    console.log(`Success! Injected record with country ${country} into ${cleanFileName}.json.`);
} catch (err) {
    console.error("JSON payload modification error:", err);
    process.exit(1);
} // <--- Added missing closing brace here to fix the script crash
