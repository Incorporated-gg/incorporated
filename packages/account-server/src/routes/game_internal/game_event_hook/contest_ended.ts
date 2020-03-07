type EventDataContestEnded = {
  orderedWinnerIDs: number[]
}
export default async function hookContestEnded(data: EventDataContestEnded): Promise<void> {
  console.log(data)
}
