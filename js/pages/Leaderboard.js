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
        groups: [],
        loading: true,
        currentTab: 'players', // Tracks state: 'players' or 'groups'
        selected: 0,           // Selected index for individual players
        selectedGroup: 0,      // Selected index for group tab
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
            </div>

            <div class="page-leaderboard">
                <div class="leaderboard-search-wrap">
                    <input
                        id="leaderboard-search"
                        class="leaderboard-search"
                        type="search"
                        :placeholder="currentTab === 'players' ? 'Search users...' : 'Search groups...'"
                        aria-label="Search leaderboard"
                        @input="onSearch"
                    />
                </div>

                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>

                <div class="board-container">
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

                    <table v-else class="board">
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
                </div>

                <div class="player-container">
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

                    <div v-else class="player">
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
            const selectedPlayer = this.leaderboard[this.selected];
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

            // Combine completed levels and verified levels to search for the absolute hardest (lowest rank)
            const allPassedRecords = [...completed, ...verified];
            const sortedRecords = allPassedRecords.sort((a, b) => a.rank - b.rank);
            const hardest = sortedRecords.length > 0 ? sortedRecords[0].level : 'None';

            // Use a Map/Set to deduplicate by level name if a user has completed and verified the same level
            const uniqueRecordsMap = new Map();
            allPassedRecords.forEach(record => {
                // Keep the record with the lower rank (hardest version) if there's a conflict
                if (!uniqueRecordsMap.has(record.level) || record.rank < uniqueRecordsMap.get(record.level).rank) {
                    uniqueRecordsMap.set(record.level, record);
                }
            });

            // Calculate custom list distributions (Main: <=75, Extended: 76-150, Legacy: >=151)
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
            console.error("Optional team mapping compilation dataset group asset configurations failed to parse:", e);
        }

        this.loading = false;
    },
    methods: {
        localize,
        getCountryFlag,
        switchTab(tabName) {
            this.currentTab = tabName;
            const searchInput = document.getElementById('leaderboard-search');
            if (searchInput) searchInput.value = '';
            this.resetSearchFilterVisibility();
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
                    } else {
                        this.selectedGroup = firstFound;
                    }
                }
            }, 180);
        }
    },
};
