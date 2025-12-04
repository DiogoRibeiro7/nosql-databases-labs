const fs = require("fs");
const path = require("path");
const readline = require("node:readline");
const { deserialize } = require("bson");

const manifest = require("./data-manifest.json");

const ROOT_DIR = path.join(__dirname, "..");

async function countJsonArray(filePath) {
  const raw = await fs.promises.readFile(filePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON array: ${error.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("JSON file does not contain an array at the top level");
  }

  return parsed.length;
}

async function countNdjson(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    let count = 0;
    let lineNumber = 0;

    rl.on("line", (line) => {
      lineNumber += 1;
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      try {
        JSON.parse(trimmed);
        count += 1;
      } catch (error) {
        rl.close();
        stream.destroy();
        reject(new Error(`Invalid JSON on line ${lineNumber}: ${error.message}`));
      }
    });

    rl.on("close", () => resolve(count));
    rl.on("error", (error) => reject(new Error(`Readline failure: ${error.message}`)));
    stream.on("error", (error) => reject(new Error(`Stream failure: ${error.message}`)));
  });
}

function countBson(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 0;
  let count = 0;

  while (offset < buffer.length) {
    if (offset + 4 > buffer.length) {
      throw new Error("Unexpected EOF while reading BSON document size");
    }

    const size = buffer.readInt32LE(offset);
    if (size <= 0) {
      throw new Error(`Invalid BSON document size (${size})`);
    }

    const end = offset + size;
    if (end > buffer.length) {
      throw new Error(
        `Truncated BSON document: expected ${size} bytes but only ${buffer.length - offset} remaining`
      );
    }

    const slice = buffer.slice(offset, end);
    try {
      deserialize(slice);
    } catch (error) {
      throw new Error(`Failed to deserialize BSON document at offset ${offset}: ${error.message}`);
    }

    count += 1;
    offset = end;
  }

  return count;
}

async function validateDataset(entry) {
  const absolutePath = path.join(ROOT_DIR, entry.path);
  if (!fs.existsSync(absolutePath)) {
    throw new Error("File is missing");
  }

  let actualCount;
  switch (entry.format) {
    case "json-array":
      actualCount = await countJsonArray(absolutePath);
      break;
    case "ndjson":
      actualCount = await countNdjson(absolutePath);
      break;
    case "bson":
      actualCount = countBson(absolutePath);
      break;
    default:
      throw new Error(`Unsupported format '${entry.format}'`);
  }

  if (typeof entry.expectedCount === "number" && actualCount !== entry.expectedCount) {
    throw new Error(`Expected ${entry.expectedCount} docs but found ${actualCount}`);
  }

  return actualCount;
}

async function run() {
  let failed = false;
  console.log("Running dataset smoke tests...");

  for (const entry of manifest.datasets) {
    try {
      const count = await validateDataset(entry);
      console.log(`OK  ${entry.path} (${entry.format}) -> ${count} documents`);
    } catch (error) {
      failed = true;
      console.error(`ERR ${entry.path}: ${error.message}`);
    }
  }

  if (failed) {
    throw new Error("One or more dataset smoke tests failed");
  }

  console.log("All dataset smoke tests passed.");
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
