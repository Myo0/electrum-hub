const movePanel = document.getElementById('move-panel');
const movePanelClose = document.getElementById('move-panel-close');

movePanelClose.addEventListener('click', () => {
    movePanel.classList.remove('open');
    document.querySelectorAll('.move-row').forEach(r => r.classList.remove('active'));
});

function openMovePanel(move) {
    // Close ability panel (left-side mutual exclusivity)
    document.getElementById('ability-panel').classList.remove('open');
    document.querySelectorAll('.ability-row').forEach(r => r.classList.remove('active'));

    movePanel.classList.add('open');

    document.getElementById('move-panel-name').textContent = move.name;

    // Type badge
    const typeEl = document.getElementById('move-panel-type');
    typeEl.innerHTML = `<span class="type-badge ${move.type.toLowerCase()}">${move.type.toUpperCase()}</span>`;

    // Category icon
    const catEl = document.getElementById('move-panel-category');
    const category = move.category.toLowerCase();
    catEl.innerHTML = `<span class="category-badge ${category}">${move.category}</span>`;

    // Stats
    document.getElementById('move-panel-power').textContent = move.power || '—';
    document.getElementById('move-panel-accuracy').textContent = move.accuracy ? move.accuracy + '%' : '—';
    document.getElementById('move-panel-pp').textContent = `${move.pp.base} / ${move.pp.max}`;

    // Effect (short mechanical description)
    const effectSection = document.getElementById('move-effect-section');
    const effectEl = document.getElementById('move-panel-effect');
    if (move.effect && move.effect.trim()) {
        effectSection.style.display = 'block';
        effectEl.textContent = move.effect;
    } else {
        effectSection.style.display = 'none';
    }

    // Flavor description
    document.getElementById('move-panel-description').textContent = move.description || '';

    // Pokémon with this move
    populateMovePokemon(move.name);
}

function populateMovePokemon(moveName) {
    const container = document.getElementById('move-panel-pokemon');
    container.innerHTML = '';

    const filtered = window.pokemonData.filter(p =>
        p.learnset && p.learnset.some(m => m.move === moveName)
    );

    filtered.forEach(pokemon => {
        const row = document.createElement('div');
        row.className = 'pokemon-row';

        const learnEntry = pokemon.learnset.find(m => m.move === moveName);
        const levelDisplay = learnEntry ? `Lv.${learnEntry.level}` : '—';

        const s = pokemon.stats || {};
        const bst = Object.values(s).reduce((a, b) => a + b, 0);
        const typesArr = Array.isArray(pokemon.types) ? pokemon.types : (pokemon.types ? [pokemon.types] : []);

        row.innerHTML = `
            <span class="col-number">
                <span class="pokemon-sprite ${pokemon.name.toLowerCase().replace(/\s+/g, '-')}"></span>
                <span class="number-text">${pokemon.number}</span>
            </span>
            <span class="col-name">${pokemon.name}</span>
            <span class="col-types">
                ${typesArr.map(t => `<span class="type-badge ${t.toLowerCase()}">${t}</span>`).join('')}
            </span>
            <span class="col-abilities">${levelDisplay}</span>
            <span class="col-hp">${s.hp ?? ''}</span>
            <span class="col-atk">${s.atk ?? ''}</span>
            <span class="col-def">${s.def ?? ''}</span>
            <span class="col-spa">${s.spa ?? ''}</span>
            <span class="col-spd">${s.spd ?? ''}</span>
            <span class="col-spe">${s.spe ?? ''}</span>
            <span class="col-bst">${bst}</span>
        `;

        container.appendChild(row);
    });
}

window.openMovePanel = openMovePanel;
