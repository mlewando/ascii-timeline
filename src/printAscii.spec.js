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
    "     2020-05  \n" +
      "data 01    02          03\n" +
      "1    12----00       18-00\n" +
      "2       18-----6"
  );
});
