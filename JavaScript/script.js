"use strict";
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

// 1) Detail‐panel logic
const detailPanel = document.getElementById('pokemon-detail-panel');
const detailClose = document.getElementById('detail-close');
detailClose.onclick = () => {
  detailPanel.classList.remove('open');
  document.body.classList.remove('detail-open');
};

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    detailPanel.classList.remove('open');
    document.body.classList.remove('detail-open');
  });
});

document.querySelectorAll('.sub-nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    detailPanel.classList.remove('open');
    document.body.classList.remove('detail-open');
  });
});

// 2) Render helpers
function renderDetail(p) {
  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-dex').textContent  = `#${p.number}`;

  // unavailable note controlled by available boolean in corresponding pokemon object.
  document.getElementById('detail-note')
    .classList.toggle('hidden', p.available !== false);

  // sprites
  const img = document.getElementById('detail-sprite');
  img.src = `assets/front/${p.name.toLowerCase()}.png`;
  img.alt = p.name;

  // types
  const tp = document.getElementById('detail-types');
  tp.innerHTML = '';
  p.types.forEach(t => {
    const b = document.createElement('span');
    b.className = `type-badge ${t.toLowerCase()}`;
    b.textContent = t;
    tp.appendChild(b);
  });

  // abilities (fallback to ability + hiddenAbility)
  const playerAbs = (Array.isArray(p.abilities)
  ? p.abilities 
  : [p.ability]
).map(name => ({ name, suffix:'', style:'' }));

const hiddenAbs = p.hiddenAbility
  ? [{ name: p.hiddenAbility, suffix:' (H)', style:'italic' }]
  : [];

const aiAbs = p.aiAbility
  ? [{ name: p.aiAbility, suffix:' (AI)', style:'bold italic' }]
  : [];

const allAbilities = [...playerAbs, ...hiddenAbs, ...aiAbs];

const ab = document.getElementById('detail-abilities');
ab.innerHTML = '';
allAbilities.forEach((item, i) => {
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = item.name + item.suffix;
  if (item.style.includes('italic')) link.style.fontStyle = 'italic';
  if (item.style.includes('bold'))   link.style.fontWeight = 'bold';
  ab.appendChild(link);
  if (i < allAbilities.length - 1) ab.append(' | ');
});

  // gender split & catch rate
  document.getElementById('detail-gender')
    .innerHTML = `<strong>Gender ratio:</strong> ${p.gender}`;
  document.getElementById('detail-catchrate')
    .innerHTML = `<strong>Catch rate:</strong> ${p.catchRate}`;

  // stats
// 1) Clear & prepare
const barContainer = document.getElementById('stat-bars');
barContainer.innerHTML = '';

// 2) Helper to map 1–255 → hue 0°→240° for stat bars
function statColor(val) {
  const hue = Math.round((val - 1) / 254 * 240);
  return `hsl(${hue},100%,40%)`;
}

// 3) List out each stat
const statsOrder = [
  ['hp',  'HP:'],
  ['atk', 'Attack:'],
  ['def', 'Defense:'],
  ['spa', 'Sp. Atk:'],
  ['spd', 'Sp. Def:'],
  ['spe', 'Speed:']
];

statsOrder.forEach(([key,label]) => {
  const val = p.stats[key];
  const row = document.createElement('div');
  row.className = 'stat-bar';
  row.innerHTML = `
    <span class="stat-label">${label}</span>
    <span class="stat-value">${val}</span>
    <div class="bar"><div class="fill"></div></div>
  `;
  const fill = row.querySelector('.fill');
  fill.style.width = `${(val / 255) * 100}%`;
  fill.style.backgroundColor = statColor(val);
  barContainer.appendChild(row);
});

// 4) total BST logic
const total = Object.values(p.stats).reduce((a,b) => a + b, 0);
const totalRow = document.createElement('div');
totalRow.className = 'stat-bar total';
totalRow.innerHTML = `
  <span class="stat-label">Total:</span>
  <span class="stat-value">${total}</span>
`;
barContainer.appendChild(totalRow);

// IV-only stat calculator (no EVs)
function renderStatTable(level = 100) {
  const tbody = document.querySelector('#stat-calc-table tbody');
  tbody.innerHTML = '';
  const B = p.stats;

  ['hp','atk','def','spa','spd','spe'].forEach(stat => {
    // formula: floor((2*Base + IV + EV/4) * L/100) + (L+10 for HP, +5 otherwise)
    const basePart = 2 * B[stat];
    const minIV = 0;
    const maxIV = 31;

    let minVal, maxVal;
    if (stat === 'hp') {
      minVal = Math.floor((basePart + minIV) * level/100) + level + 10;
      maxVal = Math.floor((basePart + maxIV) * level/100) + level + 10;
    } else {
      minVal = Math.floor((basePart + minIV) * level/100) + 5;
      maxVal = Math.floor((basePart + maxIV) * level/100) + 5;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${stat.toUpperCase()}</td>
      <td>${minVal}</td>
      <td>${maxVal}</td>
    `;
    tbody.appendChild(tr);
  });
}

const lvlInput = document.getElementById('stat-level');
lvlInput.oninput = () => renderStatTable(+lvlInput.value);

renderStatTable(+lvlInput.value);


  // evolutions
  const evoC = document.getElementById('detail-evolution');
  evoC.innerHTML = '<h3>Evolution:</h3>';

  if (!p.evolution || p.evolution.length === 0) {
    // no evolution case
    const noEvo = document.createElement('div');
    noEvo.textContent = 'Does not evolve';
    noEvo.style.fontStyle = 'italic';
    noEvo.style.fontSize = '1rem';
    noEvo.style.fontWeight = 'bold';
    evoC.appendChild(noEvo);
  } else {

    const evoContainer = document.createElement('div');
    evoContainer.className = 'evolution-container';

    p.evolution.forEach((name, idx) => {
      const step = document.createElement('div');
      step.className = 'evolution-step';

      const sprite = document.createElement('span');
      sprite.className = `pokemon-sprite ${name.toLowerCase()}`;
      sprite.title = name;

      const label = document.createElement('span');
      label.className = 'evo-name';
      label.textContent = name;
      if (name === p.name) label.classList.add('selected');
      label.addEventListener('click', () => {
        const next = window.pokemonData.find(mon => mon.name === name);
        if (next) renderDetail(next);
      });

      step.append(sprite, label);
      evoContainer.appendChild(step);

      if (idx < p.evolution.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'evolution-arrow';
        arrow.textContent = '→';
        evoContainer.appendChild(arrow);
      }
    });

    evoC.appendChild(evoContainer);
  }

  // learnsets
  const learnC = document.getElementById('detail-learnlist');
  learnC.innerHTML = '';
  p.learnset.forEach(m => {
    const li = document.createElement('li');
    li.innerHTML = `<span>Lv.${m.level}</span><span>${m.move}</span>`;
    learnC.appendChild(li);
  });

  detailPanel.classList.add('open');
  document.body.classList.add('detail-open');
}

document.querySelectorAll('.pokemon-row').forEach((row,i) => {
  row.addEventListener('click', () => renderDetail(pokemonData[i]));
});

