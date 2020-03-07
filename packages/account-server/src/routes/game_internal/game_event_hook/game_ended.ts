type EventDataGameEnded = {
  incomeRankingOrderedPlayerIDs: number[]
}
export default async function hookGameEnded(data: EventDataGameEnded): Promise<void> {
  console.log(data)
}
