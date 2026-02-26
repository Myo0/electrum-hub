const abilityPanel = document.getElementById("ability-panel");
const abilityPanelClose = document.getElementById("ability-panel-close");

abilityPanelClose.addEventListener("click", () => {
    abilityPanel.classList.remove("open");
});

function openAbilityPanel(ability) {

    abilityPanel.classList.add("open");

    document.getElementById("ability-panel-name").textContent = ability.name;
    const inSection = document.getElementById("ability-in-section");
    const inText = document.getElementById("ability-panel-in-battle");

    if (ability.inBattle && ability.inBattle.trim() !== "") {
        inSection.style.display = "block";
        inText.textContent = ability.inBattle;
    } else {
        inSection.style.display = "none";
    }


    const outSection = document.getElementById("ability-out-section");
    const outText = document.getElementById("ability-panel-out-of-battle");

    if (ability.outOfBattle && ability.outOfBattle.trim() !== "") {
        outSection.style.display = "block";
        outText.textContent = ability.outOfBattle;
    } else {
        outSection.style.display = "none";
    }

    const interactionsList = document.getElementById("ability-panel-interactions");
    interactionsList.innerHTML = "";

    if (ability.interactions && ability.interactions.length) {
        ability.interactions.forEach(interaction => {
            const li = document.createElement("li");
            li.textContent = interaction;
            interactionsList.appendChild(li);
        });
    }

    populateAbilityPokemon(ability.name);
}

function populateAbilityPokemon(abilityName) {

    const container = document.getElementById("ability-panel-pokemon");
    container.innerHTML = "";

    const filtered = window.pokemonData.filter(p =>
        p.ability === abilityName ||
        p.hiddenAbility === abilityName ||
        (p.abilities && p.abilities.includes(abilityName))
    );

    filtered.forEach(pokemon => {

        const row = document.createElement("div");
        row.className = "pokemon-row";

        // ----------------------------
        // Ability column logic
        // ----------------------------

        let abilityDisplay = "";

        const normalAbilities = Array.isArray(pokemon.abilities)
            ? pokemon.abilities
            : pokemon.ability
                ? [pokemon.ability]
                : [];

        if (pokemon.hiddenAbility === abilityName) {
            abilityDisplay = abilityName + " (H)";
        } 
        else if (pokemon.aiAbility === abilityName) {
            abilityDisplay = abilityName + " (AI)";
        } 
        else {
            abilityDisplay = normalAbilities.join(" | ");
        }

        // ----------------------------
        // Stats
        // ----------------------------

        const s = pokemon.stats || {};
        const bst = Object.values(s).reduce((a, b) => a + b, 0);

        row.innerHTML = `
            <span class="col-number">
                <span class="pokemon-sprite ${pokemon.name.toLowerCase().replace(/\s+/g, '-')}"></span>
                <span class="number-text">${pokemon.number}</span>
            </span>

            <span class="col-name">${pokemon.name}</span>

            <span class="col-types">
                ${(pokemon.types || []).map(t =>
                    `<span class="type-badge ${t.toLowerCase()}">${t}</span>`
                ).join('')}
            </span>

            <span class="col-abilities">${abilityDisplay}</span>

            <span class="col-hp">${s.hp ?? ''}</span>
            <span class="col-atk">${s.atk ?? ''}</span>
            <span class="col-def">${s.def ?? ''}</span>
            <span class="col-spa">${s.spa ?? ''}</span>
            <span class="col-spd">${s.spd ?? ''}</span>
            <span class="col-spe">${s.spe ?? ''}</span>
            <span class="col-bst">${bst}</span>
        `;

        container.appendChild(row);
    });
}

// Ability links inside Pokémon panel
document.addEventListener("click", (e) => {
    const link = e.target.closest(".ability-link");
    if (!link) return;

    e.preventDefault();
    e.stopPropagation();

    const abilityName = link.textContent
        .replace(/\s*\(.*?\)/g, '')
        .trim();

    const abilityObj = window.abilityData.find(a => a.name === abilityName);
    if (!abilityObj) return;

    openAbilityPanel(abilityObj);
});

// Expose globally
window.openAbilityPanel = openAbilityPanel;



