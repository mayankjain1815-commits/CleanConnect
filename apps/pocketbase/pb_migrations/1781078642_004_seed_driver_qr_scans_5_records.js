/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("driver_qr_scans");

  const record0 = new Record(collection);
    record0.set("driver_id", "demo_driver_1");
    record0.set("citizen_id", "demo_citizen_1");
    record0.set("gps_lat_at_scan", 40.7128);
    record0.set("gps_lng_at_scan", -74.006);
    record0.set("is_location_valid", true);
    record0.set("distance_meters", 12);
    record0.set("scan_status", "success");
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
    record1.set("driver_id", "demo_driver_1");
    record1.set("citizen_id", "demo_citizen_2");
    record1.set("gps_lat_at_scan", 40.758);
    record1.set("gps_lng_at_scan", -73.9855);
    record1.set("is_location_valid", true);
    record1.set("distance_meters", 8);
    record1.set("scan_status", "success");
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
    record2.set("driver_id", "demo_driver_2");
    record2.set("citizen_id", "demo_citizen_1");
    record2.set("gps_lat_at_scan", 40.715);
    record2.set("gps_lng_at_scan", -74.008);
    record2.set("is_location_valid", false);
    record2.set("distance_meters", 45);
    record2.set("scan_status", "location_mismatch");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("driver_id", "demo_driver_1");
    record3.set("citizen_id", "demo_citizen_3");
    record3.set("gps_lat_at_scan", 40.7489);
    record3.set("gps_lng_at_scan", -73.968);
    record3.set("is_location_valid", true);
    record3.set("distance_meters", 5);
    record3.set("scan_status", "success");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("driver_id", "demo_driver_2");
    record4.set("citizen_id", "demo_citizen_2");
    record4.set("gps_lat_at_scan", 40.76);
    record4.set("gps_lng_at_scan", -73.99);
    record4.set("is_location_valid", false);
    record4.set("distance_meters", 62);
    record4.set("scan_status", "location_mismatch");
  try {
    app.save(record4);
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
