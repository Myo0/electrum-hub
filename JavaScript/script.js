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

  // evolutions
  const evoC = document.getElementById('detail-evolution');
  evoC.innerHTML = '<h3>Evolution:</h3>';
  for (let evo of p.evolution) {
    const img = document.createElement('img');
    img.src = `assets/front/${evo.toLowerCase()}.png`;
    img.title = evo;
    evoC.appendChild(img);
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