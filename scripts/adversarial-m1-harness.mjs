import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=================================================");
console.log("M1 ADVERSARIAL STRESS TEST & INTEGRITY HARNESS");
console.log("=================================================\n");

let passedTests = 0;
let failedTests = 0;
let warnings = [];

function assert(condition, message) {
  if (!condition) {
    failedTests++;
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

function warn(message) {
  warnings.push(message);
  console.warn(`⚠️ WARN: ${message}`);
}

// -------------------------------------------------------------
// SECTION 1: JPEG Binary Analysis (Header, Markers, SOF, Dimensions, EOI)
// -------------------------------------------------------------
console.log("--- SECTION 1: JPEG Binary Analysis ---");

const cardsDir = path.join(rootDir, "src/assets/cards");
const expectedCards = [
  {
    name: "card-front.jpg",
    expectedSha: "fad849c09e0aeae1a60f4d2fa86c5d0d8ef3a8d52602f65bbdc734641bc59511",
    expectedSize: 314262,
    role: "Front Mascot",
  },
  {
    name: "card-career.jpg",
    expectedSha: "00b26556e5fecf4157b658d707e17e65705fb28bd922e3127f811e67dc4d5916",
    expectedSize: 281152,
    role: "Career Card",
  },
  {
    name: "card-adventure.jpg",
    expectedSha: "61bfa7d59aaeb3dc4ee0d1e6d33d65d77f336cc58c4fa9e60264a9f6534acc5e",
    expectedSize: 287550,
    role: "Adventure Card",
  },
  {
    name: "card-creative.jpg",
    expectedSha: "dc7eb38e7a2a2f100fb5d1b296e36f315c0245f6bb7f3e05729b3e63d74e6782",
    expectedSize: 287755,
    role: "Creative Card",
  },
];

// Parser to extract JPEG dimensions from SOF marker
function parseJpegMetadata(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    return { valid: false, error: "Invalid SOI marker" };
  }

  let offset = 2;
  let width = 0;
  let height = 0;
  let components = 0;
  let sofFound = false;

  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buf[offset + 1];

    // Standalone markers without length
    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      marker === 0x00 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      offset += 2;
      continue;
    }

    if (offset + 4 > buf.length) break;
    const length = buf.readUInt16BE(offset + 2);

    // SOF markers: SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (offset + 2 + length <= buf.length) {
        const precision = buf[offset + 4];
        height = buf.readUInt16BE(offset + 5);
        width = buf.readUInt16BE(offset + 7);
        components = buf[offset + 9];
        sofFound = true;
        break;
      }
    }

    offset += 2 + length;
  }

  // Check EOI marker at end
  const hasEOI =
    (buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9) ||
    buf.slice(-100).includes(Buffer.from([0xff, 0xd9]));

  return {
    valid: sofFound && hasEOI,
    width,
    height,
    components,
    hasEOI,
    aspectRatio: width > 0 && height > 0 ? (width / height).toFixed(4) : null,
  };
}

for (const card of expectedCards) {
  const filePath = path.join(cardsDir, card.name);
  assert(fs.existsSync(filePath), `File exists: ${card.name}`);

  const buffer = fs.readFileSync(filePath);
  assert(
    buffer.length === card.expectedSize,
    `${card.name} size matches exactly (${buffer.length} bytes)`,
  );

  const sha = crypto.createHash("sha256").update(buffer).digest("hex");
  assert(sha === card.expectedSha, `${card.name} SHA256 checksum matches authentic upload`);

  // Verify SOI (Start Of Image)
  assert(buffer[0] === 0xff && buffer[1] === 0xd8, `${card.name} starts with 0xFF 0xD8 (SOI)`);

  // Verify EOI (End Of Image)
  assert(
    buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9,
    `${card.name} cleanly terminates with 0xFF 0xD9 (EOI)`,
  );

  const meta = parseJpegMetadata(buffer);
  assert(meta.valid, `${card.name} has valid JPEG metadata frame`);
  console.log(
    `   -> Dimensions: ${meta.width}x${meta.height} px, Channels: ${meta.components}, Aspect Ratio: ${meta.aspectRatio}`,
  );
  assert(
    meta.width > 500 && meta.height > 500,
    `${card.name} has high-resolution dimensions (>500px)`,
  );
}

// -------------------------------------------------------------
// SECTION 2: Adversarial Corruption & Truncation Handling
// -------------------------------------------------------------
console.log("\n--- SECTION 2: Adversarial Corruption & Truncation Handling ---");

const testCardBuffer = fs.readFileSync(path.join(cardsDir, "card-front.jpg"));

// Test 1: Truncated buffer (only 16 bytes)
const truncated16 = testCardBuffer.subarray(0, 16);
const metaTruncated16 = parseJpegMetadata(truncated16);
assert(!metaTruncated16.valid, "Truncated JPEG (16 bytes) correctly rejected as invalid");

