import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.join(root, "opportunity-pool", "opportunities.json");
const outputPath = path.join(root, "opportunity-pool", "RANKED.md");
const checkOnly = process.argv.includes("--check");
const validStages = new Set([
  "discovered",
  "research",
  "validate-next",
  "building",
  "live-validation",
  "scale",
  "hold",
  "killed",
  "avoid",
]);

const weights = {
  pain: 18,
  reach: 16,
  speed: 14,
  willingnessToPay: 18,
  recurring: 10,
  seo: 10,
  margin: 8,
  defensibility: 6,
};

const required = [
  "id",
  "name",
  "family",
  "stage",
  "targetUser",
  "job",
  "offer",
  "pricing",
  "targetMath",
  "channels",
  "mvpDays",
  "evidence",
  "experiment",
  "passGate",
  "killGate",
  "scores",
];

const pool = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const ids = new Set();
const errors = [];

function score(item) {
  const positive = Object.entries(weights).reduce((sum, [key, weight]) => {
    const value = item.scores[key];
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      errors.push(`${item.id}: scores.${key} must be an integer from 1 to 5`);
    }
    return sum + value * weight;
  }, 0);
  const risk = item.scores.risk;
  if (!Number.isInteger(risk) || risk < 1 || risk > 5) {
    errors.push(`${item.id}: scores.risk must be an integer from 1 to 5`);
  }
  return Math.round((positive / 5 - risk * 2.4) * 10) / 10;
}

for (const item of pool.opportunities) {
  for (const field of required) {
    if (item[field] === undefined || item[field] === "") {
      errors.push(`${item.id ?? "unknown"}: missing ${field}`);
    }
  }
  if (ids.has(item.id)) errors.push(`${item.id}: duplicate id`);
  ids.add(item.id);
  if (!Array.isArray(item.channels) || item.channels.length === 0) {
    errors.push(`${item.id}: channels must not be empty`);
  }
  if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
    errors.push(`${item.id}: evidence must not be empty`);
  }
  if (!validStages.has(item.stage)) {
    errors.push(`${item.id}: invalid stage ${item.stage}`);
  }
  if (!Number.isInteger(item.mvpDays) || item.mvpDays < 1 || item.mvpDays > 30) {
    errors.push(`${item.id}: mvpDays must be an integer from 1 to 30`);
  }
  for (const evidence of item.evidence ?? []) {
    if (!evidence.url?.startsWith("https://") || !evidence.observed || !evidence.date) {
      errors.push(`${item.id}: each evidence item needs an HTTPS URL, observation and date`);
    }
  }
  item.computedScore = score(item);
}

const active = pool.opportunities.filter((item) =>
  ["building", "live-validation"].includes(item.stage),
);
if (active.length > 2) {
  errors.push(`portfolio: at most 2 products may be active; found ${active.length}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const sorted = [...pool.opportunities].sort(
  (a, b) => b.computedScore - a.computedScore || a.mvpDays - b.mvpDays,
);

if (!checkOnly) {
  const lines = [
    "# Ranked Opportunity Pool",
    "",
    `Generated from \`opportunities.json\` on ${new Date().toISOString().slice(0, 10)}.`,
    "Score combines pain, reach, build speed, willingness to pay, recurring value, SEO, margin and defensibility, then subtracts execution risk.",
    "",
    "| Rank | Score | Stage | Opportunity | Buyer | Price | MVP | Primary channel |",
    "| ---: | ---: | --- | --- | --- | --- | ---: | --- |",
  ];

  sorted.forEach((item, index) => {
    lines.push(
      `| ${index + 1} | ${item.computedScore} | ${item.stage} | ${item.name} | ${item.targetUser} | ${item.pricing} | ${item.mvpDays}d | ${item.channels[0]} |`,
    );
  });

  lines.push("", "## Next Validation Queue", "");
  sorted
    .filter((item) => ["validate-next", "research"].includes(item.stage))
    .slice(0, 5)
    .forEach((item) => {
      lines.push(`### ${item.name} (${item.computedScore})`, "");
      lines.push(`- Job: ${item.job}`);
      lines.push(`- Offer: ${item.offer}`);
      lines.push(`- Experiment: ${item.experiment}`);
      lines.push(`- Pass: ${item.passGate}`);
      lines.push(`- Kill: ${item.killGate}`, "");
    });

  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${path.relative(root, outputPath)} with ${sorted.length} opportunities.`);
} else {
  console.log(`Validated ${sorted.length} opportunities. Top score: ${sorted[0].name} (${sorted[0].computedScore}).`);
}
