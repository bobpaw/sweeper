/**
 * @file Leaderboard score entry schema.
 * @author Aiden Woodruff
 */

/**
 * Score entry.
 */
export interface Score {
	name: string;
	time: number;
	width: number;
	height: number;
	mines: number;
	rclicks: number;
	clicks: number;
	board_score: number;
}
