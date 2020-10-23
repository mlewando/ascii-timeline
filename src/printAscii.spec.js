import { printAscii } from "./printAscii";

it("should print simple data", () => {
  const result = printAscii([
    {
      data: "1",
      start: new Date("2020-05-01T12:00:00.000"),
      end: new Date("2020-05-02T00:00:00.000"),
    },
    {
      data: "2",
      start: new Date("2020-05-01T18:00:00.000"),
      end: new Date("2020-05-02T06:00:00.000"),
    },
    {
      data: "1",
      start: new Date("2020-05-02T18:00:00.000"),
      end: new Date("2020-05-03T00:00:00.000"),
    },
  ]);

  expect(result).toBe(
    "     2020-05\n" +
      "data 01    02          03\n" +
      "1    12-----0       18--0\n" +
      "2       18-----6"
  );
});

it("should print data in less res", () => {
  const result = printAscii([
    {
      data: "1",
      start: new Date("2020-05-01T12:00:00.000"),
      end: new Date("2020-05-02T00:00:00.000"),
    },
    {
      data: "2",
      start: new Date("2020-05-01T12:00:00.000"),
      end: new Date("2020-05-02T06:00:00.000"),
    },
    {
      data: "1",
      start: new Date("2020-05-02T12:00:00.000"),
      end: new Date("2020-05-03T00:00:00.000"),
    },
  ]);

  expect(result).toBe(
    "     2020-05\n" +
      "data 01  02      03\n" +
      "1    12---0  12---0\n" +
      "2    12-----6"
  );
});

it("should print months", () => {
  const result = printAscii([
    {
      type: "1",
      start: new Date("2020-02-02T00:00"),
      end: new Date("2020-02-10T00:00"),
    },
    {
      type: "2",
      start: new Date("2020-02-01T00:00"),
      end: new Date("2020-02-08T00:00"),
    },
  ]);

  expect(result).toBe(
    `type 2020-02
1      2------10
2     1------8`
  );
});

it("should print years", () => {
  const result = printAscii([
    {
      type: "1",
      start: new Date("2015-01-01T00:00"),
      end: new Date("2022-01-01T00:00"),
    },
    {
      type: "2",
      start: new Date("2018-01-01T00:00"),
      end: new Date("2022-01-01T00:00"),
    },
  ]);

  expect(result).toBe(
    "type " +
      `
1    2015----------2022
2          2018----2022`
  );
});

it("should 4 hours", () => {
  const result = printAscii([
    {
      type: "1",
      start: new Date("2020-01-01T20:00"),
      end: new Date("2020-01-02T00:00"),
    },
    {
      type: "2",
      start: new Date("2020-01-02T00:00"),
      end: new Date("2020-01-02T18:00"),
    },
  ]);

  expect(result).toBe(
    `     2020-01
type 01  02
1    20---0
2         0----------------18`
  );
});

it("should handle not integer days", () => {
  const result = printAscii([
    {
      type: "1",
      start: new Date("2020-01-01T22:00"),
      end: new Date("2020-01-02T04:00"),
    },
    {
      type: "2",
      start: new Date("2020-01-02T02:00"),
      end: new Date("2020-01-03T00:00"),
    },
  ]);

  expect(result).toBe(
    `     2020-01
type 01           03
1    22--4
2       2----------0`
  );
});
