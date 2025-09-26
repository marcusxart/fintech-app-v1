const { Users, Settings } = require("../database/models");

(async () => {
  try {
    const users = await Users.findAll();

    for (const user of users) {
      const existing = await Settings.findOne({ where: { userId: user.id } });
      if (!existing) {
        await Settings.create({
          userId: user.id,
          twoFactorEnabled: false,
          twoFactorSecret: null,
        });
      }
    }

    console.log("✅ Backfill complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error backfilling settings:", err);
    process.exit(1);
  }
})();
