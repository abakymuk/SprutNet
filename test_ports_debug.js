// Debug test for ports API
async function testPortsDebug() {
  console.log("🔍 Testing ports API debug...");

  try {
    // Test direct Maersk API
    console.log("\n📍 Testing direct Maersk Locations API...");
    const response = await fetch(
      "https://api.maersk.com/reference-data/locations",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Consumer-Key": "IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd",
          "User-Agent": "SprutNet/1.0",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Direct API: SUCCESS");
      console.log(`📊 Total locations: ${data.length}`);
      console.log(
        "🔍 First 3 locations:",
        JSON.stringify(data.slice(0, 3), null, 2)
      );

      // Test our filter function
      const {
        filterPorts,
        mapLocationToPortRef,
        searchPorts,
      } = require("./apps/web/src/lib/types/ports.ts");

      const filtered = filterPorts(data);
      console.log(`🚢 Filtered ports: ${filtered.length}`);
      console.log(
        "🔍 First 3 filtered:",
        JSON.stringify(filtered.slice(0, 3), null, 2)
      );

      const mapped = filtered.map(mapLocationToPortRef);
      console.log(`🗺️ Mapped ports: ${mapped.length}`);
      console.log(
        "🔍 First 3 mapped:",
        JSON.stringify(mapped.slice(0, 3), null, 2)
      );

      const searched = searchPorts(mapped, "sha");
      console.log(`🔍 Search results for "sha": ${searched.length}`);
      console.log("🔍 Search results:", JSON.stringify(searched, null, 2));
    } else {
      console.log("❌ Direct API: FAILED");
      const errorText = await response.text();
      console.log("Error:", errorText.substring(0, 200));
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testPortsDebug();
