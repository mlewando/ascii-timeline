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
