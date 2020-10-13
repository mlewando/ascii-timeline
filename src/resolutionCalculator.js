import gcd from "compute-gcd";
import {
  differenceInYears,
  isEqual,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
  eachYearOfInterval,
} from "date-fns";

export function calculateResolution(timePoints) {
  const hasNotFullYear = timePoints.some(
    (time) => !isEqual(startOfYear(time), time)
  );
  const hasNotFullMonth = timePoints.some(
    (time) => !isEqual(startOfMonth(time), time)
  );
  const hasNotFullDay = timePoints.some(
    (time) => !isEqual(startOfDay(time), time)
  );
  const hasNotFullHour = timePoints.some(
    (time) => !isEqual(startOfHour(time), time)
  );
  const hasNotFullMinute = timePoints.some(
    (time) => !isEqual(startOfMinute(time), time)
  );
  const hasNotFullSecond = timePoints.some(
    (time) => !isEqual(startOfSecond(time), time)
  );
  if (!hasNotFullYear) {
    const periodsInYears = getPeriodsDurations(
      timePoints,
      differenceInYears
    ).sort();
    const resolutionInYears = gcd(periodsInYears);
    const smallestPeriod = periodsInYears[0];
    const pointWidth = Math.ceil((5 * resolutionInYears) / smallestPeriod);
    return {
      diff: differenceInYears,
      toPoints: (duration) => (duration * pointWidth) / resolutionInYears,
      timeline: [
        {
          timePoints: eachYearOfInterval,
          format: (time) => `${time.getYear()}`,
          width: () => 1,
        },
      ],
    };
  }
}

function getPeriodsDurations(timePoints, diffFunction) {
  const [, ...periodsDurations] = timePoints.map((time, i, array) =>
    i > 0 ? diffFunction(time, array[i - 1]) : 0
  );
  return periodsDurations;
}
