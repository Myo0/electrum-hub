const typePanel = document.getElementById('type-panel');
const typePanelClose = document.getElementById('type-panel-close');

typePanelClose.addEventListener('click', () => {
  typePanel.classList.remove('open');
  document.querySelectorAll('.type-row').forEach(r => r.classList.remove('active'));
});

function typeBadge(name) {
  return `<span class="type-badge ${name.toLowerCase()}">${name.toUpperCase()}</span>`;
}

function renderTypeBadges(container, names) {
  container.innerHTML = names.length
    ? names.map(typeBadge).join('')
    : '<span class="type-panel-none">None</span>';
}

function renderImmunities(type) {
  const wrap = document.getElementById('type-panel-immunities-content');
  wrap.innerHTML = '';

  const hasAny = type.typeImmunities.length || type.statusImmunities.length || type.otherImmunities.length;
  if (!hasAny) {
    wrap.innerHTML = '<span class="type-panel-none">None</span>';
    return;
  }

  if (type.typeImmunities.length) {
    const row = document.createElement('div');
    row.className = 'type-immunity-row';
    row.innerHTML = `<span class="type-immunity-label">Type:</span><span class="type-immunity-values">${type.typeImmunities.map(typeBadge).join('')}</span>`;
    wrap.appendChild(row);
  }

  if (type.statusImmunities.length) {
    const row = document.createElement('div');
    row.className = 'type-immunity-row';
    row.innerHTML = `<span class="type-immunity-label">Status:</span><span class="type-immunity-values">${type.statusImmunities.map(s => `<span class="type-status-pill">${s}</span>`).join('')}</span>`;
    wrap.appendChild(row);
  }

  if (type.otherImmunities.length) {
    const row = document.createElement('div');
    row.className = 'type-immunity-row';
    row.innerHTML = `<span class="type-immunity-label">Other:</span><span class="type-immunity-values">${type.otherImmunities.map(s => `<span class="type-other-item">${s}</span>`).join('')}</span>`;
    wrap.appendChild(row);
  }
}

function renderMoves(type) {
  const container = document.getElementById('type-panel-moves-list');
  container.innerHTML = '';

  if (!window.moveData) return;

  const typeMoves = window.moveData.filter(m => m.type === type.name);
  const physical = typeMoves.filter(m => m.category === 'Physical').sort((a, b) => a.name.localeCompare(b.name));
  const special  = typeMoves.filter(m => m.category === 'Special').sort((a, b) => a.name.localeCompare(b.name));
  const status   = typeMoves.filter(m => m.category === 'Status').sort((a, b) => a.name.localeCompare(b.name));

  if (!physical.length && !special.length && !status.length) {
    container.innerHTML = '<span class="type-panel-none" style="padding:1rem 1.2rem;display:block">No moves found.</span>';
    return;
  }

  function addMoveGroup(label, moves) {
    if (!moves.length) return;
    const header = document.createElement('div');
    header.className = 'type-list-header';
    header.textContent = label;
    container.appendChild(header);

    moves.forEach(move => {
      const row = document.createElement('div');
      row.className = 'move-row';
      const cat = move.category.toLowerCase();
      row.innerHTML = `
        <span class="col-name">${move.name}</span>
        <span class="col-type"><span class="type-badge ${move.type.toLowerCase()}">${move.type.toUpperCase()}</span></span>
        <span class="col-cat" data-category="${cat}"><img class="move-cat-icon" src="assets/move-category/${cat}.png" alt="${move.category}" title="${move.category}"></span>
        <span class="col-pwr">${move.power || '—'}</span>
        <span class="col-acc">${move.accuracy || '—'}</span>
        <span class="col-pp">${move.pp.base}/${move.pp.max}</span>
        <span class="col-effect">${move.effect || ''}</span>
      `;
      container.appendChild(row);
    });
  }

  addMoveGroup(`Physical ${type.name} Moves`, physical);
  addMoveGroup(`Special ${type.name} Moves`, special);
  addMoveGroup(`Status ${type.name} Moves`, status);
}

