import { store } from '../main.js';
import { fetchList } from '../content.js';

export default {
    name: 'Submit',
    data() {
        return {
            store,
            submissionType: 'record',
            levels: [],
            isLoadingLevels: true,
            form: {
                user: '',
                levelPath: '',
                percent: 100,
                hz: 360,
                mobile: false,
                link: '',
                rawFootage: '',
                levelName: '',
                creators: '',
                verifier: ''
            },
            statusMessage: '',
            isSubmitting: false
        };
    },
    async mounted() {
        const listData = await fetchList();
        if (listData) {
            this.levels = listData
                .filter(([level]) => level !== null)
                .map(([level]) => level);
        }
        this.isLoadingLevels = false;
    },
    template: `
        <main class="page-leaderboard-container">
            <div class="page-leaderboard" style="grid-template-columns: 1fr; max-width: 40rem; padding-inline: 1rem;">
                
                <h1 class="type-h1" style="margin-bottom: 2rem;">Submit a Record</h1>
                
                <div class="tabs" style="margin-bottom: 2rem;">
                    <button class="tab" :class="{ selected: submissionType === 'record' }" @click="submissionType = 'record'">Player Record</button>
                    <button class="tab" :class="{ selected: submissionType === 'level' }" @click="submissionType = 'level'">New Level</button>
                </div>

                <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <div v-if="submissionType === 'record'" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        
                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Level Being Completed</label>
                            <select v-model="form.levelPath" class="leaderboard-search" style="width: 100%; cursor: pointer;" required :disabled="isLoadingLevels">
                                <option value="" disabled selected>{{ isLoadingLevels ? 'Loading levels...' : 'Click to select a level' }}</option>
                                <option v-for="lvl in levels" :key="lvl.path" :value="lvl.path">
                                    {{ lvl.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.25rem;">Username</label>
                            <span class="type-label-sm" style="color: var(--color-error); display: block; margin-bottom: 0.5rem;">⚠️ Notice: Usernames are strictly case-sensitive.</span>
                            <input type="text" v-model="form.user" class="leaderboard-search" placeholder="e.g., Player1" required />
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: end;">
                            <div>
                                <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Percentage Completed</label>
                                <input type="number" v-model.number="form.percent" min="1" max="100" class="leaderboard-search" required />
                            </div>
                            <div>
                                <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Refresh Rate / FPS (Hz)</label>
                                <input type="number" v-model.number="form.hz" min="1" max="1000" class="leaderboard-search" required />
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-block: 0.5rem;">
                            <span class="type-title-sm">Mobile Player?</span>
                            <label class="type-body" style="display: flex; align-items: center; gap: 0.5rem; margin: 0; cursor: pointer;">
                                <input type="checkbox" v-model="form.mobile" style="transform: scale(1.2); cursor: pointer;" />
                                {{ form.mobile ? 'Yes' : 'No' }}
                            </label>
                        </div>

                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Completion Video Link (Public Showcase)</label>
                            <input type="text" v-model="form.link" class="leaderboard-search" placeholder="https://www.youtube.com/watch?v=..." required />
                        </div>

                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.25rem;">Unedited Raw Footage Link</label>
                            <span class="type-label-sm" style="opacity: 0.7; display: block; margin-bottom: 0.5rem;">🔒 Hidden field: Only visible to list editors during verification checking.</span>
                            <input type="text" v-model="form.rawFootage" class="leaderboard-search" placeholder="https://youtube.com/watch?... or Google Drive Link" required />
                        </div>
                    </div>

                    <div v-else style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Level Name</label>
                            <input type="text" v-model="form.levelName" class="leaderboard-search" placeholder="e.g., Sonic Wave" required />
                        </div>
                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Creators (Comma separated)</label>
                            <input type="text" v-model="form.creators" class="leaderboard-search" placeholder="e.g., Cyclic, Rustam" required />
                        </div>
                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Verifier Name</label>
                            <input type="text" v-model="form.verifier" class="leaderboard-search" placeholder="e.g., Sunix" required />
                        </div>
                        <div>
                            <label class="type-title-sm" style="display: block; margin-bottom: 0.5rem;">Verification Video Link</label>
                            <input type="text" v-model="form.link" class="leaderboard-search" placeholder="https://www.youtube.com/watch?v=..." required />
                        </div>
                    </div>

                    <div v-if="statusMessage" class="error-container" style="grid-column: span 1;">
                        <p class="error" style="border-radius: 0.5rem;">{{ statusMessage }}</p>
                    </div>

                    <button type="submit" class="btn" :disabled="isSubmitting || (submissionType === 'record' && isLoadingLevels)" style="align-self: flex-start; margin-top: 1rem;">
                        {{ isSubmitting ? 'Processing Submission...' : 'Submit to Editors' }}
                    </button>
                </form>

            </div>
        </main>
    `,
    methods: {
        handleSubmit() {
            this.isSubmitting = true;
            const selectedLevelObj = this.levels.find(l => l.path === this.form.levelPath);
            const levelDisplayTitle = selectedLevelObj ? selectedLevelObj.name : this.form.levelPath;

            const title = this.submissionType === 'record' 
                ? `Record Submission: ${this.form.user} - ${levelDisplayTitle}`
                : `Level Submission Request: ${this.form.levelName}`;
                
            const body = this.submissionType === 'record'
                ? `### Player Record Submission\n\n- **Player**: ${this.form.user} *(Case Sensitive)*\n- **Level Chosen**: ${levelDisplayTitle}\n- **Level File Path Identifier**: \`${this.form.levelPath}.json\`\n- **Percent achieved**: ${this.form.percent}%\n- **Hardware Refresh Metrics**: ${this.form.hz}Hz\n- **Mobile Run**: ${this.form.mobile ? 'Yes' : 'No'}\n- **Completion Video Proof**: ${this.form.link}\n\n#### 🔒 Verification Metadata\n- **Unedited Full Length Link**: ${this.form.rawFootage}`
                : `### New Level Asset Request\n\n- **Requested Level Name**: ${this.form.levelName}\n- **Creators**: ${this.form.creators}\n- **Verifier Profile**: ${this.form.verifier}\n- **Verification Video Link**: ${this.form.link}`;

            const repoUrl = `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues/new`;
            const finalUrl = `${repoUrl}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
            
            window.open(finalUrl, '_blank');
            this.statusMessage = "A GitHub window has opened. Click 'Submit new issue' to finalize your entry submission tracking!";
            this.isSubmitting = false;
        }
    }
};
