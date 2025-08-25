// Test current Maersk API status
async function testCurrentMaerskAPI() {
  const consumerKey = "IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Consumer-Key": consumerKey,
    "User-Agent": "SprutNet/1.0",
  };

  console.log("🔍 Testing current Maersk API status...");

  try {
    // Test Locations API
    console.log("\n📍 Testing Locations API...");
    const locationsUrl =
      "https://api.maersk.com/reference-data/locations?limit=1";
    const locationsResponse = await fetch(locationsUrl, { headers });
    console.log("Locations Status:", locationsResponse.status);

    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      console.log("✅ Locations API: SUCCESS");
      console.log("Data sample:", JSON.stringify(locationsData, null, 2));
    } else {
      const errorText = await locationsResponse.text();
      console.log("❌ Locations API: FAILED");
      console.log("Error:", errorText.substring(0, 200) + "...");
    }

    // Test Vessels API
    console.log("\n🚢 Testing Vessels API...");
    const vesselsUrl = "https://api.maersk.com/reference-data/vessels?limit=1";
    const vesselsResponse = await fetch(vesselsUrl, { headers });
    console.log("Vessels Status:", vesselsResponse.status);

    if (vesselsResponse.ok) {
      const vesselsData = await vesselsResponse.json();
      console.log("✅ Vessels API: SUCCESS");
      console.log("Data sample:", JSON.stringify(vesselsData, null, 2));
    } else {
      const errorText = await vesselsResponse.text();
      console.log("❌ Vessels API: FAILED");
      console.log("Error:", errorText.substring(0, 200) + "...");
    }
  } catch (error) {
    console.error("❌ Error testing Maersk API:", error.message);
  }
}

testCurrentMaerskAPI();
