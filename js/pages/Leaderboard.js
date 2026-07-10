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
                    <div v-if="currentTab === 'players'" class="player">
                        <h1>{{ getCountryFlag(entry.country) }} #{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>
                        
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>
                        
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>
                        
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a></td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>
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
                return { user: '', total: 0, country: 'US', verified: [], completed: [], progressed: [] };
            }
            return {
                ...selectedPlayer,
                country: selectedPlayer.country && selectedPlayer.country !== 'UN' ? selectedPlayer.country : 'US'
            };
        },
        processedGroups() {
            // Process group statistics sequentially by referencing live leaderboard states dynamically
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

                        // Collate lists across completed entries to compute overlap metrics counters
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

                // Convert compilation map into scannable listing vectors filtering items scaling above 1
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

        // Dynamic parallel processing block safely pulling down structural clan files layout mappings
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
            // Clear text filtering layouts instantly contextually across switches to prevent layout breaks
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
