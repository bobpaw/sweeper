/**
 * @file Module exporting formatTime function.
 * @author Aiden Woodruff
 */

/** @module formatTime.js */

/**
 * Format amounts of seconds into a string.
 * 
 * @param time Amount of seconds.
 * @returns A formatted string.
 * @example
 * formatTime(13); // "0:13"
 * @example
 * formatTime(65); // "1:05"
 * @example
 * formatTime(3706); // "1:01:46"
 */
export default function formatTime(time: number): string {
	const seconds = time % 60;
	time = Math.floor(time / 60);
	const minutes = time % 60;
	time = Math.floor(time / 60);
	const hours = time % 60;
  
	let numericTimes: number[];
	if (hours > 0) {
		numericTimes = [hours, minutes, seconds];
	} else {
		numericTimes = [minutes, seconds];
	}
	const stringTimes = numericTimes.map((x, i) =>
		i === 0 ? x.toString() : x.toString().padStart(2, "0"));

	return stringTimes.join(":");
}
