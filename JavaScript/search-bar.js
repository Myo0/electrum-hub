document.addEventListener('DOMContentLoaded', () => {

  function attachSearch({
    inputId,
    sectionSelector,
    rowSelector,
    getSearchText
  }) {
    const input = document.getElementById(inputId);
    if (!input) return;

    function filterRows() {
      const q = input.value.trim().toLowerCase();
      const rows = Array.from(
        document.querySelectorAll(`${sectionSelector} ${rowSelector}`)
      );

      rows.forEach(row => {
        const searchableText = getSearchText(row);

        if (searchableText.includes(q)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    input.addEventListener('input', filterRows);
    filterRows();
  }

  // Pokémon Search
  attachSearch({
    inputId: 'pokemon-search',
    sectionSelector: '#pokemon-section',
    rowSelector: '.pokemon-row',
    getSearchText: row => {
      const name  = row.querySelector('.col-name')?.textContent.toLowerCase() || '';
      const types = Array.from(row.querySelectorAll('.col-types .type-badge'))
        .map(b => b.textContent.toLowerCase())
        .join(' ');
      const abil  = row.querySelector('.col-abilities')?.textContent.toLowerCase() || '';
      return `${name} ${types} ${abil}`;
    }
  });

  // Moves Search
  attachSearch({
    inputId: 'moves-search',
    sectionSelector: '#moves-section',
    rowSelector: '.move-row',
    getSearchText: row => {
      const name   = row.querySelector('.col-name')?.textContent.toLowerCase() || '';
      const type   = row.querySelector('.col-type')?.textContent.toLowerCase() || '';
      const effect = row.querySelector('.col-effect')?.textContent.toLowerCase() || '';
      return `${name} ${type} ${effect}`;
    }
  });

  // Abilities Search
  attachSearch({
    inputId: 'abilities-search',
    sectionSelector: '#abilities-section',
    rowSelector: '.ability-row',
    getSearchText: row => {
      const name = row.querySelector('.ability-name')?.textContent.toLowerCase() || '';
      const desc = row.querySelector('.ability-description')?.textContent.toLowerCase() || '';
      return `${name} ${desc}`;
    }
  });

  // Locations Search
  attachSearch({
    inputId: 'location-search',
    sectionSelector: '#location-section',
    rowSelector: '.location-row',
    getSearchText: row => {
      const name = row.querySelector('.location-name')?.textContent.toLowerCase() || '';
      const desc = row.querySelector('.location-description')?.textContent.toLowerCase() || '';
      return `${name} ${desc}`;
    }
  });

  // Items Search
  attachSearch({
    inputId: 'items-search',
    sectionSelector: '#items-section',
    rowSelector: '.item-row',
    getSearchText: row => {
      const name   = row.querySelector('.item-name')?.textContent.toLowerCase() || '';
      const effect = row.querySelector('.item-effect')?.textContent.toLowerCase() || '';
      return `${name} ${effect}`;
    }
  });

  // =====================================================================
  // GLOBAL SEARCH
  // =====================================================================

  const globalInput = document.querySelector('#search-section .search-bar');
  const searchResults = document.getElementById('search-results');
  if (!globalInput || !searchResults) return;

  let debounceTimer = null;
  globalInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runGlobalSearch, 50);
  });

  function fuzzyMatch(query, text) {
    return text.toLowerCase().includes(query.toLowerCase());
  }

  function highlight(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) +
      '<mark class="search-highlight">' + text.slice(idx, idx + query.length) + '</mark>' +
      text.slice(idx + query.length);
  }

  function makePokemonTableHeader() {
    const h = document.createElement('div');
    h.className = 'table-header';
    h.innerHTML = `
      <span class="col-check"></span>
      <span class="col-number">Number</span>
      <span class="col-name">Name</span>
      <span class="col-types">Types</span>
      <span class="col-abilities">Abilities</span>
      <span class="col-hp">HP</span>
      <span class="col-atk">Atk</span>
      <span class="col-def">Def</span>
      <span class="col-spa">SpA</span>
      <span class="col-spd">SpD</span>
      <span class="col-spe">Spe</span>
      <span class="col-bst">BST</span>
    `;
    return h;
  }

  function makeMoveTableHeader() {
    const h = document.createElement('div');
    h.className = 'table-header';
    h.innerHTML = `
      <span class="col-name">Name</span>
      <span class="col-type">Type</span>
      <span class="col-cat">Cat</span>
      <span class="col-pwr">Pwr</span>
      <span class="col-acc">Acc</span>
      <span class="col-pp">PP</span>
      <span class="col-effect"></span>
    `;
    return h;
  }

  function buildPokemonRow(p, q) {
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
      <span class="col-name">${highlight(p.name, q)}</span>
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
    return row;
  }

  function buildMoveRow(move, q) {
    const category = move.category.toLowerCase();
    const row = document.createElement('div');
    row.className = 'move-row';
    row.innerHTML = `
      <span class="col-name">${highlight(move.name, q)}</span>
      <span class="col-type">
        <span class="type-badge ${move.type.toLowerCase()}">${move.type.toUpperCase()}</span>
      </span>
      <span class="col-cat" data-category="${category}">
        <img class="move-cat-icon" src="assets/move-category/${category}.png" alt="${move.category}" title="${move.category}">
      </span>
      <span class="col-pwr">${move.power || '—'}</span>
      <span class="col-acc">${move.accuracy || '—'}</span>
      <span class="col-pp">${move.pp.base}/${move.pp.max}</span>
      <span class="col-effect">${move.effect || ''}</span>
    `;
    return row;
  }

  function buildAbilityRow(ability, q) {
    const row = document.createElement('div');
    row.className = 'ability-row';
    row.innerHTML = `
      <div class="ability-name">${highlight(ability.name, q)}</div>
      <div class="ability-description">${ability.summary || ''}</div>
      <div class="ability-chevron">›››</div>
    `;
    return row;
  }

  function buildItemRow(item, q) {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <img class="item-icon" src="${item.icon}" alt="${item.name}" onerror="this.style.display='none'">
      <div class="item-name">${highlight(item.name, q)}</div>
      <div class="item-effect">${item.effect}</div>
      <div class="item-chevron">›››</div>
    `;
    return row;
  }

  function buildTypeRow(type) {
    const row = document.createElement('div');
    row.className = 'type-row';
    row.innerHTML = `<span class="type-badge ${type.name.toLowerCase()}">${type.name.toUpperCase()}</span>`;
    row.addEventListener('click', () => {
      document.querySelectorAll('.type-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      if (window.openTypePanel) window.openTypePanel(type);
    });
    return row;
  }

  function buildTrainerRow(trainer, location, q) {
    const row = document.createElement('div');
    row.className = 'trainer-search-row';
    row.innerHTML = `
      <div class="trainer-search-name">${highlight(trainer.name, q)}</div>
      <div class="trainer-search-location">${location.name}</div>
    `;
    row.addEventListener('click', () => {
      document.querySelectorAll('.trainer-search-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      window.openLocationPanel(location, trainer.name);
    });
    return row;
  }

  function buildLocationRow(location, q) {
    const row = document.createElement('div');
    row.className = 'location-row';
    row.innerHTML = `
      <div class="location-name">${highlight(location.name, q)}</div>
      <div class="location-description">${location.description || ''}</div>
    `;
    row.addEventListener('click', () => {
      document.querySelectorAll('.location-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      window.openLocationPanel(location);
    });
    return row;
  }

  function addCategoryGroup(label, count, tableHeaderFn, rows) {
    const header = document.createElement('div');
    header.className = 'gen-header';
    header.textContent = `${label} (${count})`;
    searchResults.appendChild(header);
    if (tableHeaderFn) searchResults.appendChild(tableHeaderFn());
    rows.forEach(row => searchResults.appendChild(row));
  }

  function runGlobalSearch() {
    searchResults.innerHTML = '';
    const q = globalInput.value.trim();
    if (q.length < 2) return;
    const lq = q.toLowerCase();
    let hasResults = false;

    if (window.pokemonData) {
      const matches = window.pokemonData.filter(p => {
        const name = p.name.toLowerCase();
        const types = (Array.isArray(p.types) ? p.types : [p.types || '']).join(' ').toLowerCase();
        const abilities = [...(Array.isArray(p.abilities) ? p.abilities : []), p.ability || ''].join(' ').toLowerCase();
        return fuzzyMatch(lq, name) || fuzzyMatch(lq, types) || fuzzyMatch(lq, abilities);
      });
      if (matches.length) {
        hasResults = true;
        addCategoryGroup('Pokémon', matches.length, makePokemonTableHeader, matches.map(p => buildPokemonRow(p, q)));
      }
    }

    if (window.moveData) {
      const matches = window.moveData.filter(m => {
        return fuzzyMatch(lq, m.name.toLowerCase()) ||
               fuzzyMatch(lq, (m.type || '').toLowerCase()) ||
               fuzzyMatch(lq, (m.effect || '').toLowerCase());
      });
      if (matches.length) {
        hasResults = true;
        addCategoryGroup('Moves', matches.length, makeMoveTableHeader, matches.map(m => buildMoveRow(m, q)));
      }
    }

    if (window.abilityData) {
      const matches = window.abilityData.filter(a => {
        return fuzzyMatch(lq, a.name.toLowerCase()) ||
               fuzzyMatch(lq, (a.summary || '').toLowerCase());
      });
      if (matches.length) {
        hasResults = true;
        addCategoryGroup('Abilities', matches.length, null, matches.map(a => buildAbilityRow(a, q)));
      }
    }

    if (window.itemData) {
      const matches = window.itemData.filter(i => {
        return fuzzyMatch(lq, i.name.toLowerCase()) ||
               fuzzyMatch(lq, (i.effect || '').toLowerCase());
      });
      if (matches.length) {
        hasResults = true;
        addCategoryGroup('Items', matches.length, null, matches.map(i => buildItemRow(i, q)));
      }
    }

    if (window.typeData) {
      const matches = window.typeData.filter(t => fuzzyMatch(lq, t.name.toLowerCase()));
      if (matches.length) {
        hasResults = true;
        addCategoryGroup('Types', matches.length, null, matches.map(t => buildTypeRow(t)));
      }
    }

    if (window.locationData) {
      const trainerMatches = [];
      window.locationData.forEach(loc => {
        (loc.trainers || []).forEach(trainer => {
          if (fuzzyMatch(lq, trainer.name.toLowerCase())) {
            trainerMatches.push({ trainer, location: loc });
          }
        });
      });
      if (trainerMatches.length) {
        hasResults = true;
        addCategoryGroup('Trainers', trainerMatches.length, null,
          trainerMatches.map(({ trainer, location }) => buildTrainerRow(trainer, location, q)));
      }
    }

    if (window.locationData) {
      const matches = window.locationData.filter(loc => {
        return fuzzyMatch(lq, loc.name.toLowerCase()) ||
               fuzzyMatch(lq, (loc.description || '').toLowerCase());
      });
      if (matches.length) {
        hasResults = true;
        addCategoryGroup('Locations', matches.length, null, matches.map(loc => buildLocationRow(loc, q)));
      }
    }

    if (!hasResults) {
      const msg = document.createElement('div');
      msg.className = 'search-no-results';
      msg.textContent = `No results for "${q}"`;
      searchResults.appendChild(msg);
    }
  }

  // Ability rows in search results need their own click handler
  // (the main ability handler is scoped to #abilities-list)
  searchResults.addEventListener('click', e => {
    const abilityRow = e.target.closest('.ability-row');
    if (abilityRow) {
      document.querySelectorAll('.ability-row').forEach(r => r.classList.remove('active'));
      abilityRow.classList.add('active');
      const abilityName = abilityRow.querySelector('.ability-name').textContent;
      const abilityObj = window.abilityData.find(a => a.name === abilityName);
      if (abilityObj) openAbilityPanel(abilityObj);
      return;
    }

    const itemRow = e.target.closest('.item-row');
    if (itemRow) {
      document.querySelectorAll('.item-row').forEach(r => r.classList.remove('active'));
      itemRow.classList.add('active');
      const itemName = itemRow.querySelector('.item-name').textContent;
      const itemObj = window.itemData.find(i => i.name === itemName);
      if (itemObj) window.openItemPanel(itemObj);
    }
  });

});
