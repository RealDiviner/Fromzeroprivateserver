import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import { getCountryFlag } from '/js/flags.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        historicalLeaderboard: [],
        groups: [],
        loading: true,
        historicalLoading: false,
        currentTab: 'players', // Tracks state: 'players', 'groups', or 'timemachine'
        selected: 0,           // Selected index for individual players
        selectedGroup: 0,      // Selected index for group tab
        selectedHistorical: 0, // Selected index for time machine tab
        timeMachineDate: new Date().toISOString().split('T')[0], // Default to today (YYYY-MM-DD)
        historicalError: '',
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            
            <div class="leaderboard-tabs" style="display: flex; justify-content: center; gap: 15px; margin: 10px 0 20px 0;">
                <button @click="switchTab('players')" :style="tabStyle(currentTab === 'players')">👥 Individual Players</button>
                <button @click="switchTab('groups')" :style="tabStyle(currentTab === 'groups')">🏢 Team Groups</button>
                <button @click="switchTab('timemachine')" :style="tabStyle(currentTab === 'timemachine')">⏳ Time Machine</button>
            </div>

            <!-- Time Machine Controls -->
            <div v-if="currentTab === 'timemachine'" class="time-machine-controls">
                <label for="tm-date-picker">Select Date in History:</label>
                <input 
                    type="date" 
                    id="tm-date-picker" 
                    v-model="timeMachineDate" 
                    :max="new Date().toISOString().split('T')[0]"
                    @change="onDateChange"
                />
            </div>

            <div class="page-leaderboard">
                <div class="leaderboard-search-wrap">
                    <input
                        id="leaderboard-search"
                        class="leaderboard-search"
                        type="search"
                        :placeholder="currentTab === 'groups' ? 'Search groups...' : 'Search users...'"
                        aria-label="Search leaderboard"
                        @input="onSearch"
                    />
                </div>

                <div class="error-container">
                    <p class="error" v-if="err.length > 0 && currentTab !== 'timemachine'">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                    <p class="error" v-if="historicalError && currentTab === 'timemachine'">
                        {{ historicalError }}
                    </p>
                </div>

                <div class="board-container">
                    <!-- Standard Players Tab -->
                    <table v-if="currentTab === 'players'" class="board">
                        <tr v-for="(ientry, i) in leaderboard" :key="'player-'+ientry.user">
                            <td class="flag">
                                <p class="type-label-lg">{{ getCountryFlag(ientry.country || 'US') }}</p>
                            </td>
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                        </tr>
                    </table>

                    <!-- Groups Tab -->
                    <table v-else-if="currentTab === 'groups'" class="board">
                        <tr v-for="(gentry, i) in processedGroups" :key="'group-'+gentry.name">
                            <td class="flag">
                                <p class="type-label-lg">🛡️</p>
                            </td>
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selectedGroup == i }">
                                <button @click="selectedGroup = i">
                                    <span class="type-label-lg">{{ gentry.name }}</span>
                                </button>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(gentry.totalPoints) }}</p>
                            </td>
                        </tr>
                    </table>

                    <!-- Time Machine Tab -->
                    <div v-else-if="currentTab === 'timemachine' && historicalLoading" style="text-align: center; padding: 2rem;">
                        <Spinner></Spinner>
                        <p style="margin-top: 10px;">Time traveling to {{ timeMachineDate }}...</p>
                    </div>

                    <table v-else-if="currentTab === 'timemachine'" class="board">
                        <tr v-for="(hentry, i) in historicalLeaderboard" :key="'hist-'+hentry.user">
                            <td class="flag">
                                <p class="type-label-lg">{{ getCountryFlag(hentry.country || 'US') }}</p>
                            </td>
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selectedHistorical == i }">
                                <button @click="selectedHistorical = i">
                                    <span class="type-label-lg">{{ hentry.user }}</span>
                                </button>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(hentry.total) }}</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="player-container">
                    <!-- Standard Player Profile -->
                    <div v-if="currentTab === 'players' && entry" class="player-profile-card">
                        <div class="profile-header">
                            <span class="profile-flag">{{ getCountryFlag(entry.country) }}</span>
                            <h1 class="profile-username">{{ entry.user }}</h1>
                        </div>
                        <div class="profile-stats-grid">
                            <div class="stat-card">
                                <span class="stat-label">Demonlist rank</span>
                                <span class="stat-value">#{{ selected + 1 }}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">Demonlist score</span>
                                <span class="stat-value">{{ localize(entry.total) }}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">Demonlist stats</span>
                                <span class="stat-value">{{ entry.statsSummary }}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">Hardest demon</span>
                                <span class="stat-value">{{ entry.hardest }}</span>
                            </div>
                        </div>
                        <div class="profile-records-section">
                            <div class="record-list-block" v-if="entry.completed && entry.completed.length > 0">
                                <h3>Demons completed</h3>
                                <p class="inline-records-list">
                                    <span v-for="(score, idx) in entry.completed" :key="idx" class="record-item">
                                        <a :href="score.link" target="_blank" :class="{ 'main-list': score.rank <= 75 }">{{ score.level }}</a>
                                        <span v-if="idx < entry.completed.length - 1" class="list-separator"> - </span>
                                    </span>
                                </p>
                            </div>
                            <div class="record-list-block" v-if="entry.verified && entry.verified.length > 0">
                                <h3>Demons verified</h3>
                                <p class="inline-records-list">
                                    <span v-for="(score, idx) in entry.verified" :key="idx" class="record-item">
                                        <a :href="score.link" target="_blank" :class="{ 'main-list': score.rank <= 75 }">{{ score.level }}</a>
                                        <span v-if="idx < entry.verified.length - 1" class="list-separator"> - </span>
                                    </span>
                                </p>
                            </div>
                            <div class="record-list-block" v-if="entry.progressed && entry.progressed.length > 0">
                                <h3>Progress on</h3>
                                <p class="inline-records-list">
                                    <span v-for="(score, idx) in entry.progressed" :key="idx" class="record-item">
                                        <a :href="score.link" target="_blank">{{ score.level }} ({{ score.percent }}%)</a>
                                        <span v-if="idx < entry.progressed.length - 1" class="list-separator"> - </span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Time Machine Historical Profile View -->
                    <div v-else-if="currentTab === 'timemachine' && historicalEntry" class="player-profile-card">
                        <div class="profile-header">
                            <span class="profile-flag">{{ getCountryFlag(historicalEntry.country) }}</span>
                            <h1 class="profile-username">{{ historicalEntry.user }}</h1>
                            <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">Snapshot Date: {{ timeMachineDate }}</p>
                        </div>
                        <div class="profile-stats-grid">
                            <div class="stat-card">
                                <span class="stat-label">Historical rank</span>
                                <span class="stat-value">#{{ selectedHistorical + 1 }}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">Historical score</span>
                                <span class="stat-value">{{ localize(historicalEntry.total) }}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">Demonlist stats</span>
                                <span class="stat-value">{{ historicalEntry.statsSummary }}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">Hardest demon</span>
                                <span class="stat-value">{{ historicalEntry.hardest }}</span>
                            </div>
                        </div>
                        <div class="profile-records-section">
                            <div class="record-list-block" v-if="historicalEntry.completed && historicalEntry.completed.length > 0">
                                <h3>Demons completed</h3>
                                <p class="inline-records-list">
                                    <span v-for="(score, idx) in historicalEntry.completed" :key="idx" class="record-item">
                                        <a :href="score.link" target="_blank" :class="{ 'main-list': score.rank <= 75 }">{{ score.level }}</a>
                                        <span v-if="idx < historicalEntry.completed.length - 1" class="list-separator"> - </span>
                                    </span>
                                </p>
                            </div>
                            <div class="record-list-block" v-if="historicalEntry.verified && historicalEntry.verified.length > 0">
                                <h3>Demons verified</h3>
                                <p class="inline-records-list">
                                    <span v-for="(score, idx) in historicalEntry.verified" :key="idx" class="record-item">
                                        <a :href="score.link" target="_blank" :class="{ 'main-list': score.rank <= 75 }">{{ score.level }}</a>
                                        <span v-if="idx < historicalEntry.verified.length - 1" class="list-separator"> - </span>
                                    </span>
                                </p>
                            </div>
                            <div class="record-list-block" v-if="historicalEntry.progressed && historicalEntry.progressed.length > 0">
                                <h3>Progress on</h3>
                                <p class="inline-records-list">
                                    <span v-for="(score, idx) in historicalEntry.progressed" :key="idx" class="record-item">
                                        <a :href="score.link" target="_blank">{{ score.level }} ({{ score.percent }}%)</a>
                                        <span v-if="idx < historicalEntry.progressed.length - 1" class="list-separator"> - </span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Group Profile View -->
                    <div v-else-if="currentTab === 'groups'" class="player">
                        <h1>🛡️ {{ groupEntry.name }}</h1>
                        <h3>Combined Points: {{ localize(groupEntry.totalPoints) }}</h3>
                        <h2>Group Roster Members</h2>
                        <table class="table" style="margin-bottom: 25px;">
                            <tr v-for="member in groupEntry.roster" :key="member.name">
                                <td style="width: 40px; text-align: center;">{{ getCountryFlag(member.country) }}</td>
                                <td>
                                    <button @click="jumpToPlayerProfile(member.name)" style="background: none; border: none; color: #4ba2ff; text-align: left; cursor: pointer; font-size: 16px; font-weight: bold; padding: 0;">
                                        {{ member.name }}
                                    </button>
                                </td>
                                <td style="text-align: right;"><p style="margin:0;">+{{ localize(member.score) }} pts</p></td>
                            </tr>
                        </table>
                        <h2>Group Level Multipliers</h2>
                        <table class="table" v-if="groupEntry.completions && groupEntry.completions.length > 0">
                            <tr v-for="lvl in groupEntry.completions" :key="lvl.name">
                                <td><p class="type-label-lg" style="margin:0;">{{ lvl.name }}</p></td>
                                <td style="text-align: right;">
                                    <span style="background: #2da44e; color: white; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 13px;">
                                        x{{ lvl.count }}
                                    </span>
                                </td>
                            </tr>
                        </table>
                        <p v-else style="font-style: italic; color: #888;">No overlapping shared group level records verified yet.</p>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.buildProfileData(this.leaderboard[this.selected]);
        },
        historicalEntry() {
            return this.buildProfileData(this.historicalLeaderboard[this.selectedHistorical]);
        },
        processedGroups() {
            return this.groups.map(group => {
                let totalPoints = 0;
                const roster = [];
                const levelCounts = {};

                group.members.forEach(mName => {
                    const match = this.leaderboard.find(p => p.user.trim().toLowerCase() === mName.trim().toLowerCase());
                    if (match) {
                        totalPoints += match.total;
                        roster.push({
                            name: match.user,
                            score: match.total,
                            country: match.country && match.country !== 'UN' ? match.country : 'US'
                        });

                        if (match.completed) {
                            match.completed.forEach(c => {
                                levelCounts[c.level] = (levelCounts[c.level] || 0) + 1;
                            });
                        }
                        if (match.verified) {
                            match.verified.forEach(v => {
                                levelCounts[v.level] = (levelCounts[v.level] || 0) + 1;
                            });
                        }
                    } else {
                        roster.push({ name: mName, score: 0, country: 'US' });
                    }
                });

                const completions = Object.keys(levelCounts)
                    .map(name => ({ name, count: levelCounts[name] }))
                    .filter(item => item.count >= 1)
                    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

                return {
                    name: group.name,
                    totalPoints,
                    roster,
                    completions
                };
            }).sort((a, b) => b.totalPoints - a.totalPoints);
        },
        groupEntry() {
            const currentGroup = this.processedGroups[this.selectedGroup];
            if (!currentGroup) {
                return { name: '', totalPoints: 0, roster: [], completions: [] };
            }
            return currentGroup;
        }
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;

        try {
            const response = await fetch('/data/_groups.json');
            if (response.ok) {
                const data = await response.json();
                this.groups = data.groups || [];
            }
        } catch (e) {
            console.error("Group asset configurations failed to parse:", e);
        }

        this.loading = false;
    },
    methods: {
        localize,
        getCountryFlag,
        buildProfileData(selectedPlayer) {
            if (!selectedPlayer) {
                return { 
                    user: '', 
                    total: 0, 
                    country: 'US', 
                    verified: [], 
                    completed: [], 
                    progressed: [],
                    hardest: 'None',
                    statsSummary: '0 Main, 0 Extended, 0 Legacy'
                };
            }

            const completed = selectedPlayer.completed || [];
            const verified = selectedPlayer.verified || [];

            const allPassedRecords = [...completed, ...verified];
            const sortedRecords = allPassedRecords.sort((a, b) => a.rank - b.rank);
            const hardest = sortedRecords.length > 0 ? sortedRecords[0].level : 'None';

            const uniqueRecordsMap = new Map();
            allPassedRecords.forEach(record => {
                if (!uniqueRecordsMap.has(record.level) || record.rank < uniqueRecordsMap.get(record.level).rank) {
                    uniqueRecordsMap.set(record.level, record);
                }
            });

            let mainCount = 0;
            let extendedCount = 0;
            let legacyCount = 0;

            uniqueRecordsMap.forEach(record => {
                if (record.rank <= 75) {
                    mainCount++;
                } else if (record.rank <= 150) {
                    extendedCount++;
                } else {
                    legacyCount++;
                }
            });
            const statsSummary = `${mainCount} Main, ${extendedCount} Extended, ${legacyCount} Legacy`;

            return {
                ...selectedPlayer,
                country: selectedPlayer.country && selectedPlayer.country !== 'UN' ? selectedPlayer.country : 'US',
                hardest,
                statsSummary
            };
        },
        switchTab(tabName) {
            this.currentTab = tabName;
            const searchInput = document.getElementById('leaderboard-search');
            if (searchInput) searchInput.value = '';

            if (tabName === 'timemachine' && this.historicalLeaderboard.length === 0) {
                this.fetchHistoricalData(this.timeMachineDate);
            } else {
                this.resetSearchFilterVisibility();
            }
        },
        tabStyle(isActive) {
            return {
                padding: '10px 20px',
                cursor: 'pointer',
                border: 'none',
                background: isActive ? '#2da44e' : '#333',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '6px',
                transition: 'background 0.2s ease'
            };
        },
        onDateChange() {
            if (this.currentTab === 'timemachine') {
                this.fetchHistoricalData(this.timeMachineDate);
            }
        },
        async fetchHistoricalData(dateStr) {
            this.historicalLoading = true;
            this.historicalError = '';
            this.selectedHistorical = 0;

            // GitHub repository parameters
            const repoOwner = 'YOUR_GITHUB_USERNAME'; // REPLACE WITH YOUR GITHUB USERNAME
            const repoName = 'YOUR_REPO_NAME';       // REPLACE WITH YOUR REPO NAME
            const targetFilePath = 'data/_list.json';  // Path to list data file in repository

            try {
                // Query GitHub Commits API for commits prior to or on selected date
                const targetIsoDate = new Date(`${dateStr}T23:59:59Z`).toISOString();
                const commitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?until=${targetIsoDate}&path=${targetFilePath}&per_page=1`;

                const commitRes = await fetch(commitUrl);
                if (!commitRes.ok) {
                    throw new Error('Could not fetch historical commit history from GitHub.');
                }

                const commits = await commitRes.json();

                if (!commits || commits.length === 0) {
                    this.historicalLeaderboard = [];
                    this.historicalError = `No list history found on or before ${dateStr}.`;
                    this.historicalLoading = false;
                    return;
                }

                // Get commit hash
                const commitSha = commits[0].sha;

                // Fetch raw JSON content at that historical commit
                const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/${targetFilePath}`;
                const fileRes = await fetch(rawUrl);

                if (!fileRes.ok) {
                    throw new Error('Failed to fetch historical list data at the given commit.');
                }

                const rawData = await fileRes.json();

                // Process list data into leaderboard structure
                if (typeof fetchLeaderboard === 'function') {
                    // Re-use logic or format dataset directly
                    const [historicalData] = await fetchLeaderboard(rawData);
                    this.historicalLeaderboard = historicalData || [];
                } else {
                    this.historicalLeaderboard = rawData || [];
                }

            } catch (err) {
                console.error("Time Machine fetch error:", err);
                this.historicalError = err.message || 'Failed to load historical data.';
                this.historicalLeaderboard = [];
            } finally {
                this.historicalLoading = false;
                this.resetSearchFilterVisibility();
            }
        },
        jumpToPlayerProfile(playerName) {
            const index = this.leaderboard.findIndex(p => p.user.trim().toLowerCase() === playerName.trim().toLowerCase());
            if (index !== -1) {
                this.selected = index;
                this.currentTab = 'players';
                this.resetSearchFilterVisibility();
            }
        },
        resetSearchFilterVisibility() {
            this.selected = 0;
            this.selectedGroup = 0;
            this.selectedHistorical = 0;
            setTimeout(() => {
                const list = document.querySelector('.page-leaderboard .board') || document.querySelector('.board');
                if (!list) return;
                Array.from(list.querySelectorAll('tr')).forEach(r => r.style.display = '');
            }, 50);
        },
        onSearch(e) {
            const val = (e.target && e.target.value) ? e.target.value : '';
            clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(() => {
                const q = val.trim().toLowerCase();
                const list = document.querySelector('.page-leaderboard .board') || document.querySelector('.board');
                if (!list) return;
                const rows = Array.from(list.querySelectorAll('tr'));
                let firstFound = -1;
                rows.forEach((r, idx) => {
                    const text = (r.textContent || '').toLowerCase();
                    const match = q === '' || text.includes(q);
                    r.style.display = match ? '' : 'none';
                    if (match && firstFound === -1) firstFound = idx;
                });
                if (firstFound !== -1) {
                    if (this.currentTab === 'players') {
                        this.selected = firstFound;
                    } else if (this.currentTab === 'groups') {
                        this.selectedGroup = firstFound;
                    } else if (this.currentTab === 'timemachine') {
                        this.selectedHistorical = firstFound;
                    }
                }
            }, 180);
        }
    },
};
