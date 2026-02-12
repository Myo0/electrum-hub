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
    sectionId === 'pokemon-section' ? '#collapse' : '#moves-list'
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



document.addEventListener('DOMContentLoaded', () => {
  const collapseEl = document.getElementById('collapse');
  collapseEl.addEventListener('click', e => {

    const row = e.target.closest('.pokemon-row');
    if (!row) return;

    const name = row.querySelector('.col-name').textContent;

    const p = window.pokemonData.find(mon => mon.name === name);
    if (p) renderDetail(p);
  });
});

document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', () => {
  initSorters('pokemon-section');
  initSorters('moves-section');
});
