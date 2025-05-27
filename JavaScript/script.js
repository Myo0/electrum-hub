"use strict";

const SortConfig = {
  'pokemon-section': {
    rowSelector: '.pokemon-row',
    // data-key ⇒ extractor(row) → comparable value
    extractors: {
      number:    row => +row.querySelector('.col-number').textContent || 0,
      name:      row => row.querySelector('.col-name').textContent.toLowerCase(),
      types:     row => Array.from(row.querySelectorAll('.col-types .type-badge'))
                            .map(b=>b.textContent.toLowerCase()).join(' '),
      abilities: row => row.querySelector('.col-abilities').textContent.toLowerCase(),
      hp:        row => +row.querySelector('.col-hp').textContent || 0,
      atk:       row => +row.querySelector('.col-atk').textContent || 0,
      def:       row => +row.querySelector('.col-def').textContent || 0,
      spa:       row => +row.querySelector('.col-spa').textContent || 0,
      spd:       row => +row.querySelector('.col-spd').textContent || 0,
      spe:       row => +row.querySelector('.col-spe').textContent || 0,
      bst:       row => +row.querySelector('.col-bst').textContent || 0
    }
  },

  'moves-section': {
    rowSelector: '.move-row',
    extractors: {
      name:     row => row.querySelector('.col-name').textContent.toLowerCase(),
      type:     row => row.querySelector('.col-type').textContent.toLowerCase(),
      category: row => row.querySelector('.col-cat').textContent.toLowerCase(),
      power:    row => +row.querySelector('.col-pwr').textContent || 0,
      accuracy: row => +row.querySelector('.col-acc').textContent || 0,
      pp:       row => {
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

function getCellValue(row, key) {
  switch (key) {

    case 'number':
      return parseInt(row.querySelector('.col-number').textContent) || 0;

    case 'name':
      return row.querySelector('.col-name').textContent.toLowerCase();

    case 'types':
      return Array.from(row.querySelectorAll('.col-types .type-badge'))
        .map(b => b.textContent.toLowerCase()).join(' ');

    case 'abilities':
      return row.querySelector('.col-abilities').textContent.toLowerCase();

    case 'hp': case 'atk': case 'def':
    case 'spa': case 'spd': case 'spe': case 'bst':
      return parseInt(row.querySelector(`.col-${key}`).textContent) || 0;
    default:
      return '';
  }
}

function initSorters() {
  const section               = document.getElementById('pokemon-section');
  const collapseEl            = section.querySelector('#collapse');
  const originalCollapseHTML  = collapseEl.innerHTML;

  const header    = section.querySelector('.table-header');
  const sortables = header.querySelectorAll('.sortable[data-key]');
  let currentSort = { key: null, direction: null };

  sortables.forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const key = el.dataset.key;
      // cycle: null → desc → asc → null
      let dir = 'desc';
      if (currentSort.key === key) {
        if      (currentSort.direction === 'desc') dir = 'asc';
        else if (currentSort.direction === 'asc')  dir = null;
      }
      currentSort = { key, direction: dir };

      sortables.forEach(h =>
        h.classList.toggle('selected', h.dataset.key === key && dir)
      );

      collapseEl
        .querySelectorAll('.gen-header')
        .forEach(h => h.style.display = dir ? 'none' : '');

      if (dir) {
        const rows = Array.from(collapseEl.querySelectorAll('.pokemon-row'));
        rows.sort((a, b) => {
          const aV = getCellValue(a, key), bV = getCellValue(b, key);
          if (aV < bV) return dir==='asc' ? -1 : 1;
          if (aV > bV) return dir==='asc' ? 1  : -1;
          return 0;
        });
        rows.forEach(r => collapseEl.appendChild(r));

      } else {
        collapseEl.innerHTML = originalCollapseHTML;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initSorters);
