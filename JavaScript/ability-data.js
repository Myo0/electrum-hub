window.abilityData = [
  {
    id: "ABILITY_INTIMIDATE",
    name: "Intimidate",

    summary: "Lowers Attack of opponents on switch-in.",

    inBattle:
      "When this Pokémon enters battle, the Attack stat of ALL opposing Pokémon is lowered by one stage.",

    outOfBattle: "When this Pokémon is in the first slot of the players party, there is a 50% chance it will prevent a random wild encounter that would have occurred if the wild Pokémon would be at least 5 levels lower than the Pokémon with intimidate.",

    interactions: [
      "Does not affect Pokémon with Oblivious",
      "Does not affect Pokémon with White Smoke.",
      "Does not affect Pokémon with Hyper Cutter.",
      "Does not affect Pokémon with Clear Body",
      "Does not affect Pokémon with Own Tempo",
      "Does not affect Pokémon with Inner Focus",
      "Does not affect Pokémon with Scrappy",
      "Does not affect Pokémon that are behind a Substitute.",
      "Triggers Rattled if the Pokémon with Rattled has it's stats lowered.",
      "Raises the attack of Pokémon with Guard Dog by one stage, instead of lowering it."
    ]
  },
  {
    id: "ABILITY_LEVITATE",
    name: "Levitate",

    summary: "Immune to Ground-type moves and ground hazards.",

    inBattle:
      "This Pokémon is immune to all Ground-type moves (except Thousand Arrows). It also makes it ungrounded, therefore unaffected by the effects of Arena Trap, Spikes, Toxic Spikes, Sticky Web, Rototiller, and terrain. Additionally, Poison-type Pokémon with Levitate do not remove Toxic Spikes upon switching in.",

    outOfBattle: "",

    interactions: [
      "Negated by Gravity.",
      "Negated by Mold Breaker.",
      "Negated if the Pokémon is holding an Iron Ball.",
      "Negated if the Pokémon is under the effect of Ingrain",
      "Negated if the Pokémon has been hit by Smack Down or Thousand Arrows"
    ]
  },
];
