// Using built-in fetch in Node.js

async function testMaerskAPI() {
  const consumerKey = "IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd";
  const clientSecret = "CnIcg3YgUUtSp8a3";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Consumer-Key": consumerKey,
    "User-Agent": "SprutNet/1.0",
  };

  console.log("🔍 Testing Maersk API directly...");

  try {
    // Test Locations API
    console.log("\n📍 Testing Locations API...");
    const locationsUrl =
      "https://api.maersk.com/reference-data/locations?limit=5";
    const locationsResponse = await fetch(locationsUrl, { headers });
    console.log("Locations Status:", locationsResponse.status);
    console.log(
      "Locations Headers:",
      Object.fromEntries(locationsResponse.headers.entries())
    );

    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      console.log("Locations Data:", JSON.stringify(locationsData, null, 2));
    } else {
      const errorText = await locationsResponse.text();
      console.log("Locations Error:", errorText);
    }

    // Test Vessels API
    console.log("\n🚢 Testing Vessels API...");
    const vesselsUrl = "https://api.maersk.com/reference-data/vessels?limit=1";
    const vesselsResponse = await fetch(vesselsUrl, { headers });
    console.log("Vessels Status:", vesselsResponse.status);

    if (vesselsResponse.ok) {
      const vesselsData = await vesselsResponse.json();
      console.log("Vessels Data:", JSON.stringify(vesselsData, null, 2));
    } else {
      const errorText = await vesselsResponse.text();
      console.log("Vessels Error:", errorText);
    }
  } catch (error) {
    console.error("❌ Error testing Maersk API:", error);
  }
}

testMaerskAPI();
