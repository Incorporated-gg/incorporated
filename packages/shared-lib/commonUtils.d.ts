interface ContestReward {
    rankNeeded: number;
    gold: number;
    xp: number;
}
export declare function getContestRewards(contestID: string, position: number): ContestReward;
export {};
