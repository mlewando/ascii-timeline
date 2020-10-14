import { calculateResolution } from "./resolutionCalculator";

it("should get res setting for full years", () => {
  const res = calculateResolution([
    new Date("2010-01-01T00:00:00.000"),
    new Date("2012-01-01T00:00:00.000"),
    new Date("2016-01-01T00:00:00.000"),
  ]);

  expect(res.diff(new Date("2003"), new Date("2000"))).toBe(3);
  expect(res.toPoints(2)).toBe(5);
  expect(res.toPoints(4)).toBe(10);
});

it("should get res setting for full months", () => {
  const res = calculateResolution([
    new Date("2010-09-01T00:00:00.000"),
    new Date("2010-10-01T00:00:00.000"),
    new Date("2010-12-01T00:00:00.000"),
    new Date("2011-02-01T00:00:00.000"),
  ]);

  expect(res.diff(new Date("2003-05"), new Date("2003-01"))).toBe(4);
  expect(res.toPoints(2)).toBe(6);
  expect(res.toPoints(4)).toBe(12);
  expect(res.timeline).toHaveLength(1);
  expect(
    res.timeline[0].timePoints({
      start: new Date("2010-09-01T00:00:00.000"),
      end: new Date("2011-02-01T00:00:00.000"),
    })
  ).toEqual([
    new Date("2010-01-01T00:00:00.000"),
    new Date("2011-01-01T00:00:00.000"),
  ]);
});
