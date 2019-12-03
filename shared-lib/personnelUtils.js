const personnelList = [
  {
    id: 1,
    name: 'Guardias',
    resource_id: 'guards',
    price: 100,
    firingCost: 500,
    attackPower: 1,
    defensePower: 2,
    dailyMaintenanceCost: 100,
  },
  {
    id: 2,
    name: 'Saboteadores',
    resource_id: 'sabots',
    price: 500,
    firingCost: 100,
    attackPower: 2,
    defensePower: 1,
    dailyMaintenanceCost: 500,
  },
  { id: 3, name: 'Hackers', resource_id: 'hackers', price: 20000, firingCost: 5000, dailyMaintenanceCost: 5000 },
]

module.exports.personnelList = personnelList
