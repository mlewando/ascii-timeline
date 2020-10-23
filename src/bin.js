#!/usr/bin/env node
import getStdin from "get-stdin";

import { printAscii } from "./printAscii";
// Reads JSON from stdin and writes equivalent
// nicely-formatted JSON to stdout.

(async () => {
  const data = JSON.parse(await getStdin());

  process.stdout.write(
    printAscii(
      data.map(({ start, end, ...meta }) => ({
        ...meta,
        start: new Date(start),
        end: new Date(end),
      }))
    ) + "\n"
  );
})();
