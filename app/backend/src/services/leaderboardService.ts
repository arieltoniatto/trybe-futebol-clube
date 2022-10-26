import IMatch from '../Interface/Match/IMatch';
import Match from '../database/models/MatchModel';
import ILeaderboard from '../Interface/Leaderboard/ILeaderboard';
import generateBoard from '../helpers/leaderboard';

export default class LeaderboardService {
  public getFinishedMatches = async (): Promise<IMatch[]> => {
    const matches = await Match.findAll({
      where: { inProgress: false },
      include: [{ all: true, attributes: ['teamName'] }],
    });
    return matches;
  };

  public getLeaderboard = async (isHome: boolean): Promise<ILeaderboard[]> => {
    const matches = await this.getFinishedMatches();
    let names: string[] = [];
    if (isHome) {
      names = matches.map(({ teamHome }) => teamHome?.teamName) as string[];
    } else {
      names = matches.map(({ teamAway }) => teamAway?.teamName) as string[];
    }
    // const allTNames = matches.map(({ teamHome }) => teamHome?.teamName);

    const teamsNames = names.filter((v, i) => names.indexOf(v) === i) as string[];
    console.log(teamsNames);

    const board = generateBoard(teamsNames as string[], matches, isHome);

    // https://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields

    const sortedBoard = board.sort(
      (a, b) => b.totalPoints - a.totalPoints
      || b.goalsBalance - a.goalsBalance || b.goalsFavor - a.goalsFavor || a.goalsOwn - b.goalsOwn,
    );

    return sortedBoard;
  };
}