const personnelList = [
  {
    name: 'Guardias',
    resource_id: 'guards',
    price: 100,
    firingCost: 50,
    attackPower: 1,
    defensePower: 2,
    dailyMaintenanceCost: 1000,
  },
  {
    name: 'Saboteadores',
    resource_id: 'sabots',
    price: 500,
    firingCost: 250,
    attackPower: 2,
    defensePower: 1,
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
    resource_id: 'thiefs',
    price: 500,
    firingCost: 250,
    dailyMaintenanceCost: 500,
  },
]

module.exports.personnelList = personnelList
