/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("rewards");

  const record0 = new Record(collection);
    record0.set("reward_name", "BESCOM Electricity Bill Discount");
    record0.set("token_cost", 500);
    record0.set("category", "electricity");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("reward_name", "Local Grocery Voucher");
    record1.set("token_cost", 300);
    record1.set("category", "grocery");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
