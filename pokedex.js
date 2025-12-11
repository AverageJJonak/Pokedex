// pokedex.js

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
    baseStatTotal: document.getElementById('base-stat-total'),
    evYield: document.getElementById('ev-yield'),
    viewInfo: document.getElementById('view-info'),
    viewStats: document.getElementById('view-stats'),
    loader: document.getElementById('loader'),
    input: document.getElementById('search-input'),
    typeFilter: document.getElementById('type-filter'),
    powerLight: document.getElementById('power-light'),
    dotRed: document.getElementById('dot-red'),
    dotYellow: document.getElementById('dot-yellow'),
    dotGreen: document.getElementById('dot-green'),
    volumeSlider: document.getElementById('volume-slider'),
    screenContainer: document.getElementById('screen-container'),
    powerOffScreen: document.getElementById('power-off-screen'),
    screenBezel: document.getElementById('screen-bezel'),
    megaBanner: document.getElementById('mega-banner'),
    shinyIndicator: document.getElementById('shiny-indicator'),
    generationBadge: document.getElementById('generation-badge'),
    spriteEffects: document.getElementById('sprite-effects'),
    bootSequence: document.getElementById('boot-sequence'),
    device: document.querySelector('.pokedex-device')
};

// --- State ---
let currentId = 1;
let currentView = 'info';
let isPoweredOn = false;
let isMegaMode = false;
let isShiny = false;

// Mega Evolution / Gigantamax forms database
const megaForms = {
    3: 'venusaur-mega', 6: 'charizard-mega-x', 9: 'blastoise-mega',
    15: 'beedrill-mega', 18: 'pidgeot-mega', 65: 'alakazam-mega',
    80: 'slowbro-mega', 94: 'gengar-mega', 115: 'kangaskhan-mega',
    127: 'pinsir-mega', 130: 'gyarados-mega', 142: 'aerodactyl-mega',
    150: 'mewtwo-mega-x', 181: 'ampharos-mega', 212: 'scizor-mega',
    214: 'heracross-mega', 229: 'houndoom-mega', 248: 'tyranitar-mega',
    254: 'sceptile-mega', 257: 'blaziken-mega', 260: 'swampert-mega',
    282: 'gardevoir-mega', 302: 'sableye-mega', 303: 'mawile-mega',
    306: 'aggron-mega', 308: 'medicham-mega', 310: 'manectric-mega',
    319: 'sharpedo-mega', 323: 'camerupt-mega', 334: 'altaria-mega',
    354: 'banette-mega', 359: 'absol-mega', 362: 'glalie-mega',
    373: 'salamence-mega', 376: 'metagross-mega', 380: 'latias-mega',
    381: 'latios-mega', 384: 'rayquaza-mega', 428: 'lopunny-mega',
    445: 'garchomp-mega', 448: 'lucario-mega', 460: 'abomasnow-mega',
    475: 'gallade-mega', 531: 'audino-mega', 719: 'diancie-mega',
    12: 'butterfree-gmax', 25: 'pikachu-gmax', 52: 'meowth-gmax',
    68: 'machamp-gmax', 99: 'kingler-gmax', 131: 'lapras-gmax',
    133: 'eevee-gmax', 143: 'snorlax-gmax', 569: 'garbodor-gmax',
    809: 'melmetal-gmax', 812: 'rillaboom-gmax', 815: 'cinderace-gmax',
    818: 'inteleon-gmax', 823: 'corviknight-gmax', 826: 'orbeetle-gmax',
    834: 'drednaw-gmax', 839: 'coalossal-gmax', 841: 'flapple-gmax',
    842: 'appletun-gmax', 844: 'sandaconda-gmax', 849: 'toxtricity-gmax',
    851: 'centiskorch-gmax', 858: 'hatterene-gmax', 861: 'grimmsnarl-gmax',
    869: 'alcremie-gmax', 879: 'copperajah-gmax', 884: 'duraludon-gmax',
    892: 'urshifu-gmax'
};

