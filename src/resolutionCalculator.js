import gcd from "compute-gcd";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isEqual,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
  differenceInHours,
  eachDayOfInterval,
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
    return calculateYearResolution(timePoints);
  } else if (!hasNotFullMonth) {
    return calculateMonthResolution(timePoints);
  } else if (!hasNotFullDay) {
    return calculateDayResolution(timePoints);
  } else if (!hasNotFullHour) {
    return calculateHourResolution(timePoints);
  }
}

function calculateHourResolution(timePoints) {
  const periods = getPeriodsDurations(timePoints, differenceInHours).sort(
    (a, b) => a - b
  );
  const resolution = gcd(periods);
  const smallestPeriod = periods[0];
  const pointWidth = Math.ceil((3 * resolution) / smallestPeriod);
  const toPoints = (duration) => (duration * pointWidth) / resolution;
  return {
    diff: differenceInHours,
    toPoints,
    timeline: [
      {
        timePoints: eachMonthOfInterval,
        format: (time) => format(time, "yyyy-MM"),
        width: (month) =>
          differenceInHours(endOfMonth(month), startOfMonth(month)),
      },
      {
        timePoints: eachDayOfInterval,
        format: (time) => format(time, "dd"),
        width: () => 24,
      },
    ],
  };
}
function calculateDayResolution(timePoints) {
  const periods = getPeriodsDurations(timePoints, differenceInDays).sort(
    (a, b) => a - b
  );
  const resolution = gcd(periods);
  const smallestPeriod = periods[periods.length - 1];
  const pointWidth = Math.ceil((3 * resolution) / smallestPeriod);
  const shortestMonth = Math.min(
    eachMonthOfInterval({
      start: Math.min(timePoints),
      end: Math.max(timePoints),
    }).map((month) => differenceInDays(endOfMonth(month), startOfMonth(month)))
  );
  const toPoints = (duration) => (duration * pointWidth) / resolution;
  const shortestMonthWidth = toPoints(shortestMonth);
  if (shortestMonthWidth < 8) {
    return {
      diff: differenceInDays,
      toPoints,
      timeline: [
        {
          timePoints: eachYearOfInterval,
          format: (time) => `${time.getYear()}`,
          width: (year) => differenceInDays(endOfYear(year), startOfYear(year)),
        },
        {
          timePoints: eachMonthOfInterval,
          format: (time) => `${time.getMonth()}`,
          width: (month) =>
            differenceInDays(endOfMonth(month), startOfMonth(month)),
        },
      ],
    };
  }
  return {
    diff: differenceInDays,
    toPoints,
    timeline: [
      {
        timePoints: eachMonthOfInterval,
        format: (time) => format(time, "yyyy-MM"),
        width: (month) =>
          differenceInDays(endOfMonth(month), startOfMonth(month)),
      },
    ],
  };
}

function calculateMonthResolution(timePoints) {
  const periods = getPeriodsDurations(timePoints, differenceInMonths).sort(
    (a, b) => a - b
  );
  const resolution = gcd(periods);
  const smallestPeriod = periods[0];
  const pointWidth = Math.ceil((3 * resolution) / smallestPeriod);
  return {
    diff: differenceInMonths,
    toPoints: (duration) => (duration * pointWidth) / resolution,
    timeline: [
      {
        timePoints: eachYearOfInterval,
        format: (time) => `${time.getYear()}`,
        width: () => 12,
      },
    ],
  };
}

function calculateYearResolution(timePoints) {
  const periods = getPeriodsDurations(timePoints, differenceInYears).sort(
    (a, b) => a - b
  );
  const resolution = gcd(periods);
  const smallestPeriod = periods[0];
  const pointWidth = Math.ceil((5 * resolution) / smallestPeriod);
  return {
    diff: differenceInYears,
    toPoints: (duration) => (duration * pointWidth) / resolution,
    timeline: [
      {
        timePoints: eachYearOfInterval,
        format: (time) => `${time.getYear()}`,
        width: () => 1,
      },
    ],
  };
}

function getPeriodsDurations(timePoints, diffFunction) {
  const [, ...periodsDurations] = timePoints.map((time, i, array) =>
    i > 0 ? diffFunction(time, array[i - 1]) : 0
  );
  return periodsDurations;
}
