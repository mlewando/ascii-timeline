const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;

export function printAscii(data, options) {
  const idKeys = getGroupKeys(data);
  const columns = idKeys.map((key) => {
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
  const days = getDaysInInterval(timelineInterval);

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
            const gap =
              interval.start.valueOf() -
              (i > 0 ? array[i - 1].end : timelineInterval.start).valueOf();
            const duration = interval.end.valueOf() - interval.start.valueOf();
            return (
              "".padStart(
                (gap / resolutionInMs) * pointWidth - (i > 0 ? 2 : 0)
              ) +
              `${interval.start.getHours()}`.padStart(2, " ") +
              "".padEnd((duration / resolutionInMs) * pointWidth - 2, "-") +
              `${interval.end.getHours()}`.padStart(
                2,
                interval.end.getHours() === 0 ? "0" : "-"
              )
            );
          })
          .join("")
    ),
  ].join("\n");
}

function getDaysInInterval(interval) {
  let start = new Date(interval.start);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);
  const days = [];
  do {
    days.push({
      time: start,
      day: start.getDate(),
      share:
        start < interval.start
          ? (interval.start.valueOf() - start.valueOf()) / MILLIS_IN_DAY
          : 1,
    });
    start = new Date(start);
    start.setDate(start.getDate() + 1);
  } while (start <= interval.end);
  return days;
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
  const [lonogest] = values.map((v) => v.length).sort((a, b) => b - a);
  return lonogest;
}