// --- Audio Functions ---
function createBeep(frequency, duration, type = 'sine') {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    const volume = dom.volumeSlider.value / 100;
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playSound(soundType) {
    if (!isPoweredOn && soundType !== 'powerOn' && soundType !== 'powerOff') return;
    
    switch(soundType) {
        case 'button':
            createBeep(800, 0.05);
            break;
        case 'move':
            createBeep(600, 0.08);
            break;
        case 'select':
            createBeep(1000, 0.1);
            setTimeout(() => createBeep(1200, 0.1), 100);
            break;
        case 'error':
            createBeep(200, 0.3, 'sawtooth');
            break;
        case 'powerOn':
            createBeep(400, 0.1);
            setTimeout(() => createBeep(600, 0.1), 100);
            setTimeout(() => createBeep(800, 0.15), 200);
            break;
        case 'powerOff':
            createBeep(800, 0.1);
            setTimeout(() => createBeep(600, 0.1), 100);
            setTimeout(() => createBeep(400, 0.15), 200);
            break;
        case 'megaActivate':
            for(let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createBeep(400 + (i * 200), 0.1, 'square');
                }, i * 100);
            }
            setTimeout(() => {
                createBeep(1500, 0.3, 'sawtooth');
            }, 500);
            break;
        case 'shiny':
            createBeep(1200, 0.1);
            setTimeout(() => createBeep(1400, 0.1), 100);
            setTimeout(() => createBeep(1600, 0.15), 200);
            break;
    }
}

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    powerOff();
});

// --- Power Functions ---
function powerOn() {
    if (isPoweredOn) return;
    
    isPoweredOn = true;
    playSound('powerOn');
    
    // Boot sequence
    const bootMessages = [
        'SYSTEM BOOT...',
        'LOADING OS...',
        'CHECKING DATABASE...',
        'POKéDEX READY!'
    ];
    
    let msgIndex = 0;
    const bootInterval = setInterval(() => {
        if (msgIndex < bootMessages.length) {
            dom.bootSequence.textContent = bootMessages[msgIndex];
            blinkDot(dom.dotRed);
            msgIndex++;
        } else {
            clearInterval(bootInterval);
            dom.bootSequence.textContent = '';
            dom.powerOffScreen.classList.remove('active');
            dom.screenContainer.classList.remove('powered-off');
            dom.powerLight.classList.add('pulse');
            dom.powerLight.classList.remove('off');
            
            setTimeout(() => blinkDot(dom.dotGreen), 100);
            setTimeout(() => blinkDot(dom.dotYellow), 300);
            
            setTimeout(() => {
                fetchPokemon(1);
            }, 500);
        }
    }, 300);
}

function powerOff() {
    isPoweredOn = false;
    dom.powerOffScreen.classList.add('active');
    dom.screenContainer.classList.add('powered-off');
    dom.powerLight.classList.remove('pulse');
    dom.powerLight.classList.add('off');
    dom.bootSequence.textContent = '';
    
    if (currentId !== 0) {
        playSound('powerOff');
    }
    currentId = 0;
    
    if (isMegaMode) {
        deactivateMegaMode();
    }
}

function togglePower() {
    if (isPoweredOn) {
        powerOff();
    } else {
        powerOn();
    }
}

function activateMegaMode() {
    if (isMegaMode) return;
    
    isMegaMode = true;
    dom.screenContainer.classList.add('mega-mode');
    dom.megaBanner.classList.add('active');
    dom.device.classList.add('mega-mode');
    dom.powerLight.classList.remove('pulse');
    dom.powerLight.classList.add('mega-pulse');
    
    playSound('megaActivate');
    
    setTimeout(() => {
        blinkDot(dom.dotRed);
        blinkDot(dom.dotYellow);
        blinkDot(dom.dotGreen);
    }, 200);
    
    if (currentId > 0) {
        setTimeout(() => {
            fetchPokemon(currentId, true);
        }, 800);
    }
}

function deactivateMegaMode() {
    isMegaMode = false;
    dom.screenContainer.classList.remove('mega-mode');
    dom.megaBanner.classList.remove('active');
    dom.device.classList.remove('mega-mode');
    dom.powerLight.classList.remove('mega-pulse');
    if (isPoweredOn) {
        dom.powerLight.classList.add('pulse');
    }
}

function blinkDot(dot) {
    dot.classList.add('blink');
    setTimeout(() => dot.classList.remove('blink'), 1500);
}

// --- Event Listeners ---
document.getElementById('btn-next').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('move');
    fetchPokemon(currentId + 1, isMegaMode);
});

document.getElementById('btn-prev').addEventListener('click', () => {
    if (!isPoweredOn) return;
    if(currentId > 1) {
        playSound('move');
        fetchPokemon(currentId - 1, isMegaMode);
    }
});

document.getElementById('btn-up').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('button');
    toggleView();
});

document.getElementById('btn-down').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('button');
    toggleView();
});

document.getElementById('btn-a').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('select');
    switchView('info');
});

document.getElementById('btn-b').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('select');
    switchView('stats');
});

document.getElementById('btn-start').addEventListener('click', () => {
    togglePower();
});

document.getElementById('btn-select').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('button');
    // Toggle shiny
    isShiny = !isShiny;
    if (currentId > 0) {
        if (isShiny) {
            playSound('shiny');
        }
        fetchPokemon(currentId, isMegaMode);
    }
});

