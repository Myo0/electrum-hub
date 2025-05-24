"use strict";
    // Pokémon Objects
let bulbasaur

    // ------------------------------------------------------------------
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