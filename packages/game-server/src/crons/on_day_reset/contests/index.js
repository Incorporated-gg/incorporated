import mysql from '../../../lib/mysql'
import { getServerDate, getInitialUnixTimestampOfServerDay, getServerDay } from 'shared-lib/serverTime'
import { getIncomeScoreboard } from './income'
import { getDestructionScoreboard } from './destruction'
import { getResearchScoreboard } from './research'
import { getRobbingScoreboard } from './robbing'

const contestsList = ['income', 'destruction', 'research', 'robbing']

export default async function runJustAfterNewDay(finishedServerDay) {
  const dayInitialTimestamp = getInitialUnixTimestampOfServerDay(finishedServerDay) / 1000
  const serverDate = getServerDate(dayInitialTimestamp * 1000)
  const hasMondayJustStarted = serverDate.day_of_the_week === 1
  if (!hasMondayJustStarted) return

  // Finish current contest
  const ongoingContest = await mysql.selectOne('SELECT id, name, started_at FROM contests WHERE ended_at IS NULL')
  if (ongoingContest) {
    await updateCurrentContestScoreboard()
    await giveOutContestPrizesAndMessages(ongoingContest)
    await mysql.query('UPDATE contests SET ended_at=? WHERE id=?', [dayInitialTimestamp, ongoingContest.id])
  }

  // Start new contest
  const lastContestID = ongoingContest ? ongoingContest.id : 0
  const newContestName = contestsList[lastContestID % contestsList.length]
  await mysql.query('INSERT INTO contests (name, started_at) VALUES (?, ?)', [newContestName, dayInitialTimestamp])
}

async function giveOutContestPrizesAndMessages(ongoingContest) {
  // TODO
  console.log('TODO: giveOutContestPrizesAndMessages', ongoingContest)
}

export async function updateCurrentContestScoreboard() {
  const ongoingContest = await mysql.selectOne('SELECT id, name, started_at FROM contests WHERE ended_at IS NULL')
  if (!ongoingContest) return

  const weekFirstServerDay = getServerDay(ongoingContest.started_at * 1000)
  let topList = []
  switch (ongoingContest.name) {
    case 'income': {
      topList = await getIncomeScoreboard(weekFirstServerDay)
      break
    }
    case 'destruction': {
      topList = await getDestructionScoreboard(weekFirstServerDay)
      break
    }
    case 'research': {
      topList = await getResearchScoreboard(weekFirstServerDay)
      break
    }
    case 'robbing': {
      topList = await getRobbingScoreboard(weekFirstServerDay)
      break
    }
    default: {
      throw new Error('Unknown contest name')
    }
  }

  await updateOngoingContest(ongoingContest.id, topList)
}

const getPreviousScoreboard = async contestID => {
  const scoreBoard = await mysql.query('SELECT user_id, score, rank FROM contests_scoreboards WHERE contest_id = ?', [
    contestID,
  ])
  return scoreBoard
}

const updateOngoingContest = async (ongoingContestID, newScoreboardRaw) => {
  // Update scoreboards of ongoing contests
  const newScoreboard = newScoreboardRaw.map((row, rank) => {
    const score = row.score ? parseInt(row.score) : 0
    return {
      score: score,
      rank: rank + 1,
      user_id: row.user_id,
    }
  })
  const previousScoreboardRaw = await getPreviousScoreboard(ongoingContestID)
  const previousScoreboard = previousScoreboardRaw.map(row => {
    const score = row.score ? parseInt(row.score) : 0
    return {
      score: score,
      rank: parseInt(row.rank),
      user_id: row.user_id,
    }
  })
  newScoreboard.forEach(async scoreboardRow => {
    const previousUserRecord = previousScoreboard.find(row => row.user_id === scoreboardRow.user_id)
    if (previousUserRecord) {
      if (previousUserRecord.score === scoreboardRow.score && previousUserRecord.rank === scoreboardRow.rank) {
        return
      }
      // The user stays in the scoreboards
      await mysql.query('UPDATE contests_scoreboards SET score = ?, rank = ? WHERE user_id = ? AND contest_id = ?', [
        scoreboardRow.score,
        scoreboardRow.rank,
        scoreboardRow.user_id,
        ongoingContestID,
      ])
    } else {
      // The user has entered the scoreboards
      await mysql.query('INSERT INTO contests_scoreboards (contest_id, user_id, score, rank) VALUES (?, ?, ?, ?)', [
        ongoingContestID,
        scoreboardRow.user_id,
        scoreboardRow.score,
        scoreboardRow.rank,
      ])
    }
  })
  // Cleanup users that left the scoreboards
  const staleRows = previousScoreboard.filter(
    oldRow => !newScoreboard.find(newRow => newRow.user_id === oldRow.user_id)
  )
  staleRows.forEach(async staleRow => {
    await mysql.query('DELETE FROM contests_scoreboards WHERE contest_id = ? AND user_id = ?', [
      ongoingContestID,
      staleRow.user_id,
    ])
  })
}
