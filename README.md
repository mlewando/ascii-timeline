# ASCII art timeline printer

Simple library that will put a list of intervals into a table-like ASCII art.

## Installation

```bash
npm install ascii-timeline
```

## Usage

The input needs to be an array of intervals `{start: Date; end: Date}`. Each interval can have additional metadata that will be used to group intervals into one timeline.

### Example

Given input:

```javascript
[
  {
    kind: "A",
    type: "1",
    start: new Date("2020-02-03T12:00"),
    end: new Date("2020-02-03T16:00"),
  },
  {
    kind: "A",
    type: "1",
    start: new Date("2020-02-04T08:00"),
    end: new Date("2020-02-04T16:00"),
  },
  {
    kind: "A",
    type: "2",
    start: new Date("2020-02-03T14:00"),
    end: new Date("2020-02-04T12:00"),
  },
  {
    kind: "B",
    type: "1",
    start: new Date("2020-02-03T10:00"),
    end: new Date("2020-02-04T22:00"),
  },
];
```

The algorithm will produce output:

```plain
          2020-02
kind type 03            04
A    1      12--16               8------16
A    2        14--------------------12
B    1    10----------------------------------22
```

### Command line usage

The tool can be used in command line, just pipe JSON data to `print-ascii-timeline` and the table will be printed on stdout. `start` and `end` properties in JSON will be converted to `Date` using constructor (`new Date(row.start)`).

```bash
cat data.json | print-ascii-timeline
```

### Using in your code

Function `printAsciiTimeline` can be imported from `ascii-timeline`. It has only one parameter with list of intervals and produces result as string.

```javascript
import { printAsciiTimeline } from 'ascii-timeline';

console.log(printAsciiTimeline([...]);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
