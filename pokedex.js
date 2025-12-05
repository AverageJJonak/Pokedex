// --- DOM Elements ---
const dom = {
    img: document.getElementById('poke-img'),
    id: document.getElementById('poke-id'),
    name: document.getElementById('poke-name'),
    types: document.getElementById('poke-types'),
    desc: document.getElementById('poke-desc'),
    height: document.getElementById('stat-height'),
    weight: document.getElementById('stat-weight'),
    abilities: document.getElementById('poke-abilities'),
    statsBars: document.getElementById('stats-bars'),
    viewInfo: document.getElementById('view-info'),
    viewStats: document.getElementById('view-stats'),
    loader: document.getElementById('loader'),
    input: document.getElementById('search-input'),
    typeFilter: document.getElementById('type-filter')
};

// --- State ---
let currentId = 1;
let currentView = 'info'; // 'info' or 'stats'

// --- Initialization ---
fetchPokemon(1);

// --- Event Listeners ---
document.getElementById('btn-next').addEventListener('click', () => fetchPokemon(currentId + 1));
document.getElementById('btn-prev').addEventListener('click', () => {
    if(currentId > 1) fetchPokemon(currentId - 1);
});

// Up/Down on D-Pad just toggles view for fun
document.getElementById('btn-up').addEventListener('click', toggleView);
document.getElementById('btn-down').addEventListener('click', toggleView);

// Blue Buttons
document.getElementById('btn-info').addEventListener('click', () => switchView('info'));
document.getElementById('btn-stats').addEventListener('click', () => switchView('stats'));

// Search
document.getElementById('btn-search').addEventListener('click', handleSearch);
dom.input.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleSearch() });

// --- Functions ---

function switchView(view) {
    currentView = view;
    if(view === 'info') {
        dom.viewInfo.classList.add('active');
        dom.viewStats.classList.remove('active');
    } else {
        dom.viewInfo.classList.remove('active');
        dom.viewStats.classList.add('active');
    }
}

function toggleView() {
    switchView(currentView === 'info' ? 'stats' : 'info');
}

async function handleSearch() {
    const query = dom.input.value.toLowerCase().trim();
    if(!query) return;
    fetchPokemon(query);
}

async function fetchPokemon(identifier) {
    // Show loading
    dom.loader.style.display = 'block';
    dom.viewInfo.style.opacity = '0.2';
    dom.viewStats.style.opacity = '0.2';

    try {
        // 1. Fetch Basic Data
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if(!res.ok) throw new Error('Not found');
        const data = await res.json();

        currentId = data.id; // Update current ID for next/prev buttons

        // 2. Fetch Species Data (for flavor text)
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        // 3. Update UI
        updateDisplay(data, speciesData);

    } catch (err) {
        console.error(err);
        dom.desc.textContent = "ERROR: POKEMON NOT FOUND.";
        dom.name.textContent = "MISSINGNO";
        dom.id.textContent = "#???";
        dom.img.src = ""; 
    } finally {
        dom.loader.style.display = 'none';
        dom.viewInfo.style.opacity = '1';
        dom.viewStats.style.opacity = '1';
    }
}

function updateDisplay(data, speciesData) {
    // --- Info View ---
    dom.id.textContent = `#${data.id.toString().padStart(3, '0')}`;
    dom.name.textContent = data.name.toUpperCase();
    
    // Image
    dom.img.src = data.sprites.front_default || data.sprites.other['official-artwork'].front_default;

    // Types
    const types = data.types.map(t => t.type.name.toUpperCase()).join('/');
    dom.types.textContent = types;

    // Description (Find first English entry)
    const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    // Clean up text (remove form feed characters)
    dom.desc.textContent = entry ? entry.flavor_text.replace(/\f/g, ' ') : "No data available.";

    // --- Stats View ---
    dom.height.textContent = `HT: ${(data.height / 10).toFixed(1)}m`;
    dom.weight.textContent = `WT: ${(data.weight / 10).toFixed(1)}kg`;

    // Abilities
    const abilities = data.abilities.map(a => a.ability.name.replace('-', ' ')).join(', ');
    dom.abilities.textContent = abilities;

    // Generate Stat Bars with Colors
    const statMap = {
        'hp': { label: 'HP', class: 'hp' },
        'attack': { label: 'ATK', class: 'atk' },
        'defense': { label: 'DEF', class: 'def' },
        'special-attack': { label: 'SPA', class: 'spa' },
        'special-defense': { label: 'SPD', class: 'spd' },
        'speed': { label: 'SPE', class: 'spe' }
    };

    let statsHtml = '';
    data.stats.forEach(s => {
        const info = statMap[s.stat.name] || { label: '---', class: '' };
        const val = s.base_stat;
        const percent = Math.min((val / 255) * 100, 100); // Cap at 100%

        statsHtml += `
            <div class="stat-bar-row">
                <div class="stat-label">${info.label}</div>
                <div class="stat-num">${val}</div>
                <div class="bar-container">
                    <div class="bar-fill ${info.class}" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    });
    dom.statsBars.innerHTML = statsHtml;
}