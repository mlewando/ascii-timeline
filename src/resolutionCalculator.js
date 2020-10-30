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
  differenceInMinutes,
  differenceInSeconds,
  differenceInMilliseconds,
} from "date-fns";

export function calculateResolution(timePoints, periods, printableIntervals) {
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
    return calculateYearResolution(periods, printableIntervals);
  } else if (!hasNotFullMonth) {
    return calculateMonthResolution(periods, printableIntervals);
  } else if (!hasNotFullDay) {
    return calculateDayResolution(periods, printableIntervals);
  } else if (!hasNotFullHour) {
    return calculateHourResolution(periods, printableIntervals);
  } else if (!hasNotFullMinute) {
    return calculateMinuteResolution(periods, printableIntervals);
  } else if (!hasNotFullSecond) {
    return calculateSecondsResolution(periods, printableIntervals);
  }
  return calculateMillisecondsResolution(periods, printableIntervals);
}

function calculateMillisecondsResolution(intervals, printableIntervals) {
  const resolutionData = calculateBasicResolution(
    intervals,
    printableIntervals,
    differenceInMilliseconds,
    8
  );
  if (resolutionData.toPoints(24 * 60 * 60 * 1000) > 10) {
    return {
      ...resolutionData,
      format: (time) => format(time, "HH:mm:ss.SSS"),
      timeline: [
        {
          timePoints: eachDayOfInterval,
          format: (time) => format(time, "yyyy-MM-dd"),
          width: () => 24 * 60 * 60 * 1000,
        },
      ],
    };
  }
  return {
    ...resolutionData,
    format: (time) => format(time, "HH:mm:ss.SSS"),
    timeline: [
      {
        timePoints: eachMonthOfInterval,
        format: (time) => format(time, "yyyy-MM"),
        width: (month) =>
          differenceInMilliseconds(endOfMonth(month), startOfMonth(month)),
      },
      {
        timePoints: eachDayOfInterval,
        format: (time) => format(time, "dd"),
        width: () => 24 * 60 * 60 * 1000,
      },
    ],
  };
}
function calculateSecondsResolution(intervals, printableIntervals) {
  const resolutionData = calculateBasicResolution(
    intervals,
    printableIntervals,
    differenceInSeconds,
    8
  );
  if (resolutionData.toPoints(24 * 60 * 60) > 10) {
    return {
      ...resolutionData,
      format: (time) => format(time, "HH:mm:ss"),
      timeline: [
        {
          timePoints: eachDayOfInterval,
          format: (time) => format(time, "yyyy-MM-dd"),
          width: () => 24 * 60 * 60,
        },
      ],
    };
  }
  return {
    ...resolutionData,
    format: (time) => format(time, "HH:mm:ss"),
    timeline: [
      {
        timePoints: eachMonthOfInterval,
        format: (time) => format(time, "yyyy-MM"),
        width: (month) =>
          differenceInSeconds(endOfMonth(month), startOfMonth(month)),
      },
      {
        timePoints: eachDayOfInterval,
        format: (time) => format(time, "dd"),
        width: () => 24 * 60 * 60,
      },
    ],
  };
}

function calculateMinuteResolution(intervals, printableIntervals) {
  const resolutionData = calculateBasicResolution(
    intervals,
    printableIntervals,
    differenceInMinutes,
    5
  );
  if (resolutionData.toPoints(24 * 60) > 10) {
    return {
      ...resolutionData,
      format: (time) => format(time, "HH:mm"),
      timeline: [
        {
          timePoints: eachDayOfInterval,
          format: (time) => format(time, "yyyy-MM-dd"),
          width: () => 24 * 60,
        },
      ],
    };
  }
  return {
    ...resolutionData,
    format: (time) => format(time, "HH:mm"),
    timeline: [
      {
        timePoints: eachMonthOfInterval,
        format: (time) => format(time, "yyyy-MM"),
        width: (month) =>
          differenceInMinutes(endOfMonth(month), startOfMonth(month)),
      },
      {
        timePoints: eachDayOfInterval,
        format: (time) => format(time, "dd"),
        width: () => 24 * 60,
      },
    ],
  };
}
function calculateHourResolution(intervals, printableIntervals) {
  return {
    ...calculateBasicResolution(
      intervals,
      printableIntervals,
      differenceInHours,
      2
    ),
    format: (time) => `${time.getHours()}`.padStart(2, " "),
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
function calculateDayResolution(intervals, printableIntervals) {
  const basicData = calculateBasicResolution(
    intervals,
    printableIntervals,
    differenceInDays,
    2
  );

  const shortestMonth = Math.min(
    eachMonthOfInterval(getMinCoveringInterval(intervals))
      .map((month) => ({ start: startOfMonth(month), end: endOfMonth(month) }))
      .map(({ start, end }) => differenceInDays(end, start))
  );
  const shortestMonthWidth = basicData.toPoints(shortestMonth);
  if (shortestMonthWidth < 8) {
    return {
      ...basicData,
      format: (time) => `${time.getDate()}`.padStart(2, " "),
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
    ...basicData,
    format: (time) => `${time.getDate()}`.padStart(2, " "),
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

function calculateMonthResolution(intervals, printableIntervals) {
  return {
    ...calculateBasicResolution(
      intervals,
      printableIntervals,
      differenceInMonths,
      2
    ),
    format: (time) => `${time.getMonth() + 1}`.padStart(2, " "),
    timeline: [
      {
        timePoints: eachYearOfInterval,
        format: (time) => format(time, "yyyy"),
        width: () => 12,
      },
    ],
  };
}

function calculateYearResolution(intervals, printableIntervals) {
  return {
    ...calculateBasicResolution(
      intervals,
      printableIntervals,
      differenceInYears,
      4
    ),
    format: (time) => format(time, "yyyy"),
    timeline: [
      {
        timePoints: () => [],
        format: () => "",
        width: () => 1,
      },
    ],
  };
}

/**
 * Calculates basic resolution data
 * @param {{start: Date, end: Date}[]} intervals intervals and gaps that will be printed
 * @param {{start: Date, end: Date}[]} printableIntervals intervals that will be printed (and need to have at least labelWidth)
 * @param {(end: Date, start: Date) => number} diffFunction function that calculates difference between given dates in required units
 * @param {number} labelWidth width of single unit value after printing, eg. while printing hourly intervals in format HH it should be 2
 * @returns {{diff: (end: Date, start: Date) => number, toPoints: (durationInDiffsUnit: number) => number}}
 */
function calculateBasicResolution(
  intervals,
  printableIntervals,
  diffFunction,
  labelWidth
) {
  const periods = getPeriodsDurations(intervals, diffFunction);
  const smallestPeriod =
    getPeriodsDurations(printableIntervals, diffFunction).find(
      (duration) => duration > 0
    ) || 1;
  const resolution = gcd(periods) || periods[0];
  const pointWidth = Math.ceil(
    ((labelWidth + 1) * resolution) / smallestPeriod
  );
  const toPoints = (duration) => (duration * pointWidth) / resolution;
  return {
    diff: diffFunction,
    toPoints,
  };
}

function getPeriodsDurations(intervals, diffFunction) {
  return [
    ...new Set(intervals.map(({ start, end }) => diffFunction(end, start))),
  ].sort((a, b) => a - b);
}

function getMinCoveringInterval(intervals) {
  return {
    start: new Date(Math.min(...intervals.map((i) => i.start.valueOf()))),
    end: new Date(Math.max(...intervals.map((i) => i.end.valueOf()))),
  };
}
