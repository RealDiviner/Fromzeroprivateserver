import React, { useState } from 'react';

export default function SubmitRecordForm() {
    const [formData, setFormData] = useState({
        player: '',
        countryCode: 'US', // Default country code selection
        levelChosen: '',
        percent: '100',
        hz: '240',
        isMobile: 'No',
        videoLink: '',
        rawVideoLink: ''
    });

    // A map of ISO standard two-letter country codes
    const countries = [
        { code: 'US', name: '🇺🇸 United States' },
        { code: 'GB', name: '🇬🇧 United Kingdom' },
        { code: 'CA', name: '🇨🇦 Canada' },
        { code: 'AU', name: '🇦🇺 Australia' },
        { code: 'DE', name: '🇩🇪 Germany' },
        { code: 'FR', name: '🇫🇷 France' },
        { code: 'BR', name: '🇧🇷 Brazil' },
        { code: 'KR', name: '🇰🇷 South Korea' },
        { code: 'JP', name: '🇯🇵 Japan' },
        { code: 'RU', name: '🇷🇺 Russia' },
        // Append additional countries into this map array pattern as required
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Enforce capitalization guidelines while replacing spaces with underscores
        // Example: "The Ultimate Phase" -> "The_Ultimate_Phase"
        const formattedLevel = formData.levelChosen
            .trim()
            .replace(/\s+/g, '_');

        // 2. Build the precise body markdown layout text required by the GitHub Actions engine
        const issueBody = `### Player Record Submission

- **Player**: ${formData.player.trim()} *(Case Sensitive)*
- **Country**: ${formData.countryCode}
- **Level Chosen**: ${formattedLevel}
- **Percent achieved**: ${formData.percent}%
- **Hardware Refresh Metrics**: ${formData.hz}Hz
- **Mobile Run**: ${formData.isMobile}
- **Completion Video Proof**: ${formData.videoLink.trim()}

#### 🔒 Verification Metadata
- **Unedited Full Length Link**: ${formData.rawVideoLink.trim() || formData.videoLink.trim()}`;

        // 3. Compile parameters safely for the URI scheme context pipeline
        const repoOwner = "RealDiviner"; // Replace with your exact GitHub Username
        const repoName = "Fromzeroprivateserver";       // Replace with your exact Repository Name
        
        const issueTitle = encodeURIComponent(`Record Submission: ${formData.player.trim()} - ${formattedLevel}`);
        const encodedBody = encodeURIComponent(issueBody);

        // Generates the native template redirection link
        const gitHubUrl = `https://github.com/${repoOwner}/${repoName}/issues/new?title=${issueTitle}&body=${encodedBody}`;

        // Open the pre-filled issue creation ticket page interface context tab seamlessly
        window.open(gitHubUrl, '_blank');
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Submit Level Record Data</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Player Name:</label>
                    <input type="text" name="player" value={formData.player} onChange={handleChange} required placeholder="e.g. Axim" style={{ width: '100%', padding: '8px' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Country:</label>
                    <select name="countryCode" value={formData.countryCode} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Level Chosen:</label>
                    <input type="text" name="levelChosen" value={formData.levelChosen} onChange={handleChange} required placeholder="e.g. The Ultimate Phase" style={{ width: '100%', padding: '8px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Percent Achieved:</label>
                        <input type="number" name="percent" value={formData.percent} onChange={handleChange} required min="1" max="100" style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Refresh Metrics (Hz):</label>
                        <input type="number" name="hz" value={formData.hz} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Mobile Run?</label>
                    <select name="isMobile" value={formData.isMobile} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        <option value="No">No (PC / Console)</option>
                        <option value="Yes">Yes (Mobile Device)</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Completion Video Proof Link:</label>
                    <input type="url" name="videoLink" value={formData.videoLink} onChange={handleChange} required placeholder="https://www.youtube.com/..." style={{ width: '100%', padding: '8px' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Unedited Full Length Video Link (Optional):</label>
                    <input type="url" name="rawVideoLink" value={formData.rawVideoLink} onChange={handleChange} placeholder="Leave blank if identical to proof link" style={{ width: '100%', padding: '8px' }} />
                </div>

                <button type="submit" style={{ padding: '10px', backgroundColor: '#2da44e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Submit to Editors
                </button>
            </form>
        </div>
    );
}
