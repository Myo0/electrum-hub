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

function renderDetail(p) {
  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-dex').textContent  = `#${p.number}`;

  document.getElementById('detail-note')
    .classList.toggle('hidden', p.available !== false);

  // sprites
  const img = document.getElementById('detail-sprite');
  img.src = `assets/front/${p.name.toLowerCase()}.png`;
  img.alt = p.name;

  // types
  const tp = document.getElementById('detail-types');
  tp.innerHTML = '';

  const types = ([]).concat(p.types || []).filter(Boolean);
  types.forEach(t => {
    const b = document.createElement('span');
    b.className = `type-badge ${t.toLowerCase()}`;
    b.textContent = t;
    tp.appendChild(b);
  });

  const ab = document.getElementById('detail-abilities');
  ab.innerHTML = '';

  const playerList = Array.isArray(p.abilities)
    ? p.abilities : p.ability ? [p.ability] : [];

  const hiddenList = p.hiddenAbility ? [p.hiddenAbility] : [];
  const aiList = p.aiAbility ? [p.aiAbility] : [];

  const all = [...playerList, ...hiddenList, ...aiList].filter(Boolean);

  all.forEach((name, idx) => {
    let suffix = '';
    let italic = false;
    let bold = false;

    if (hiddenList.includes(name)) {
      suffix = ' (H)';
      italic = true;
    }
    if (aiList.includes(name)) {
      suffix = ' (AI)';
      italic = true;
      bold = true;
    }

    const link = document.createElement('a');
    link.classList.add('ability-link');
    link.href        = '#';
    link.textContent = name + suffix;
    if (italic) link.style.fontStyle  = 'italic';
    if (bold)   link.style.fontWeight = 'bold';

    ab.appendChild(link);
    if (idx < all.length - 1) {
      ab.append(' | ');
    }
  });

  // gender split & catch rate
  document.getElementById('detail-gender')
    .innerHTML = `<strong>Gender ratio:</strong> ${p.gender}`;
  document.getElementById('detail-catchrate')
    .innerHTML = `<strong>Catch rate:</strong> ${p.catchRate}`;
  
  // held item
  const heldSection = document.getElementById('detail-held-item-section');
  const hi = document.getElementById('detail-held-item');
  if (p.heldItem && p.heldItem.name) {
    hi.textContent = `${p.heldItem.name} (${p.heldItem.rate}%)`;
    heldSection.style.display = '';
  } else {
    heldSection.style.display = 'none';
  }

  // stats
const barContainer = document.getElementById('stat-bars');
barContainer.innerHTML = '';

function statColor(val) {
  const hue = Math.round((val - 1) / 254 * 240);
  return `hsl(${hue},100%,40%)`;
}

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
  const gamma = 0.6125;
  const norm = val / 255;
  const curved = Math.pow(norm, gamma);
  fill.style.width = `${curved * 100}%`;
  fill.style.backgroundColor = statColor(val);
  barContainer.appendChild(row);
});

const total = Object.values(p.stats).reduce((a,b) => a + b, 0);
const totalRow = document.createElement('div');
totalRow.className = 'stat-bar total';
totalRow.innerHTML = `
  <span class="stat-label">Total:</span>
  <span class="stat-value">${total}</span>
`;
barContainer.appendChild(totalRow);

