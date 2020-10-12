import gcd from "compute-gcd";
import {
  differenceInMilliseconds,
  differenceInYears,
  eachDayOfInterval,
  isEqual,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
} from "date-fns";

const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;

export function printAscii(data, options) {
  const columns = getGroupKeys(data).map((key) => {
    const width = getColumnWidth([key, ...data.map((e) => e[key])]);
    return {
      key,
      width,
      label: key.padEnd(width, " "),
    };
  });

  const rows = sanitizeData(data, columns);
  const resolutionInMs = 6 * 60 * 60 * 1000;
  const pointWidth = 3;
  const timePoints = [
    ...new Set(data.flatMap((e) => [e.start.valueOf(), e.end.valueOf()])),
  ]
    .sort()
    .map((timestamp) => new Date(timestamp));
  const timelineInterval = {
    start: timePoints[0],
    end: timePoints[timePoints.length - 1],
  };
  const days = eachDayOfInterval(timelineInterval).map((time) => ({
    time,
    day: time.getDate(),
    share:
      time < timelineInterval.start
        ? differenceInMilliseconds(timelineInterval.start, time) / MILLIS_IN_DAY
        : 1,
  }));

  return [
    columns.map((c) => c.label).join(" ") +
      " " +
      days
        .map((day) =>
          `${day.day}`
            .padStart(2, "0")
            .padEnd((MILLIS_IN_DAY / resolutionInMs) * pointWidth * day.share)
        )
        .join("")
        .trim(),
    ...rows.map(
      (r) =>
        r.label +
        " " +
        r.intervals
          .map((interval, i, array) => {
            const gapPad = printGap(
              {
                start: i > 0 ? array[i - 1].end : timelineInterval.start,
                end: interval.start,
              },
              i === 0,
              resolutionInMs,
              pointWidth
            );

            const intervalString = printInterval(
              interval,
              resolutionInMs,
              pointWidth
            );
            return gapPad + intervalString;
          })
          .join("")
    ),
  ].join("\n");
}

function figureOutBestPeriod(timePoints) {
  let bestPeriod = "year";
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
      resolution: resolutionInYears,
      diff: differenceInYears,
      pointWidth,
    };
  }
}

function getPeriodsDurations(timePoints, diffFunction) {
  const [, ...periodsDurations] = timePoints.map((time, i, array) =>
    i > 0 ? diffFunction(time, array[i - 1]) : 0
  );
  return periodsDurations;
}

function printGap(interval, isFirst, resolutionInMs, pointWidth) {
  const duration = differenceInMilliseconds(interval.end, interval.start);
  return "".padStart(
    (duration / resolutionInMs) * pointWidth - (isFirst ? 0 : 2)
  );
}

function printInterval(interval, resolutionInMs, pointWidth) {
  const duration = differenceInMilliseconds(interval.end, interval.start);
  return (
    `${interval.start.getHours()}`.padStart(2, " ") +
    "".padEnd((duration / resolutionInMs) * pointWidth - 2, "-") +
    `${interval.end.getHours()}`.padStart(
      2,
      interval.end.getHours() === 0 ? "0" : "-"
    )
  );
}

function sanitizeData(data, columns) {
  return Object.values(
    data
      .map((e) => ({
        start: e.start,
        end: e.end,
        id: columns.map((column) => e[column.key] || "-").join("_"),
        label: columns
          .map((column) => e[column.key].padEnd(column.width, " "))
          .join(" "),
      }))
      .reduce((map, row) => {
        map[row.id] = {
          label: row.label,
          intervals: [
            ...(map[row.id]?.intervals ?? []),
            {
              start: row.start,
              end: row.end,
            },
          ],
        };
        return map;
      }, {})
  );
}

function getGroupKeys(data) {
  return [
    ...new Set(
      data.flatMap((e) =>
        Object.keys(e).filter((key) => ["start", "end"].indexOf(key) < 0)
      )
    ),
  ].sort();
}

function getColumnWidth(values) {
  const [longest] = values.map((v) => v.length).sort((a, b) => b - a);
  return longest;
}
