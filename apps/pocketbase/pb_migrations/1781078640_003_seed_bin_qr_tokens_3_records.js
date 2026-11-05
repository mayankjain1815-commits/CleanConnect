/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bin_qr_tokens");

  const record0 = new Record(collection);
    record0.set("citizen_id", "demo_citizen_1");
    record0.set("qr_token", "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2");
    record0.set("house_address", "42 Maple Street, Downtown Zone");
    record0.set("geofence_lat", 40.7128);
    record0.set("geofence_lng", -74.006);
    record0.set("is_active", true);
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
    record1.set("citizen_id", "demo_citizen_2");
    record1.set("qr_token", "f2e3d4c5b6a7z8y9x0w1v2u3t4s5r6q7p8o9n0m1l2k3j4i5h6g7f8e9d0c1b2");
    record1.set("house_address", "156 Oak Avenue, Riverside Zone");
    record1.set("geofence_lat", 40.758);
    record1.set("geofence_lng", -73.9855);
    record1.set("is_active", true);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("citizen_id", "demo_citizen_3");
    record2.set("qr_token", "c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0");
    record2.set("house_address", "89 Pine Road, Hillside Zone");
    record2.set("geofence_lat", 40.7489);
    record2.set("geofence_lng", -73.968);
    record2.set("is_active", true);
  try {
    app.save(record2);
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
