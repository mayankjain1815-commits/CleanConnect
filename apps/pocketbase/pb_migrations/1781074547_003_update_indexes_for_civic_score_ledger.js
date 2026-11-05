/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("civic_score_ledger");
  collection.indexes.push("CREATE INDEX idx_civic_score_ledger_citizen_id ON civic_score_ledger (citizen_id)");
  collection.indexes.push("CREATE INDEX idx_civic_score_ledger_timestamp ON civic_score_ledger (timestamp)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("civic_score_ledger");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_civic_score_ledger_citizen_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_civic_score_ledger_timestamp"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
