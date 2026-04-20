export interface DrawPool {
  fiveMatch: number;
  fourMatch: number;
  threeMatch: number;
  jackpotRollover: number;
}

export interface DrawSummary {
  winningNumbers: number[];
  winners: {
    user_id: string;
    matchType: 3 | 4 | 5;
    prize: number;
  }[];
  poolDistribution: DrawPool;
}

export const DRAW_CONFIG = {
  POOL_SHARES: {
    FIVE_MATCH: 0.40,
    FOUR_MATCH: 0.35,
    THREE_MATCH: 0.25,
  }
};

/**
 * Generates winning numbers for the month.
 * @param type 'random' or 'algorithmic'
 * @param userScores Optional array of all user scores for algorithmic weighting
 */
export function generateWinningNumbers(type: 'random' | 'algorithmic', userScores: number[] = []): number[] {
  if (type === 'random') {
    const numbers = new Set<number>();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  } else {
    // Algorithmic: Weighted by most frequent user scores
    if (userScores.length === 0) return generateWinningNumbers('random');
    
    const frequency: Record<number, number> = {};
    userScores.forEach(s => {
      frequency[s] = (frequency[s] || 0) + 1;
    });

    const sortedByFreq = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => parseInt(entry[0]));

    // Take top 5 common numbers (or mix with random if less than 5)
    const winning = new Set(sortedByFreq.slice(0, 5));
    while (winning.size < 5) {
      winning.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(winning).sort((a, b) => a - b);
  }
}

/**
 * Calculates results for a draw based on entries and total pool.
 */
export function calculateDrawResults(
  winningNumbers: number[], 
  entries: { user_id: string, scores: number[] }[],
  totalPool: number,
  previousJackpot: number = 0
): DrawSummary {
  const winningSet = new Set(winningNumbers);
  const winners: DrawSummary['winners'] = [];
  
  const matches = {
    5: [] as string[],
    4: [] as string[],
    3: [] as string[]
  };

  entries.forEach(entry => {
    const matchCount = entry.scores.filter(s => winningSet.has(s)).length;
    if (matchCount === 5) matches[5].push(entry.user_id);
    else if (matchCount === 4) matches[4].push(entry.user_id);
    else if (matchCount === 3) matches[3].push(entry.user_id);
  });

  const pool: DrawPool = {
    fiveMatch: (totalPool * DRAW_CONFIG.POOL_SHARES.FIVE_MATCH) + previousJackpot,
    fourMatch: totalPool * DRAW_CONFIG.POOL_SHARES.FOUR_MATCH,
    threeMatch: totalPool * DRAW_CONFIG.POOL_SHARES.THREE_MATCH,
    jackpotRollover: 0
  };

  // 5-match distribution
  if (matches[5].length > 0) {
    const prizePerWinner = pool.fiveMatch / matches[5].length;
    matches[5].forEach(uid => winners.push({ user_id: uid, matchType: 5, prize: prizePerWinner }));
  } else {
    pool.jackpotRollover = pool.fiveMatch;
  }

  // 4-match distribution
  if (matches[4].length > 0) {
    const prizePerWinner = pool.fourMatch / matches[4].length;
    matches[4].forEach(uid => winners.push({ user_id: uid, matchType: 4, prize: prizePerWinner }));
  }

  // 3-match distribution
  if (matches[3].length > 0) {
    const prizePerWinner = pool.threeMatch / matches[3].length;
    matches[3].forEach(uid => winners.push({ user_id: uid, matchType: 3, prize: prizePerWinner }));
  }

  return {
    winningNumbers,
    winners,
    poolDistribution: pool
  };
}