document.getElementById('btn-search').addEventListener('click', () => {
    if (!isPoweredOn) return;
    playSound('button');
    handleSearch();
});

dom.input.addEventListener('keypress', (e) => { 
    if (!isPoweredOn) return;
    if(e.key === 'Enter') {
        playSound('button');
        handleSearch();
    }
});

dom.typeFilter.addEventListener('change', () => {
    if (!isPoweredOn) return;
    playSound('button');
    const type = dom.typeFilter.value;
    if(type) {
        fetchPokemonByType(type);
    }
});

// Keyboard controls
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if(konamiCode.join(',') === konamiSequence.join(',')) {
        if (!isPoweredOn) powerOn();
        
        setTimeout(() => {
            activateMegaMode();
        }, isPoweredOn ? 0 : 1000);
        
        konamiCode = [];
        return;
    }
    
    if (!isPoweredOn && e.key.toLowerCase() !== 'enter') return;
    
    switch(e.key.toLowerCase()) {
        case 'arrowright':
            document.getElementById('btn-next').click();
            break;
        case 'arrowleft':
            document.getElementById('btn-prev').click();
            break;
        case 'arrowup':
        case 'arrowdown':
            if (isPoweredOn) document.getElementById('btn-up').click();
            break;
        case 'a':
            document.getElementById('btn-a').click();
            break;
        case 'b':
            document.getElementById('btn-b').click();
            break;
        case 'enter':
            document.getElementById('btn-start').click();
            break;
        // Removed the 'm' key case that toggled mega mode
    }
});

// --- Functions ---
function switchView(view) {
    if (!isPoweredOn) return;
    
    currentView = view;
    if(view === 'info') {
        dom.viewInfo.classList.add('active');
        dom.viewStats.classList.remove('active');
    } else {
        dom.viewInfo.classList.remove('active');
        dom.viewStats.classList.add('active');
    }
    blinkDot(view === 'info' ? dom.dotGreen : dom.dotYellow);
}

function toggleView() {
    switchView(currentView === 'info' ? 'stats' : 'info');
}

async function handleSearch() {
    if (!isPoweredOn) return;
    
    const query = dom.input.value.toLowerCase().trim();
    if(!query) return;
    fetchPokemon(query, isMegaMode);
    dom.input.value = '';
}

async function fetchPokemonByType(type) {
    if (!isPoweredOn) return;
    
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        if(!res.ok) throw new Error('Type not found');
        const data = await res.json();
        
        const randomIndex = Math.floor(Math.random() * data.pokemon.length);
        const pokemonUrl = data.pokemon[randomIndex].pokemon.url;
        const id = pokemonUrl.split('/').filter(Boolean).pop();
        
        fetchPokemon(id, isMegaMode);
    } catch(err) {
        console.error(err);
        playSound('error');
    }
}

