// Comprehensive test scenarios for real Maersk API
async function testRealAPIScenarios() {
  console.log("🚢 Testing Real Maersk API Scenarios...\n");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Consumer-Key": "IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd",
    "User-Agent": "SprutNet/1.0",
  };

  const scenarios = [
    {
      name: "Locations API - Full Dataset",
      url: "https://api.maersk.com/reference-data/locations",
      description: "Get all available locations",
    },
    {
      name: "Vessels API - Large Dataset",
      url: "https://api.maersk.com/reference-data/vessels?limit=100",
      description: "Get 100 vessels for performance testing",
    },
    {
      name: "Vessels API - Specific IMO",
      url: "https://api.maersk.com/reference-data/vessels?vesselIMONumbers=9875381",
      description: "Get specific vessel by IMO",
    },
    {
      name: "Vessels API - By Carrier Code",
      url: "https://api.maersk.com/reference-data/vessels?carrierVesselCodes=DX2",
      description: "Get vessels by carrier code",
    },
    {
      name: "Locations API - By Country",
      url: "https://api.maersk.com/reference-data/locations",
      description: "Filter locations by country (post-processing)",
    },
  ];

  const results = [];

  for (const scenario of scenarios) {
    console.log(`🔍 Testing: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);

    const startTime = Date.now();

    try {
      const response = await fetch(scenario.url, { headers });
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        const dataSize = JSON.stringify(data).length;

        console.log(
          `✅ SUCCESS - Status: ${response.status}, Duration: ${duration}ms, Data Size: ${dataSize} bytes`
        );
        console.log(`📊 Records: ${Array.isArray(data) ? data.length : "N/A"}`);

        // Analyze data structure
        if (Array.isArray(data) && data.length > 0) {
          const sample = data[0];
          console.log(`🔍 Sample fields: ${Object.keys(sample).join(", ")}`);

          // Special analysis for locations
          if (scenario.name.includes("Locations")) {
            const countries = [
              ...new Set(data.map((item) => item.countryCode).filter(Boolean)),
            ];
            const locationTypes = [
              ...new Set(data.map((item) => item.locationType).filter(Boolean)),
            ];
            console.log(`🌍 Countries: ${countries.join(", ")}`);
            console.log(`📍 Location Types: ${locationTypes.join(", ")}`);
          }

          // Special analysis for vessels
          if (scenario.name.includes("Vessels")) {
            const carriers = [
              ...new Set(
                data.map((item) => item.carrierVesselCode).filter(Boolean)
              ),
            ];
            const flags = [
              ...new Set(
                data.map((item) => item.vesselFlagCode).filter(Boolean)
              ),
            ];
            console.log(
              `🚢 Carriers: ${carriers.slice(0, 5).join(", ")}${carriers.length > 5 ? "..." : ""}`
            );
            console.log(
              `🏴 Flags: ${flags.slice(0, 5).join(", ")}${flags.length > 5 ? "..." : ""}`
            );
          }
        }

        results.push({
          scenario: scenario.name,
          status: "SUCCESS",
          duration,
          dataSize,
          recordCount: Array.isArray(data) ? data.length : "N/A",
        });
      } else {
        console.log(`❌ FAILED - Status: ${response.status}`);
        const errorText = await response.text();
        console.log(`📄 Error: ${errorText.substring(0, 200)}...`);

        results.push({
          scenario: scenario.name,
          status: "FAILED",
          duration: Date.now() - startTime,
          error: response.status,
        });
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      results.push({
        scenario: scenario.name,
        status: "ERROR",
        duration: Date.now() - startTime,
        error: error.message,
      });
    }

    console.log("─".repeat(80) + "\n");
  }

  // Summary
  console.log("📊 TEST RESULTS SUMMARY:");
  console.log("─".repeat(80));

  const successful = results.filter((r) => r.status === "SUCCESS").length;
  const failed = results.filter((r) => r.status !== "SUCCESS").length;
  const avgDuration =
    results.filter((r) => r.duration).reduce((sum, r) => sum + r.duration, 0) /
    results.filter((r) => r.duration).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️ Average Duration: ${Math.round(avgDuration)}ms`);

  console.log("\n📋 Detailed Results:");
  results.forEach((result) => {
    const status = result.status === "SUCCESS" ? "✅" : "❌";
    console.log(
      `${status} ${result.scenario}: ${result.status} (${result.duration}ms)`
    );
  });
}

// Performance stress test
async function performanceStressTest() {
  console.log("\n🔥 PERFORMANCE STRESS TEST\n");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Consumer-Key": "IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd",
    "User-Agent": "SprutNet/1.0",
  };

  const testUrl = "https://api.maersk.com/reference-data/vessels?limit=10";
  const iterations = 5;
  const results = [];

  console.log(`🔄 Running ${iterations} concurrent requests...`);

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();

    try {
      const response = await fetch(testUrl, { headers });
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        results.push({
          iteration: i + 1,
          status: "SUCCESS",
          duration,
          dataSize: JSON.stringify(data).length,
        });
        console.log(`✅ Request ${i + 1}: ${duration}ms`);
      } else {
        results.push({
          iteration: i + 1,
          status: "FAILED",
          duration: endTime - startTime,
          error: response.status,
        });
        console.log(`❌ Request ${i + 1}: Failed (${response.status})`);
      }
    } catch (error) {
      results.push({
        iteration: i + 1,
        status: "ERROR",
        duration: Date.now() - startTime,
        error: error.message,
      });
      console.log(`❌ Request ${i + 1}: Error (${error.message})`);
    }
  }

  // Performance analysis
  const successful = results.filter((r) => r.status === "SUCCESS");
  const durations = successful.map((r) => r.duration);
  const avgDuration =
    durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  console.log("\n📊 Performance Analysis:");
  console.log(`⏱️ Average: ${Math.round(avgDuration)}ms`);
  console.log(`⚡ Min: ${minDuration}ms`);
  console.log(`🐌 Max: ${maxDuration}ms`);
  console.log(
    `📈 Success Rate: ${((successful.length / iterations) * 100).toFixed(1)}%`
  );
}

// Run all tests
async function runAllTests() {
  await testRealAPIScenarios();
  await performanceStressTest();
}

runAllTests();
