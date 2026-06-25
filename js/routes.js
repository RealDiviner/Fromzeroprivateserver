import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
// 1. Import your new submission page file
import Submit from './pages/Submit.js'; 

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    // 2. Register the path route rule handler
    { path: '/submit', component: Submit }, 
];
