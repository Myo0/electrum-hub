"use strict";

const SortConfig = {
  'pokemon-section': {
    rowSelector: '.pokemon-row',
    // data-key ⇒ extractor(row) → comparable value
    extractors: {
      number: row => +row.querySelector('.col-number').textContent || 0,
      name: row => row.querySelector('.col-name').textContent.toLowerCase(),
      types: row => Array.from(row.querySelectorAll('.col-types .type-badge')).map(b=>b.textContent.toLowerCase()).join(' '),
      abilities: row => row.querySelector('.col-abilities').textContent.toLowerCase(),
      hp: row => +row.querySelector('.col-hp').textContent || 0,
      atk: row => +row.querySelector('.col-atk').textContent || 0,
      def: row => +row.querySelector('.col-def').textContent || 0,
      spa: row => +row.querySelector('.col-spa').textContent || 0,
      spd: row => +row.querySelector('.col-spd').textContent || 0,
      spe: row => +row.querySelector('.col-spe').textContent || 0,
      bst: row => +row.querySelector('.col-bst').textContent || 0
    }
  },

  'moves-section': {
    rowSelector: '.move-row',
    extractors: {
      name: row => row.querySelector('.col-name').textContent.toLowerCase(),
      type: row => row.querySelector('.col-type').textContent.toLowerCase(),
      category: row => row.querySelector('.col-cat').dataset.category,
      power: row => +row.querySelector('.col-pwr').textContent || 0,
      accuracy: row => +row.querySelector('.col-acc').textContent || 0,
      pp: row => {
        const text = row.querySelector('.col-pp').textContent; // "15/24"
        return +text.split('/')[0]||0;
      }
    }
  },

};

// pokemon/locations/moves nav bar
document.querySelectorAll('.sub-nav button').forEach(btn => {
    btn.addEventListener('click', () => {

      document.querySelectorAll('.sub-nav button')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
  
      document.querySelectorAll('.content-section')
        .forEach(sec => sec.classList.remove('active'));
      document.getElementById(`${btn.dataset.section}-section`)
        .classList.add('active');
    });
  });

// dark theme toggle
const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
});

if (localStorage.theme === 'dark') {
  document.body.classList.add('dark-mode');
}

function initSorters(sectionId) {
  const config = SortConfig[sectionId];
  if (!config) return;

  const section = document.getElementById(sectionId);
  if (!section) return;

  const header = section.querySelector('.table-header');
  const rowsContainer = section.querySelector(
    sectionId === 'pokemon-section' ? '#pokemon-list' : '#moves-list'
  );

  if (!header || !rowsContainer) return;

  const sortables = header.querySelectorAll('.sortable[data-key]');
  let currentSort = { key: null, direction: null };

  sortables.forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.key;

      let dir = 'asc';
      if (currentSort.key === key && currentSort.direction === 'asc') {
        dir = 'desc';
      }

      currentSort = { key, direction: dir };

      sortables.forEach(h =>
        h.classList.toggle('selected', h.dataset.key === key)
      );

      const rows = Array.from(
        rowsContainer.querySelectorAll(config.rowSelector)
      );

  rows.sort((a, b) => {
    const aV = config.extractors[key](a);
    const bV = config.extractors[key](b);

    // String sort
    if (typeof aV === 'string' && typeof bV === 'string') {
      return dir === 'asc'
        ? aV.localeCompare(bV)
        : bV.localeCompare(aV);
    }

    // Numeric sort
    return dir === 'asc' ? aV - bV : bV - aV;
  });

      rows.forEach(r => rowsContainer.appendChild(r));
    });
  });
}



document.addEventListener('click', (e) => {
  const moveRow = e.target.closest('.move-row');
  if (moveRow) {
    const moveName = moveRow.querySelector('.col-name').textContent.trim();
    const move = window.moveData.find(m => m.name === moveName);
    if (!move) return;

    document.querySelectorAll('.move-row').forEach(r => r.classList.remove('active'));
    moveRow.classList.add('active');
    window.openMovePanel(move);
    return;
  }
});

document.addEventListener('click', (e) => {
const row = e.target.closest('.pokemon-row');
if (!row) return;

  // prevent triggering when clicking ability links
  if (e.target.closest('.ability-link')) return;

  const nameEl = row.querySelector('.col-name');
  if (!nameEl) return;

  const name = nameEl.textContent.trim();
  const p = window.pokemonData.find(mon => mon.name === name);
  if (!p) return;

  renderDetail(p);
});



