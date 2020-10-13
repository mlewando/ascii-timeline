import {
  addMonths,
  differenceInHours,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  startOfMonth,
} from "date-fns";

export function printAscii(data) {
  const columns = getGroupKeys(data).map((key) => {
    const width = getColumnWidth([key, ...data.map((e) => e[key])]);
    return {
      key,
      width,
      label: key.padEnd(width, " "),
    };
  });

  const rows = sanitizeData(data, columns);
  const resolutionSettings = {
    toPoints: (duration) => duration / 2,
    diff: differenceInHours,
    timeline: [
      {
        timePoints: eachMonthOfInterval,
        format: (time) => format(time, "yyyy-MM"),
        width: (time) =>
          differenceInHours(
            addMonths(startOfMonth(time), 1),
            startOfMonth(time)
          ),
      },
      {
        timePoints: eachDayOfInterval,
        format: (time) => `${time.getDate()}`.padStart(2, "0"),
        width: () => 24,
      },
    ],
  };
  const timePoints = [
    ...new Set(data.flatMap((e) => [e.start.valueOf(), e.end.valueOf()])),
  ]
    .sort()
    .map((timestamp) => new Date(timestamp));
  const timelineInterval = {
    start: timePoints[0],
    end: timePoints[timePoints.length - 1],
  };
  const timelines = resolutionSettings.timeline.map((level) =>
    level
      .timePoints(timelineInterval)
      .map((time) => {
        const share =
          time < timelineInterval.start
            ? resolutionSettings.diff(timelineInterval.start, time) /
              level.width(time)
            : 1;
        return level
          .format(time)
          .padEnd(resolutionSettings.toPoints(level.width(time)) * share);
      })
      .join("")
      .trim()
  );

  const columnLabels = columns.map((c) => c.label).join(" ");

  return [
    ...timelines.map(
      (line, i, array) =>
        `${
          i + 1 < array.length ? "".padEnd(columnLabels.length) : columnLabels
        } ${line}`
    ),
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
              resolutionSettings
            );

            const intervalString = printInterval(interval, resolutionSettings);
            return gapPad + intervalString;
          })
          .join("")
    ),
  ].join("\n");
}

function printGap(interval, isFirst, { toPoints, diff }) {
  const duration = diff(interval.end, interval.start);
  return "".padStart(toPoints(duration) - (isFirst ? 0 : 2));
}

function printInterval(interval, { diff, toPoints }) {
  const duration = diff(interval.end, interval.start);
  return (
    `${interval.start.getHours()}`.padStart(2, " ") +
    "".padEnd(toPoints(duration) - 2, "-") +
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
