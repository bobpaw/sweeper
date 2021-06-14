/**
 * Format amounts of seconds into a string.
 * 
 * @param time {number} Amount of seconds.
 * @example
 * formatTime(13) // "0:13"
 * @example
 * formatTime(65) // "1:05"
 * @example
 * formatTime(3706) // "1:01:46"
 */
export default function formatTime(time: number): string {
	let seconds = time % 60;
	time = Math.floor(time / 60);
	let minutes = time % 60;
	time = Math.floor(time / 60);
	let hours = time % 60;
  
	let numericTimes: number[];
	if (hours > 0) {
		numericTimes = [hours, minutes, seconds];
	} else {
		numericTimes = [minutes, seconds];
	}
	let stringTimes = numericTimes.map((x, i) =>
		i === 0 ? x.toString() : x.toString().padStart(2, "0"));

	return stringTimes.join(":");
}
