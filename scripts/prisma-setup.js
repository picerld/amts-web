const { execSync } = require("child_process");

function run(cmd) {
  console.log(`➡ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

(async () => {
  try {
    run("npx prisma generate");

    run("npx prisma migrate dev --name init");

    run("npx prisma db seed");

    console.log("✅ Prisma setup completed.");
  } catch (err) {
    console.error("❌ Prisma setup failed:", err);
    process.exit(1);
  }
})();