function renderPokemon(type) {
  const container = document.getElementById('type-panel-pokemon-list');
  container.innerHTML = '';

  if (!window.pokemonData) return;

  const ofType = window.pokemonData.filter(p => {
    const types = Array.isArray(p.types) ? p.types : [p.types];
    return types.some(t => t === type.name);
  });

  // Mega Evolutions sort immediately after their base form
  function megaSortKey(name) {
    return name.startsWith('Mega ') ? name.slice(5) + '\x01' : name + '\x00';
  }
  function megaSort(a, b) { return megaSortKey(a.name).localeCompare(megaSortKey(b.name)); }

  const pure = ofType.filter(p => {
    const types = Array.isArray(p.types) ? p.types : [p.types];
    return types.length === 1;
  }).sort(megaSort);

  const primary = ofType.filter(p => {
    const types = Array.isArray(p.types) ? p.types : [p.types];
    return types.length > 1 && types[0] === type.name;
  }).sort(megaSort);

  const secondary = ofType.filter(p => {
    const types = Array.isArray(p.types) ? p.types : [p.types];
    return types.length > 1 && types[1] === type.name;
  }).sort(megaSort);

  if (!pure.length && !primary.length && !secondary.length) {
    container.innerHTML = '<span class="type-panel-none" style="padding:1rem 1.2rem;display:block">No Pokémon found.</span>';
    return;
  }

  function addPokemonGroup(label, pokemon) {
    if (!pokemon.length) return;
    const header = document.createElement('div');
    header.className = 'type-list-header';
    header.textContent = label;
    container.appendChild(header);

    pokemon.forEach(p => {
      const s = p.stats || {};
      const bst = Object.values(s).reduce((a, b) => a + b, 0);
      const spriteClass = p.name.toLowerCase().replace(/\s+/g, '-');
      const typesArr = Array.isArray(p.types) ? p.types : (p.types ? [p.types] : []);
      const types = typesArr.map(t =>
        `<span class="type-badge ${t.toLowerCase()}">${t.toUpperCase()}</span>`
      ).join('');
      const abilitiesArr = Array.isArray(p.abilities) ? p.abilities : (p.ability ? [p.ability] : []);
      const abilitiesText = abilitiesArr.join('<br>');

      const row = document.createElement('div');
      row.className = 'pokemon-row';
      row.innerHTML = `
        <span class="col-check"><input type="checkbox" ${p.available ? 'checked' : ''} class="pokemon-check"></span>
        <span class="col-number">
          <span class="pokemon-sprite ${spriteClass}"></span>
          <span class="number-text">${p.number}</span>
        </span>
        <span class="col-name">${p.name}</span>
        <span class="col-types">${types}</span>
        <span class="col-abilities">${abilitiesText}</span>
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

  addPokemonGroup(`Pure ${type.name} Pokémon`, pure);
  addPokemonGroup(`Primary ${type.name} Pokémon`, primary);
  addPokemonGroup(`Secondary ${type.name} Pokémon`, secondary);
}

function openTypePanel(type) {
  // Close all other left-side panels
  document.getElementById('move-panel').classList.remove('open', 'open-right');
  document.querySelectorAll('.move-row').forEach(r => r.classList.remove('active'));
  document.getElementById('ability-panel').classList.remove('open');
  document.querySelectorAll('.ability-row').forEach(r => r.classList.remove('active'));
  document.getElementById('location-panel').classList.remove('open');
  document.querySelectorAll('.location-row').forEach(r => r.classList.remove('active'));
  document.getElementById('item-panel').classList.remove('open');
  document.querySelectorAll('.item-row').forEach(r => r.classList.remove('active'));

  // Header badge
  document.getElementById('type-panel-badge').innerHTML = typeBadge(type.name);

  // Weaknesses / Resistances
  renderTypeBadges(document.getElementById('type-panel-weaknesses-list'), type.weaknesses);
  renderTypeBadges(document.getElementById('type-panel-resistances-list'), type.resistances);

  // Immunities
  renderImmunities(type);

  // Default to Moves tab
  document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.type-tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.type-tab-btn[data-tab="moves"]').classList.add('active');
  document.getElementById('type-panel-moves-list').classList.add('active');

  renderMoves(type);
  renderPokemon(type);

  typePanel.classList.add('open');
}

// Tab switching
typePanel.addEventListener('click', e => {
  const btn = e.target.closest('.type-tab-btn');
  if (!btn) return;
  const tab = btn.dataset.tab;
  document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.type-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`type-panel-${tab}-list`).classList.add('active');
});

window.openTypePanel = openTypePanel;

// Clickable type badges inside any detail panel
const PANEL_SELECTOR = '#pokemon-detail-panel, #move-panel, #ability-panel, #location-panel, #item-panel, #type-panel';

document.addEventListener('click', e => {
  const badge = e.target.closest('.type-badge');
  if (!badge) return;
  if (!badge.closest(PANEL_SELECTOR)) return;

  // Don't navigate when clicking the header badge of the already-open type
  if (badge.closest('#type-panel-badge')) return;

  const typeName = badge.textContent.trim();
  const typeObj = window.typeData && window.typeData.find(t => t.name.toLowerCase() === typeName.toLowerCase());
  if (!typeObj) return;

  e.stopPropagation();
  openTypePanel(typeObj);
});