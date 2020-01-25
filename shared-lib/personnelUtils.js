const personnelList = [
  {
    name: 'Guardias',
    resource_id: 'guards',
    price: 100,
    firingCost: 50,
    combatPower: 1,
    dailyMaintenanceCost: 1000,
  },
  {
    name: 'Saboteadores',
    resource_id: 'sabots',
    price: 500,
    firingCost: 250,
    combatPower: 1,
    robbingPower: 5,
    dailyMaintenanceCost: 500,
  },
  {
    name: 'Espías',
    resource_id: 'spies',
    price: 2500,
    firingCost: 500,
    dailyMaintenanceCost: 1000,
  },
  {
    name: 'Ladrones',
    resource_id: 'thieves',
    price: 500,
    firingCost: 250,
    combatPower: 0.2,
    robbingPower: 50,
    dailyMaintenanceCost: 500,
  },
]

module.exports.personnelList = personnelList
