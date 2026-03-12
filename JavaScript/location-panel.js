const locationPanel     = document.getElementById('location-panel');
const locationPanelClose = document.getElementById('location-panel-close');

locationPanelClose.addEventListener('click', () => {
  locationPanel.classList.remove('open');
  document.querySelectorAll('.location-row').forEach(r => r.classList.remove('active'));
});

function openLocationPanel(location) {
  // Left-side mutual exclusivity: close ability panel and move panel
  document.getElementById('ability-panel').classList.remove('open');
  document.querySelectorAll('.ability-row').forEach(r => r.classList.remove('active'));
  document.getElementById('move-panel').classList.remove('open');
  document.querySelectorAll('.move-row').forEach(r => r.classList.remove('active'));

  locationPanel.classList.add('open');

  // Title & description
  document.getElementById('location-panel-title').textContent = location.name;
  document.getElementById('location-panel-description').textContent = location.description || '';

  // Encounters
  renderEncounters(location.encounters || []);

  // Trainers
  renderTrainers(location.trainers || []);
}

// ---- Encounters ----
function renderEncounters(encounters) {
  const container = document.getElementById('location-panel-encounters');
  container.innerHTML = '';

  if (!encounters.length) {
    container.innerHTML = '<p style="color:#999;font-size:0.82rem;">No wild encounters.</p>';
    return;
  }

  // Tab strip
  const tabStrip = document.createElement('div');
  tabStrip.className = 'enc-tabs';

  // Table container (swapped by tab click)
  const tableWrap = document.createElement('div');

  encounters.forEach((enc, idx) => {
    const tab = document.createElement('button');
    tab.className = 'enc-tab' + (idx === 0 ? ' active' : '');
    tab.textContent = enc.method;
    tab.addEventListener('click', () => {
      tabStrip.querySelectorAll('.enc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderEncTable(tableWrap, enc.pokemon);
    });
    tabStrip.appendChild(tab);
  });

  container.appendChild(tabStrip);
  container.appendChild(tableWrap);
  renderEncTable(tableWrap, encounters[0].pokemon);
}

function renderEncTable(wrap, pokemon) {
  wrap.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'enc-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Pokémon</th>
        <th>Type</th>
        <th>Abilities</th>
        <th>Level</th>
        <th>Rate</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  pokemon.forEach(p => {
    const tr = document.createElement('tr');
    const levelStr = p.minLevel === p.maxLevel
      ? `${p.minLevel}`
      : `${p.minLevel}–${p.maxLevel}`;
    const rateStr = p.rate !== null ? `${p.rate}%` : '—';
    const iconSlug = p.name.toLowerCase().replace(/\s+/g, '-');

    const pkmn = window.pokemonData && window.pokemonData.find(
      pk => pk.name.toLowerCase() === p.name.toLowerCase()
    );
    const typesArr = pkmn ? (Array.isArray(pkmn.types) ? pkmn.types : [pkmn.types]) : [];
    const typesHtml = typesArr.map(t => `<span class="type-badge ${t.toLowerCase()}">${t}</span>`).join('');
    let abilitiesHtml = '—';
    if (pkmn) {
      if (Array.isArray(pkmn.abilities) && pkmn.abilities.length) {
        abilitiesHtml = pkmn.abilities.join(', ');
      } else if (pkmn.ability) {
        abilitiesHtml = pkmn.ability;
      }
    }

    tr.innerHTML = `
      <td class="enc-pkmn-name">
        <div class="enc-name-inner">
          <img class="enc-pkmn-icon" src="/assets/party-icons/${iconSlug}.png" alt="" onerror="this.style.display='none'">
          <span>${p.name}</span>
        </div>
      </td>
      <td class="enc-types"><div class="enc-types-inner">${typesHtml}</div></td>
      <td class="enc-abilities">${abilitiesHtml}</td>
      <td class="enc-level">${levelStr}</td>
      <td class="enc-rate">${rateStr}</td>
    `;
    // Click opens Pokémon panel
    tr.addEventListener('click', () => {
      const pkmn = window.pokemonData && window.pokemonData.find(
        pk => pk.name.toLowerCase() === p.name.toLowerCase()
      );
      if (pkmn) window.renderDetail(pkmn);
    });
    tbody.appendChild(tr);
  });
  wrap.appendChild(table);
}

// ---- Trainers ----
function renderTrainers(trainers) {
  const container = document.getElementById('location-panel-trainers');
  container.innerHTML = '';

  if (!trainers.length) {
    container.innerHTML = '<p style="color:#999;font-size:0.82rem;">No trainers.</p>';
    return;
  }

  trainers.forEach(trainer => {
    const item = document.createElement('div');
    item.className = 'trainer-item';

    const header = document.createElement('div');
    header.className = 'trainer-header';
    header.innerHTML = `
      <span class="trainer-name">${trainer.name}</span>
      <span class="trainer-toggle">▼</span>
    `;

    const teamDiv = document.createElement('div');
    teamDiv.className = 'trainer-team';

    trainer.team.forEach(p => {
      const card = document.createElement('div');
      card.className = 'team-pokemon-card';

      const abilityHtml = p.ability
        ? `<a class="ability-link" href="#">${p.ability}</a>`
        : '—';
      const itemHtml    = p.item   || '—';
      const natureHtml  = p.nature || '—';
      const statusHtml  = p.status ? `<span style="color:#dc3545">${p.status}</span>` : '—';

      const movesHtml = (p.moves || []).map(m =>
        `<span class="team-move move-link" data-move="${m}">${m}</span>`
      ).join('');

      const spriteSlug = p.name.toLowerCase();
      const pkmnData = window.pokemonData && window.pokemonData.find(
        pk => pk.name.toLowerCase() === p.name.toLowerCase()
      );
      const cardTypesArr = pkmnData ? (Array.isArray(pkmnData.types) ? pkmnData.types : [pkmnData.types]) : [];
      const cardTypesHtml = cardTypesArr.map(t => `<span class="type-badge ${t.toLowerCase()}">${t}</span>`).join('');

      const s = pkmnData && pkmnData.stats ? pkmnData.stats : null;
      const statDefs = [
        { key: 'hp',  label: 'HP'  },
        { key: 'atk', label: 'Atk' },
        { key: 'def', label: 'Def' },
        { key: 'spa', label: 'SpA' },
        { key: 'spd', label: 'SpD' },
        { key: 'spe', label: 'Spe' },
      ];
      const statsHtml = s ? `
        <div class="team-stat-bars">
          ${statDefs.map(({ key, label }) => {
            const val = s[key] ?? 0;
            const pct = Math.min(100, Math.round((val / 255) * 100));
            const color = val >= 100 ? '#4caf50' : val >= 60 ? '#f39c12' : '#dc3545';
            return `<div class="team-stat-row">
              <span class="team-stat-label">${label}</span>
              <div class="team-stat-bar"><div class="team-stat-fill" style="width:${pct}%;background:${color}"></div></div>
              <span class="team-stat-value">${val}</span>
            </div>`;
          }).join('')}
        </div>` : '';

      const ivs = p.ivs || {};
      const ivsHtml = `
        <div class="team-iv-col">
          ${statDefs.map(({ key, label }) => {
            const val = ivs[key] ?? 31;
            const color = val === 31 ? '#4caf50' : val >= 20 ? '#f39c12' : '#dc3545';
            return `<div class="team-iv-row">
              <span class="team-iv-label">${label}</span>
              <span class="team-iv-value" style="color:${color}">${val}</span>
            </div>`;
          }).join('')}
        </div>`;

      card.innerHTML = `
        <img class="team-pokemon-sprite" src="/assets/front/${spriteSlug}.png" alt="" onerror="this.style.display='none'">
        <div class="team-pokemon-info">
          <div class="team-pokemon-name">${p.name}</div>
          ${cardTypesHtml ? `<div class="team-pokemon-types">${cardTypesHtml}</div>` : ''}
          <div class="team-pokemon-level">Lv. ${p.level ?? '?'}</div>
          <div class="team-pokemon-details">
            <span class="team-detail-label">Held Item</span><span>${itemHtml}</span>
            <span class="team-detail-label">Ability</span><span>${abilityHtml}</span>
            <span class="team-detail-label">Nature</span><span>${natureHtml}</span>
            <span class="team-detail-label">Status</span><span>${statusHtml}</span>
          </div>
        </div>
        ${ivsHtml}
        ${statsHtml}
        <div class="team-moves">${movesHtml}</div>
      `;

      teamDiv.appendChild(card);
    });

    header.addEventListener('click', () => {
      item.classList.toggle('open');
    });

    item.appendChild(header);
    item.appendChild(teamDiv);
    container.appendChild(item);
  });
}

// Move link clicks inside trainer cards
document.addEventListener('click', e => {
  const moveLink = e.target.closest('.team-move.move-link');
  if (!moveLink) return;
  e.preventDefault();
  e.stopPropagation();
  const moveName = moveLink.dataset.move;
  const move = window.moveData && window.moveData.find(m => m.name === moveName);
  if (!move) return;
  document.querySelectorAll('.move-row').forEach(r => r.classList.remove('active'));
  window.openMovePanel(move, true);
});

window.openLocationPanel = openLocationPanel;
