const weapons = {
  greataxe: {
    label: 'Hache double',
    icon: 'game-icons:battle-axe',
  },
  greatsword: {
    label: 'Epée longue',
    icon: 'vaadin:sword',
  },
  warhammer: {
    label: "Marteau d'armes",
    icon: 'game-icons:thor-hammer',
  },
  spear: {
    label: 'Lance',
    icon: 'mdi:spear',
  },
  bow: {
    label: 'Arc',
    icon: 'mdi:bow-arrow',
  },
  firestaff: {
    label: 'Bâton de feu',
    icon: 'mdi:fire',
  },
  musket: {
    label: 'Mousquet',
    icon: 'game-icons:musket',
  },
  hatchet: {
    label: 'Hachette',
    icon: 'game-icons:hatchet',
  },
  lifestaff: {
    label: 'Bâton de vie',
    icon: 'mdi:magic-staff',
  },
  ice_gauntlet: {
    label: 'Gantelet de glace',
    icon: 'icon-park-outline:snowflake',
  },
  void_gauntlet: {
    label: 'Gantelet du néant',
    icon: 'ph:spiral-bold',
  },
  sword_shield: {
    label: 'Epée & bouclier',
    icon: 'fa-solid:shield-alt',
  },
  rapier: {
    label: 'Rapière',
    icon: 'game-icons:sword-hilt',
  },
};

const labelToKey = (label) => {
  return Object.keys(weapons).find((key) => weapons[key].label === label);
};

module.exports = {
  weapons,
  labelToKey,
};