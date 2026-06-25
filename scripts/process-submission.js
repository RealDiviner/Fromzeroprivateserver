const fs = require('fs');
const path = require('path');

const issueBody = process.env.ISSUE_BODY;
if (!issueBody) {
    console.error("No issue body text detected.");
    process.exit(1);
}

// Fallback search function that looks for multiple variations of a keyword
function findValue(keys) {
    for (const key of keys) {
        const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(?:[^\\w\\n]*)${escaped}[^*:]*\\*?\\*?\\s*:\\s*(.*)`, 'i');
        const match = issueBody.match(regex);
        if (match && match[1].trim() && !match[1].includes('LeaveThisUnchanged')) {
            return match[1].trim();
        }
    }
    return null;
}

// Scans for various alternative naming conventions your Submit.js might use
const player = findValue(["Player", "Username", "Name", "User"]);
const levelPath = findValue(["Level File Path Identifier", "Level Chosen", "LevelPath", "Level", "Lvl"]);
const percentStr = findValue(["Percent achieved", "Percent", "Percentage", "Progress"]);
const hzStr = findValue(["Hardware Refresh Metrics", "Refresh Rate", "Hz"]);
const mobileStr = findValue(["Mobile Run", "Mobile", "Device"]);
const videoLink = findValue(["Completion Video Proof", "Video Link", "Video", "Proof", "Link"]);

const percent = percentStr ? parseInt(percentStr.replace(/[^0-9]/g, ''), 10) : NaN;
const hz = hzStr ? parseInt(hzStr.replace(/[^0-9]/g, ''), 10) : 360;
const isMobile = mobileStr && (mobileStr.toLowerCase().includes('yes') || mobileStr.toLowerCase().includes('true'));

console.log("--- Extracted Metadata Debug Logs ---");
console.log(`Player: ${player}`);
console.log(`Level Target: ${levelPath}`);
console.log(`Percent: ${percent}%`);
console.log(`Hardware: ${hz}Hz`);
console.log(`Mobile: ${isMobile}`);
console.log(`Video Link: ${videoLink}`);
console.log("-------------------------------------");

if (!player || !levelPath || isNaN(percent) || !videoLink) {
    console.error("Parsing failed. Crucial record fields are missing or formatted incorrectly in the markdown text block.");
    process.exit(1);
}

const cleanLevelPath = levelPath.replace(/[`']/g, '').trim();
const targetFilePath = path.join(__dirname, '../data', `${cleanLevelPath}.json`);

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

    levelJson.records.push({
        user: player,
        percent: percent,
        hz: hz,
        mobile: isMobile,
        link: videoLink
    });

    fs.writeFileSync(targetFilePath, JSON.stringify(levelJson, null, 4), 'utf8');
    console.log(`Success! Injected record into ${cleanLevelPath}.json for ${player}.`);
} catch (err) {
    console.error("JSON payload modification error:", err);
    process.exit(1);
}