document.addEventListener('DOMContentLoaded', () => {
  // pokemon list
  const pokemonList = document.getElementById('pokemon-list');
  if (!pokemonList || !window.pokemonData) return;

  const GENERATIONS = [
    { label: 'Generation I',    min: 1,   max: 151  },
    { label: 'Generation II',   min: 152,  max: 251  },
    { label: 'Generation III',  min: 252,  max: 386  },
    { label: 'Generation IV',   min: 387,  max: 493  },
    { label: 'Generation V',    min: 494,  max: 649  },
    { label: 'Generation VI',   min: 650,  max: 721  },
    { label: 'Generation VII',  min: 722,  max: 809  },
    { label: 'Generation VIII', min: 810,  max: 905  },
    { label: 'Generation IX',   min: 906,  max: 1025 },
  ];

  GENERATIONS.forEach(gen => {
    const genPokemon = window.pokemonData.filter(p =>
      p.number >= gen.min && p.number <= gen.max
    );
    if (!genPokemon.length) return;

    const header = document.createElement('div');
    header.className = 'gen-header';
    header.textContent = gen.label;
    pokemonList.appendChild(header);

    genPokemon.forEach(p => {
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
        <span class="col-check">
          <input type="checkbox" ${p.available ? 'checked' : ''} class="pokemon-check">
        </span>
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
      pokemonList.appendChild(row);
    });
  });

  // moves
  const movesList = document.getElementById('moves-list');
  if (!movesList || !window.moveData) return;

// default ordering is alphabetical
  const sortedMoves = [...window.moveData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  sortedMoves.forEach(move => {
    const row = document.createElement('div');
    row.className = 'move-row';

    const category = move.category.toLowerCase();

    row.innerHTML = `
      <span class="col-name">${move.name}</span>

      <span class="col-type">
        <span class="type-badge ${move.type.toLowerCase()}">
          ${move.type.toUpperCase()}
        </span>
      </span>

      <span class="col-cat" data-category="${category}">
        <img
          class="move-cat-icon"
          src="assets/move-category/${category}.png"
          alt="${move.category}"
          title="${move.category}"
        >
      </span>

      <span class="col-pwr">${move.power || '—'}</span>
      <span class="col-acc">${move.accuracy || '—'}</span>
      <span class="col-pp">${move.pp.base}/${move.pp.max}</span>
      <span class="col-effect">${move.effect || ''}</span>
    `;

    movesList.appendChild(row);
  });

  // abilities
  const abilitiesList = document.getElementById('abilities-list');
  if (!abilitiesList || !window.abilityData) return;

  const sortedAbilities = [...window.abilityData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  sortedAbilities.forEach(ability => {
    const row = document.createElement('div');
    row.className = 'ability-row';

    row.innerHTML = `
      <div class="ability-name">${ability.name}</div>
      <div class="ability-description">${ability.summary || ''}</div>
      <div class="ability-chevron">›››</div>
    `;

    abilitiesList.appendChild(row);
  });

  abilitiesList.addEventListener('click', e => {
    const row = e.target.closest('.ability-row');
    if (!row) return;

    document.querySelectorAll('.ability-row').forEach(r =>
      r.classList.remove('active')
    );

    row.classList.add('active');

    const abilityName = row.querySelector('.ability-name').textContent;
    const abilityObj = window.abilityData.find(a => a.name === abilityName);

    if (abilityObj) {
      openAbilityPanel(abilityObj);
    }
  });



  // -----------------------------------------------------------------------------------
  // locations
  const locationList = document.getElementById('location-list');
  if (!locationList || !window.locationData) return;

  window.locationData.forEach(location => {
    const row = document.createElement('div');
    row.className = 'location-row';

    row.innerHTML = `
      <div class="location-name">${location.name}</div>
      <div class="location-description">${location.description || ''}</div>
    `;

    row.addEventListener('click', () => {
      document.querySelectorAll('.location-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      window.openLocationPanel(location);
    });

    locationList.appendChild(row);
  });

  // items
  const itemsList = document.getElementById('items-list');
  if (itemsList && window.itemData) {
    const sortedItems = [...window.itemData].sort((a, b) => a.name.localeCompare(b.name));

    sortedItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <img class="item-icon" src="${item.icon}" alt="${item.name}" onerror="this.style.display='none'">
        <div class="item-name">${item.name}</div>
        <div class="item-effect">${item.effect}</div>
        <div class="item-chevron">›››</div>
      `;
      row.addEventListener('click', () => {
        document.querySelectorAll('.item-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        window.openItemPanel(item);
      });
      itemsList.appendChild(row);
    });
  }

  initSorters('pokemon-section');
  initSorters('moves-section');
});
