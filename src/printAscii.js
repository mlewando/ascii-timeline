import { isEqual } from "date-fns";

import { calculateResolution } from "./resolutionCalculator";

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
  const timePoints = [
    ...new Set(data.flatMap((e) => [e.start.valueOf(), e.end.valueOf()])),
  ]
    .sort()
    .map((timestamp) => new Date(timestamp));
  const timelineInterval = {
    start: timePoints[0],
    end: timePoints[timePoints.length - 1],
  };
  const resolutionSettings = calculateResolution(
    timePoints,
    getIntervalsFromPeriodsAndGaps(rows, timelineInterval),
    Object.values(rows).flatMap((row) => row.intervals)
  );
  const timelines = resolutionSettings.timeline.map((level) =>
    level
      .timePoints(timelineInterval)
      .map((time) => {
        const labelPoint = new Date(
          Math.max(time.valueOf(), timelineInterval.start.valueOf())
        );
        return {
          label: level.format(time),
          width:
            (resolutionSettings.toPoints(level.width(time)) *
              (level.width(time) - resolutionSettings.diff(labelPoint, time))) /
            level.width(time),
        };
      })
      .reduce(
        ({ line, debt }, { label, width }) => {
          if (debt >= 0) {
            return {
              line: line + label.padEnd(width),
              debt: width - label.length,
            };
          }
          return { line: line + "".padEnd(width + debt), debt: 0 };
        },
        { line: "", debt: 0 }
      )
      .line.trim()
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
            return (
              gapPad +
              (i > 0 && isEqual(array[i - 1].end, interval.start)
                ? intervalString.substr(2)
                : intervalString)
            );
          })
          .join("")
    ),
  ].join("\n");
}

function printGap(interval, isFirst, { toPoints, diff }) {
  const duration = diff(interval.end, interval.start);
  return "".padStart(toPoints(duration) - (isFirst ? 0 : 2));
}

function printInterval(interval, { diff, toPoints, format }) {
  const duration = diff(interval.end, interval.start);
  const startLabel = format(interval.start);
  return (
    startLabel.padEnd(toPoints(duration), "-") +
    format(interval.end).replace(/\s/gi, "-")
  );
}

function getIntervalsFromPeriodsAndGaps(data, timelineInterval) {
  return Object.values(data)
    .map((row) => row.intervals)
    .flatMap((intervals) =>
      intervals.flatMap((interval, i, array) => {
        const result = [];
        if (i === 0 && !isEqual(interval.start, timelineInterval.start)) {
          result.push({ start: timelineInterval.start, end: interval.start });
        }
        result.push(interval);
        if (i + 1 < array.length) {
          result.push({ start: interval.end, end: array[i + 1].start });
        } else if (!isEqual(interval.end, timelineInterval.end)) {
          result.push({ start: interval.end, end: timelineInterval.end });
        }
        return result;
      })
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
          .map((column) => (e[column.key] || "").padEnd(column.width, " "))
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
  const [longest] = values.map((v) => v?.length ?? 0).sort((a, b) => b - a);
  return longest;
}
