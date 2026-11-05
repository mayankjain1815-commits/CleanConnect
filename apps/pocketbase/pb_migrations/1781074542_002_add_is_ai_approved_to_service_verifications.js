/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("service_verifications");

  const existing = collection.fields.getByName("is_ai_approved");
  if (existing) {
    if (existing.type === "bool") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("is_ai_approved"); // exists with wrong type, remove first
  }

  collection.fields.add(new BoolField({
    name: "is_ai_approved",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("service_verifications");
    collection.fields.removeByName("is_ai_approved");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
