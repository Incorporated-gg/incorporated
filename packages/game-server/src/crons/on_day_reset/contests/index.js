import mysql from '../../../lib/mysql'
import { getServerDate, getInitialUnixTimestampOfServerDay, getServerDay } from '../../../lib/serverTime'
import { getIncomeScoreboard } from './income'
import { getDestructionScoreboard } from './destruction'
import { getResearchScoreboard } from './research'
import { getRobbingScoreboard } from './robbing'
import { sendAccountHook } from '../../../lib/accountInternalApi'

const contestsList = ['income', 'destruction', 'research', 'robbing']

export default async function runJustAfterNewDay(finishedServerDay) {
  const dayInitialTimestamp = getInitialUnixTimestampOfServerDay(finishedServerDay) / 1000
  const serverDate = getServerDate(dayInitialTimestamp * 1000)
  const hasMondayJustStarted = serverDate.day_of_the_week === 0
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
  const contestWinners = await getContestCurrentScoreboard(ongoingContest.id)

  const messagesCreatedAt = Math.floor(Date.now() / 1000)
  await Promise.all(
    contestWinners.map(async (winner, index) => {
      await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
        winner.user_id,
        null,
        messagesCreatedAt,
        'contest_win',
        JSON.stringify({
          contest_id: ongoingContest.name,
          rank: index + 1,
        }),
      ])
    })
  )

  await sendAccountHook('contest_ended', {
    contestName: ongoingContest.name,
    orderedWinnerIDs: contestWinners.map(rank => rank.user_id),
  })
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

async function getContestCurrentScoreboard(contestID) {
  const scoreBoard = await mysql.query(
    'SELECT user_id, score, rank FROM contests_scoreboards WHERE contest_id = ? ORDER BY rank ASC',
    [contestID]
  )
  return scoreBoard
}

async function updateOngoingContest(ongoingContestID, newScoreboardRaw) {
  // Update scoreboards of ongoing contest
  const newScoreboard = newScoreboardRaw.map((row, index) => {
    return {
      score: parseInt(row.score) || 0,
      rank: index + 1,
      user_id: row.user_id,
    }
  })

  await mysql.query('DELETE FROM contests_scoreboards WHERE contest_id =?', [ongoingContestID])

  await Promise.all(
    newScoreboard.map(async scoreboardRow => {
      await mysql.query('INSERT INTO contests_scoreboards (contest_id, user_id, score, rank) VALUES (?, ?, ?, ?)', [
        ongoingContestID,
        scoreboardRow.user_id,
        scoreboardRow.score,
        scoreboardRow.rank,
      ])
    })
  )
}