// Test 2: Stripped EOI marker
const strippedEOI = Buffer.alloc(testCardBuffer.length - 2);
testCardBuffer.copy(strippedEOI, 0, 0, testCardBuffer.length - 2);
const metaStripped = parseJpegMetadata(strippedEOI);
assert(!metaStripped.valid, "Stripped EOI JPEG correctly flagged as incomplete/corrupted");

// Test 3: Corrupted header bytes
const corruptHeader = Buffer.from(testCardBuffer);
corruptHeader[0] = 0x00;
corruptHeader[1] = 0x00;
const metaCorrupt = parseJpegMetadata(corruptHeader);
assert(!metaCorrupt.valid, "Corrupted SOI header correctly rejected");

// -------------------------------------------------------------
// SECTION 3: Vite Bundle Output Forensics (.output/)
// -------------------------------------------------------------
console.log("\n--- SECTION 3: Vite & Nitro Bundle Output Forensics ---");

const outputPublicAssetsDir = path.join(rootDir, ".output/public/assets");
assert(fs.existsSync(outputPublicAssetsDir), "Build output directory .output/public/assets exists");

const bundledAssets = fs.readdirSync(outputPublicAssetsDir);

const bundledJpegs = {
  front: bundledAssets.find((f) => f.startsWith("card-front") && f.endsWith(".jpg")),
  career: bundledAssets.find((f) => f.startsWith("card-career") && f.endsWith(".jpg")),
  adventure: bundledAssets.find((f) => f.startsWith("card-adventure") && f.endsWith(".jpg")),
  creative: bundledAssets.find((f) => f.startsWith("card-creative") && f.endsWith(".jpg")),
};

for (const [key, fname] of Object.entries(bundledJpegs)) {
  assert(!!fname, `Production bundle contains ${key} card image: ${fname}`);
  const fpath = path.join(outputPublicAssetsDir, fname);
  const buf = fs.readFileSync(fpath);
  assert(
    buf.length > 200000,
    `Bundled ${fname} is non-empty and uncorrupted (${buf.length} bytes)`,
  );

  // Verify SHA256 matches authentic source file exactly
  const sha = crypto.createHash("sha256").update(buf).digest("hex");
  const expectedSha = expectedCards.find((c) =>
    fname.startsWith(c.name.replace(".jpg", "")),
  )?.expectedSha;
  assert(sha === expectedSha, `Bundled ${fname} bit-exact SHA256 matches authentic source file`);
}

// -------------------------------------------------------------
// SECTION 4: Scan for __l5e, assets-v1, and Lovable CDNs in Build Output & Source
// -------------------------------------------------------------
console.log("\n--- SECTION 4: Deep Scan for __l5e & Broken CDNs ---");

function scanDirectoryForForbiddenStrings(dir, forbiddenStrings, fileFilter = () => true) {
  let foundMatches = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && fileFilter(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const forbidden of forbiddenStrings) {
          if (content.includes(forbidden)) {
            foundMatches.push({ file: fullPath, pattern: forbidden });
          }
        }
      }
    }
  }

  walk(dir);
  return foundMatches;
}

// Check .output/
const buildMatches = scanDirectoryForForbiddenStrings(
  path.join(rootDir, ".output"),
  ["__l5e", "assets-v1", "belakang1.webp", "depan.webp"],
  (f) => !f.endsWith(".map"),
);

assert(
  buildMatches.length === 0,
  `Production build (.output) contains ZERO references to __l5e / assets-v1 / old webp (found: ${buildMatches.length})`,
);

// Check src/ (excluding test assertions that test for absence of __l5e)
function scanSrcExcludingAssertions(dir) {
  let foundMatches = [];
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && !fullPath.includes("/test/")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes("__l5e") || content.includes("assets-v1")) {
          foundMatches.push(fullPath);
        }
      }
    }
  }
  walk(dir);
  return foundMatches;
}

const srcMatches = scanSrcExcludingAssertions(path.join(rootDir, "src"));
assert(
  srcMatches.length === 0,
  `src/ (excluding tests) contains ZERO references to __l5e or assets-v1`,
);

// Verify obsolete .asset.json files are gone
const oldAssetFiles = [
  "src/assets/belakang1.webp.asset.json",
  "src/assets/belakang2.webp.asset.json",
  "src/assets/belakang3.webp.asset.json",
  "src/assets/depan.webp.asset.json",
];
for (const f of oldAssetFiles) {
  assert(!fs.existsSync(path.join(rootDir, f)), `Deprecated proxy metadata file eliminated: ${f}`);
}

// -------------------------------------------------------------
// SECTION 5: Persona Data & Algorithmic Stress-Testing (getRandomQuote)
// -------------------------------------------------------------
console.log("\n--- SECTION 5: Persona Data & getRandomQuote Algorithmic Stress-Testing ---");

// Import personas module via Vite SSR to resolve aliases and image imports properly
import { createServer } from "vite";
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

const personasModule = await vite.ssrLoadModule("/src/data/personas.ts");
const { personas, personaKeys, getRandomQuote } = personasModule;

assert(
  Array.isArray(personaKeys) && personaKeys.length === 3,
  "personaKeys contains exactly 3 keys",
);

