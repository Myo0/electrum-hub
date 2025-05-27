document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('pokemon-search');
  
    function filterPokémon() {
      const q = searchInput.value.trim().toLowerCase();
      const rows = Array.from(
        document.querySelectorAll('#pokemon-section .pokemon-row')
      );
  
      rows.forEach(row => {
        const name  = row.querySelector('.col-name').textContent.toLowerCase();
        const types = Array.from(row.querySelectorAll('.col-types .type-badge'))
                           .map(b => b.textContent.toLowerCase()).join(' ');
        const abil  = row.querySelector('.col-abilities').textContent.toLowerCase();
  
        if (
          name.includes(q) ||
          types.includes(q) ||
          abil.includes(q)
        ) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  
    searchInput.addEventListener('input', filterPokémon);
    // also run once on load
    filterPokémon();
  });