export default {
    data: () => ({
        player: '',
        countryCode: 'US', // Default country code selection
        levelChosen: '',
        percent: '100',
        hz: '240',
        isMobile: 'No',
        videoLink: '',
        rawVideoLink: ''
    }),
    computed: {
        countries() {
            return [
                { code: 'US', name: '🇺🇸 United States' },
                { code: 'GB', name: '🇬🇧 United Kingdom' },
                { code: 'CA', name: '🇨🇦 Canada' },
                { code: 'AU', name: '🇦🇺 Australia' },
                { code: 'DE', name: '🇩🇪 Germany' },
                { code: 'FR', name: '🇫🇷 France' },
                { code: 'BR', name: '🇧🇷 Brazil' },
                { code: 'KR', name: '🇰🇷 South Korea' },
                { code: 'JP', name: '🇯🇵 Japan' },
                { code: 'RU', name: '🇷🇺 Russia' }
            ];
        }
    },
    template: `
        <div style="max-width: 500px; margin: 20px auto; padding: 20px; font-family: sans-serif;">
            <h2>Submit Level Record Data</h2>
            <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 15px;">
                
                <div>
                    <label style="display: block; margin-bottom: 5px;">Player Name:</label>
                    <input type="text" v-model="player" required placeholder="e.g. Axim" style="width: 100%; padding: 8px;" />
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px;">Country:</label>
                    <select v-model="countryCode" style="width: 100%; padding: 8px;">
                        <option v-for="c in countries" :key="c.code" :value="c.code">
                            {{ c.name }}
                        </option>
                    </select>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px;">Level Chosen:</label>
                    <input type="text" v-model="levelChosen" required placeholder="e.g. The Ultimate Phase" style="width: 100%; padding: 8px;" />
                </div>

                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px;">Percent Achieved:</label>
                        <input type="number" v-model="percent" required min="1" max="100" style="width: 100%; padding: 8px;" />
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px;">Refresh Metrics (Hz):</label>
                        <input type="number" v-model="hz" required style="width: 100%; padding: 8px;" />
                    </div>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px;">Mobile Run?</label>
                    <select v-model="isMobile" style="width: 100%; padding: 8px;">
                        <option value="No">No (PC / Console)</option>
                        <option value="Yes">Yes (Mobile Device)</option>
                    </select>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px;">Completion Video Proof Link:</label>
                    <input type="url" v-model="videoLink" required placeholder="https://www.youtube.com/..." style="width: 100%; padding: 8px;" />
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px;">Unedited Full Length Video Link (Optional):</label>
                    <input type="url" v-model="rawVideoLink" placeholder="Leave blank if identical to proof link" style="width: 100%; padding: 8px;" />
                </div>

                <button type="submit" style="padding: 10px; background-color: #2da44e; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Submit to Editors
                </button>
            </form>
        </div>
    `,
    methods: {
        handleSubmit() {
            // 1. Enforce capitalization guidelines while replacing spaces with underscores
            const formattedLevel = this.levelChosen
                .trim()
                .replace(/\s+/g, '_');

            // 2. Build the precise body markdown layout text required by the GitHub Actions engine
            const issueBody = `### Player Record Submission

- **Player**: ${this.player.trim()} *(Case Sensitive)*
- **Country**: ${this.countryCode}
- **Level Chosen**: ${formattedLevel}
- **Percent achieved**: ${this.percent}%
- **Hardware Refresh Metrics**: ${this.hz}Hz
- **Mobile Run**: ${this.isMobile}
- **Completion Video Proof**: ${this.videoLink.trim()}

#### 🔒 Verification Metadata
- **Unedited Full Length Link**: ${this.rawVideoLink.trim() || this.videoLink.trim()}`;

            // 3. Compile parameters securely for the URI scheme context pipeline
            const repoOwner = "RealDiviner";
            const repoName = "Fromzeroprivateserver";
            
            const issueTitle = encodeURIComponent(`Record Submission: ${this.player.trim()} - ${formattedLevel}`);
            const encodedBody = encodeURIComponent(issueBody);

            // Generates the native template redirection link
            const gitHubUrl = `https://github.com/${repoOwner}/${repoName}/issues/new?title=${issueTitle}&body=${encodedBody}`;

            // Open the pre-filled issue creation ticket page interface context tab seamlessly
            window.open(gitHubUrl, '_blank');
        }
    }
};