for (const key of personaKeys) {
  const p = personas[key];
  assert(p !== undefined, `personas.${key} exists`);
  assert(
    typeof p.image === "string" && p.image.length > 0,
    `personas.${key}.image is a non-empty string`,
  );
  assert(
    typeof p.frontImage === "string" && p.frontImage.length > 0,
    `personas.${key}.frontImage is a non-empty string`,
  );
  assert(p.quotes.length >= 15, `personas.${key}.quotes has >= 15 quotes (${p.quotes.length})`);
  assert(
    p.accentColor.startsWith("var(--SGE"),
    `personas.${key}.accentColor uses SGE token: ${p.accentColor}`,
  );
}

// Stress Test getRandomQuote Boundary Conditions
console.log("\nTesting getRandomQuote edge cases...");

// Edge Case 1: Invalid key
const invalidKeyResult = getRandomQuote("nonexistent_persona");
assert(
  invalidKeyResult === "",
  "getRandomQuote handles non-existent persona key by returning empty string",
);

// Edge Case 2: Negative excludeIndex
const negResult = getRandomQuote("career", -1);
assert(
  typeof negResult === "string" && negResult.length > 0,
  "getRandomQuote handles negative excludeIndex (-1)",
);

// Edge Case 3: Out of bound excludeIndex (e.g. 9999)
const oobResult = getRandomQuote("career", 9999);
assert(
  typeof oobResult === "string" && oobResult.length > 0,
  "getRandomQuote handles huge excludeIndex (9999)",
);

// Edge Case 4: NaN and Infinity
const nanResult = getRandomQuote("career", NaN);
assert(
  typeof nanResult === "string" && nanResult.length > 0,
  "getRandomQuote handles NaN excludeIndex",
);

const infResult = getRandomQuote("career", Infinity);
assert(
  typeof infResult === "string" && infResult.length > 0,
  "getRandomQuote handles Infinity excludeIndex",
);

// Edge Case 5: Float excludeIndex (e.g. 2.5)
const floatResult = getRandomQuote("career", 2.5);
assert(
  typeof floatResult === "string" && floatResult.length > 0,
  "getRandomQuote handles floating-point excludeIndex",
);

// Stress Test 6: Strict Non-Repetition Guarantee
console.log("\nTesting strict non-repetition across 10,000 runs...");
let repetitionViolations = 0;
for (const key of personaKeys) {
  const pool = personas[key].quotes;
  for (let idx = 0; idx < pool.length; idx++) {
    const targetQuote = pool[idx];
    for (let trial = 0; trial < 100; trial++) {
      const drawn = getRandomQuote(key, idx);
      if (drawn === targetQuote) {
        repetitionViolations++;
      }
    }
  }
}
assert(
  repetitionViolations === 0,
  `Zero repetition violations across all persona quotes (tested 100 runs per index)`,
);

// Statistical Distribution Analysis of (excludeIndex + 1) Bias
console.log("\nTesting statistical distribution and reroll bias...");
const sampleKey = "career";
const testPool = personas[sampleKey].quotes;
const excludeIdx = 0;
const counts = Array(testPool.length).fill(0);
const TRIALS = 50000;

for (let i = 0; i < TRIALS; i++) {
  const drawn = getRandomQuote(sampleKey, excludeIdx);
  const foundIdx = testPool.indexOf(drawn);
  if (foundIdx !== -1) {
    counts[foundIdx]++;
  }
}

assert(
  counts[excludeIdx] === 0,
  `Excluded index ${excludeIdx} received exactly 0 draws out of ${TRIALS}`,
);

const nextNeighborIdx = (excludeIdx + 1) % testPool.length;
const expectedUniform = TRIALS / (testPool.length - 1); // ~2941
const neighborCount = counts[nextNeighborIdx];
const otherAverage = counts.slice(2).reduce((a, b) => a + b, 0) / (testPool.length - 2);

console.log(`   -> Excluded index count: ${counts[excludeIdx]}`);
console.log(
  `   -> Next index (idx 1) count: ${neighborCount} (${((neighborCount / TRIALS) * 100).toFixed(2)}%)`,
);
console.log(
  `   -> Other indices average count: ${otherAverage.toFixed(0)} (${((otherAverage / TRIALS) * 100).toFixed(2)}%)`,
);

// Document the modulo reroll bias
if (neighborCount > otherAverage * 1.5) {
  warn(
    `getRandomQuote implementation has a modulo redistribution bias: index (excludeIndex + 1) % N occurs with ~2x probability (${((neighborCount / TRIALS) * 100).toFixed(2)}% vs ~${((otherAverage / TRIALS) * 100).toFixed(2)}%). While non-repetition is guaranteed, quotes are not uniformly distributed on reroll.`,
  );
}

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=================================================");
console.log(`TOTAL PASSES: ${passedTests}`);
console.log(`TOTAL FAILURES: ${failedTests}`);
console.log(`WARNINGS / OBSERVATIONS: ${warnings.length}`);
console.log("=================================================");

await vite.close();

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
