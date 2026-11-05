/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bin_qr_tokens");
  collection.indexes.push("CREATE UNIQUE INDEX idx_bin_qr_tokens_qr_token ON bin_qr_tokens (qr_token)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("bin_qr_tokens");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_bin_qr_tokens_qr_token"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