function renderStatTable(level = 100) {
  const tbody = document.querySelector('#stat-calc-table tbody');
  tbody.innerHTML = '';
  const B = p.stats;
  const negN = 0.9, neuN = 1.0, posN = 1.1;

  ['hp','atk','def','spa','spd','spe'].forEach(stat => {
    const base = B[stat];
    let minNeg, minNeu, maxNeu, maxPos;

    if (stat === 'hp') {
      const calcHP = iv => 
        Math.floor((2*base + iv) * level/100) + level + 10;
      minNeu = calcHP(0);
      maxNeu = calcHP(31);
      minNeg = minNeu;
      maxPos = maxNeu;
    } else {
      const calcPre = iv =>
        Math.floor((2*base + iv) * level/100) + 5;
      const neu0 = calcPre(0);
      const neu31 = calcPre(31);

      minNeg = Math.floor(neu0 * negN);
      minNeu = Math.floor(neu0 * neuN);
      maxNeu = Math.floor(neu31 * neuN);
      maxPos = Math.floor(neu31 * posN);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${stat.toUpperCase()}</td>
      <td>${minNeg}</td>
      <td>${minNeu}</td>
      <td>${maxNeu}</td>
      <td>${maxPos}</td>
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

  // 1) SPLIT‐EVOLUTION with optional preEvolution
  if (Array.isArray(p.evolutionSplit) && p.evolutionSplit.length) {
    const container = document.createElement('div');
    container.className = 'evolution-split-horizontal';

    // a) preEvolution chain (e.g. Pichu → ...)
    if (Array.isArray(p.preEvolution)) {
      p.preEvolution.forEach((name, i) => {
        const step = document.createElement('div');
        step.className = 'evolution-step';
        const spr = document.createElement('span');
        spr.className = `pokemon-sprite ${name.toLowerCase()}`;
        spr.title = name;
        const lbl = document.createElement('span');
        lbl.className = 'evo-name';
        lbl.textContent = name;
        if (name === p.name) lbl.classList.add('selected');
        lbl.style.cursor = 'pointer';
        lbl.addEventListener('click', () => {
          const next = window.pokemonData.find(m => m.name === name);
          if (next) renderDetail(next);
        });
        step.append(spr, lbl);
        container.appendChild(step);

        // arrow into base form
        const arrowIn = document.createElement('span');
        arrowIn.className = 'evolution-arrow split';
        arrowIn.textContent = '→';
        container.appendChild(arrowIn);
      });
    }

    // b) Base form (e.g. Pikachu)
    const baseStep = document.createElement('div');
    baseStep.className = 'evolution-step';
    const baseSpr = document.createElement('span');
    baseSpr.className = `pokemon-sprite ${p.name.toLowerCase()}`;
    baseSpr.title = p.name;
    const baseLbl = document.createElement('span');
    baseLbl.className = 'evo-name';
    baseLbl.textContent = p.name;
    if (p.name === p.name) baseLbl.classList.add('selected');
    baseStep.append(baseSpr, baseLbl);
    container.appendChild(baseStep);

    // c) Branches off to the right
    const branches = document.createElement('div');
    branches.className = 'split-right-branches';

    p.evolutionSplit.forEach((name, idx) => {
      const branch = document.createElement('div');
      branch.className = 'evolution-branch-horizontal';

      // right-pointing arrow
      const arrow = document.createElement('span');
      arrow.className = 'evolution-arrow split';
      arrow.textContent = '→';

      if (Array.isArray(p.evolutionMethod)) {
        arrow.title = p.evolutionMethod[idx] || '';
      } else if (typeof p.evolutionMethod === 'string') {
        arrow.title = p.evolutionMethod;
      }
      branch.appendChild(arrow);

      const spr = document.createElement('span');
      const name1 = name.replace('♀' || '♂', '')
      const key = name1.toLowerCase().trim().replace(/\s+/g, '-');
      spr.className = `pokemon-sprite ${key}`;
      spr.title = name;
      const lbl = document.createElement('span');
      lbl.textContent = name;
      lbl.style.cursor = 'pointer';
      lbl.addEventListener('click', () => {
        const next = window.pokemonData.find(m => m.name === name);
        if (next) renderDetail(next);
      });
      branch.append(spr, lbl);

      branches.append(branch);
    });

    container.append(branches);
    evoC.append(container);

  } else if (!p.evolution || p.evolution.length === 0) {
    const noEvo = document.createElement('div');
    noEvo.textContent = 'Does not evolve';
    noEvo.style.fontStyle = 'italic';
    evoC.appendChild(noEvo);

  } else {
    const evoContainer = document.createElement('div');
    evoContainer.className = 'evolution-container';

    p.evolution.forEach((name, idx) => {
      // step
      const step = document.createElement('div');
      step.className = 'evolution-step';

      const sprite = document.createElement('span');

      const key = name.toLowerCase().trim().replace(/\s+/g, '-');

      sprite.className = `pokemon-sprite ${key}`;
      sprite.title = name;

      const label = document.createElement('span');

      label.className = 'evo-name';
      label.textContent = name;
      
      if (name === p.name) label.classList.add('selected');

      label.style.cursor = 'pointer';
      label.addEventListener('click', () => {
        const next = window.pokemonData.find(m => m.name === name);
        if (next) renderDetail(next);
      });
      step.append(sprite, label);
      evoContainer.appendChild(step);

      if (idx < p.evolution.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'evolution-arrow';
        arrow.textContent = '→';
        if (Array.isArray(p.evolutionMethod)) {
          arrow.title = p.evolutionMethod[idx] || '';
        } else if (typeof p.evolutionMethod === 'string') {
          arrow.title = p.evolutionMethod;
        }
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

// make the open pokemon panel function globally callable
window.openPokemonPanel = openPokemonPanel;