async function fetchPokemon(identifier, useMegaForm = false) {
    if (!isPoweredOn) return;
    
    dom.loader.style.display = 'block';
    dom.viewInfo.style.opacity = '0.2';
    dom.viewStats.style.opacity = '0.2';
    dom.screenContainer.classList.add('flicker');

    try {
        let baseRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if(!baseRes.ok) throw new Error('Not found');
        let baseData = await baseRes.json();
        
        let finalIdentifier = identifier;
        currentId = baseData.id;
        
        if (useMegaForm && megaForms[currentId]) {
            finalIdentifier = megaForms[currentId];
        }
        
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${finalIdentifier}`);
        if(!res.ok) throw new Error('Form not found');
        const data = await res.json();

        const speciesRes = await fetch(baseData.species.url);
        const speciesData = await speciesRes.json();

        updateDisplay(data, speciesData, useMegaForm);
        
        if(data.cries && data.cries.latest) {
            const cryAudio = new Audio(data.cries.latest);
            cryAudio.volume = dom.volumeSlider.value / 100;
            cryAudio.play().catch(() => {});
        }
        
        playSound('select');
        blinkDot(dom.dotGreen);

    } catch (err) {
        console.error(err);
        dom.desc.textContent = useMegaForm ? 
            "ERROR: MEGA FORM NOT AVAILABLE FOR THIS POKEMON." : 
            "ERROR: POKEMON NOT FOUND.";
        dom.name.textContent = "MISSINGNO";
        dom.id.textContent = "#???";
        dom.img.src = ""; 
        playSound('error');
        blinkDot(dom.dotRed);
    } finally {
        dom.loader.style.display = 'none';
        dom.viewInfo.style.opacity = '1';
        dom.viewStats.style.opacity = '1';
        dom.screenContainer.classList.remove('flicker');
    }
}

function updateDisplay(data, speciesData, isMega) {
    // --- Info View ---
    dom.id.textContent = `#${currentId.toString().padStart(3, '0')}`;
    
    let displayName = data.name.toUpperCase();
    if (isMega) {
        if (data.name.includes('mega')) {
            displayName = displayName.replace('-MEGA', ' MEGA');
            displayName = displayName.replace('-X', ' X');
            displayName = displayName.replace('-Y', ' Y');
        } else if (data.name.includes('gmax')) {
            displayName = displayName.replace('-GMAX', ' G-MAX');
        }
    }
    dom.name.textContent = displayName;
    
    // Sprite with shiny support
    dom.img.style.animation = 'none';
    setTimeout(() => {
        if (isShiny) {
            dom.img.src = data.sprites.other['official-artwork'].front_shiny || 
                          data.sprites.front_shiny ||
                          data.sprites.other['official-artwork'].front_default || 
                          data.sprites.front_default;
            dom.shinyIndicator.classList.add('active');
        } else {
            dom.img.src = data.sprites.other['official-artwork'].front_default || 
                          data.sprites.front_default;
            dom.shinyIndicator.classList.remove('active');
        }
        dom.img.style.animation = '';
    }, 10);

    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0',
        electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
        fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
        flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
        dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC'
    };
    
    const typesHTML = data.types.map(t => {
        const typeName = t.type.name;
        const color = typeColors[typeName] || '#68A090';
        return `<span class="type-badge" style="background-color: ${color}; color: white;">${typeName.toUpperCase()}</span>`;
    }).join(' ');
    
    dom.types.innerHTML = typesHTML;

    // Description
    let description = "No data available.";
    if (isMega) {
        if (data.name.includes('mega')) {
            description = `This is the MEGA EVOLVED form of ${speciesData.name.toUpperCase()}! Through the power of Mega Evolution, this Pokémon has transcended its limits, gaining incredible power and a new appearance. Its stats have been dramatically enhanced!`;
        } else if (data.name.includes('gmax')) {
            description = `This is the GIGANTAMAX form of ${speciesData.name.toUpperCase()}! When exposed to Dynamax energy in certain Power Spots, this Pokémon takes on a unique giant form with special G-Max moves and enhanced abilities!`;
        }
    } else {
        const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
        description = entry ? entry.flavor_text.replace(/\f/g, ' ') : "No data available.";
    }
    dom.desc.textContent = description;

    // Generation badge
    const genNumber = speciesData.generation.url.split('/').filter(Boolean).pop();
    dom.generationBadge.textContent = `GEN ${genNumber}`;

    // --- Stats View ---
    dom.height.textContent = `HT: ${(data.height / 10).toFixed(1)}m`;
    dom.weight.textContent = `WT: ${(data.weight / 10).toFixed(1)}kg`;

    const abilities = data.abilities
        .map(a => a.ability.name.replace(/-/g, ' ').toUpperCase())
        .join(', ');
    dom.abilities.textContent = abilities;

    const statMap = {
        'hp': { label: 'HP', class: 'hp' },
        'attack': { label: 'ATK', class: 'atk' },
        'defense': { label: 'DEF', class: 'def' },
        'special-attack': { label: 'SPA', class: 'spa' },
        'special-defense': { label: 'SPD', class: 'spd' },
        'speed': { label: 'SPE', class: 'spe' }
    };

    let statsHtml = '';
    let totalStats = 0;
    data.stats.forEach(s => {
        const info = statMap[s.stat.name] || { label: '---', class: '' };
        const val = s.base_stat;
        totalStats += val;
        const percent = Math.min((val / 255) * 100, 100);

        statsHtml += `
            <div class="stat-bar-row">
                <div class="stat-label">${info.label}</div>
                <div class="stat-num">${val}</div>
                <div class="bar-container">
                    <div class="bar-fill ${info.class}" style="width: 0%;" data-width="${percent}"></div>
                </div>
            </div>
        `;
    });
    dom.statsBars.innerHTML = statsHtml;
    
    setTimeout(() => {
        document.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 100);

    // Base stat total
    dom.baseStatTotal.textContent = `TOTAL: ${totalStats}`;

    // EV Yield
    const evs = data.stats
        .filter(s => s.effort > 0)
        .map(s => `${s.effort} ${statMap[s.stat.name]?.label || ''}`)
        .join(', ');
    dom.evYield.textContent = evs ? `EV YIELD: ${evs}` : 'EV YIELD: NONE';
}