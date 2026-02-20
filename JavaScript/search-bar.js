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

});
