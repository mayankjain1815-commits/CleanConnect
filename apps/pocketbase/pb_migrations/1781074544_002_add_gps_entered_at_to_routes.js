/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");

  const existing = collection.fields.getByName("gps_entered_at");
  if (existing) {
    if (existing.type === "autodate") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("gps_entered_at"); // exists with wrong type, remove first
  }

  collection.fields.add(new AutodateField({
    name: "gps_entered_at",
    onCreate: false,
    onUpdate: true
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("gps_entered_at");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
