const child_process = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const machineName = process.argv[1];

if (!machineName) {
  console.error("usage: node publish-version.js <machine-name>");
  process.exit(1);
}

const skipMigration = process.argv.includes("--skip-migration");

const migrationPath = path.join(__dirname, "..", "migrations", "migration.ts");

const migrationExists = (() => {
  try {
    fs.accessSync(migrationPath) === null;
    return true;
  } catch (e) {
    return false;
  }
})();

if (!migrationExists && !skipMigration) {
  console.error(
    "no migration found. add a migration to ./migrations/migration.ts or use --skip-migration"
  );
  process.exit(1);
}

// we get the current machine version
const currentVersionResult = child_process.spawnSync("smply", [
  "machines",
  "get",
  "--machine",
  machineName,
]);

if (currentVersionResult.status !== 0) {
  console.error("could not get current machine version");
  console.error(currentVersionResult.stderr.toString("utf8"));
  process.exit(1);
}

const currentVersion = JSON.parse(currentVersionResult.stdout.toString("utf8"))
  .currentVersion.id;

// we create the new machine version
const newVersionResult = child_process.spawnSync("smply", [
  "machine-versions",
  "create",
  "--machine",
  machineName,
  "--make-current",
  "--version-reference",
  new Date().toISOString(),
  "--node",
  path.join(__dirname, "..", "src", "index.js"),
]);

if (newVersionResult.status !== 0) {
  console.error("could not create new machine version");
  console.error(newVersionResult.stderr.toString("utf8"));
  process.exit(1);
}

const newVersion = JSON.parse(
  newVersionResult.stdout.toString("utf8")
).machineVersionId;

console.log("created version", newVersion);

// if we have a migration in ./migrations/migration.ts, we create a migration from current to new machine version and move the migration to the applied directory
if (migrationExists) {
  const migrationResult = child_process.spawnSync("smply", [
    "migrations",
    "create",
    "--machine",
    machineName,
    "--from",
    currentVersion,
    "--to",
    newVersion,
    "--node",
    migrationPath,
  ]);

  if (migrationResult.status !== 0) {
    console.error("could not create migration");
    console.error(migrationResult.stderr.toString("utf8"));
    process.exit(1);
  }

  fs.renameSync(
    migrationPath,
    path.join(
      __dirname,
      "..",
      "migrations",
      "applied",
      `${new Date()
        .toISOString()
        .replace(/T.*/, "")}_${currentVersion}_${newVersion}.ts`
    )
  );

  console.log("created migration between", currentVersion, "and", newVersion);
}
