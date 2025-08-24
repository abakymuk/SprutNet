#!/usr/bin/env node

/**
 * Скрипт для загрузки данных из Maersk API в базу данных
 *
 * Использование:
 * node scripts/load_maersk_data.js [api_type]
 *
 * Примеры:
 * node scripts/load_maersk_data.js vessels
 * node scripts/load_maersk_data.js locations
 * node scripts/load_maersk_data.js ocean-products
 * node scripts/load_maersk_data.js deadlines
 */

const https = require("https");
const { PrismaClient } = require("@prisma/client");

// Загружаем переменные окружения
require("dotenv").config({ path: ".env" });

const prisma = new PrismaClient();

// Конфигурация Maersk API
const MAERSK_CONFIG = {
  apiKey: process.env.MAERSK_API_KEY,
  apiSecret: process.env.MAERSK_API_SECRET,
  baseUrls: {
    vessels: "https://api.maersk.com/reference-data",
    locations: "https://api.maersk.com/reference-data",
    "ocean-products": "https://api.maersk.com/products",
    deadlines: "https://api.maersk.com",
  },
};

// Функция для выполнения HTTP запросов
function makeRequest(hostname, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Consumer-Key": MAERSK_CONFIG.apiKey,
        "User-Agent": "SprutNet/1.0",
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

// Функция для загрузки данных о судах
async function loadVesselsData() {
  console.log("🚢 Загружаем данные о судах...");

  try {
    const response = await makeRequest(
      "api.maersk.com",
      "/reference-data/vessels?limit=50"
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Получено ${response.data.length} судов`);

      for (const vessel of response.data) {
        try {
          await prisma.vessels.upsert({
            where: { vessel_imo_number: vessel.vesselIMONumber },
            update: {
              carrier_vessel_code: vessel.carrierVesselCode,
              vessel_short_name: vessel.vesselShortName,
              vessel_long_name: vessel.vesselLongName,
              vessel_flag_code: vessel.vesselFlagCode,
              vessel_built_year: vessel.vesselBuiltYear,
              vessel_call_sign: vessel.vesselCallSign,
              vessel_capacity_teu: vessel.vesselCapacityTEU,
            },
            create: {
              vessel_imo_number: vessel.vesselIMONumber,
              carrier_vessel_code: vessel.carrierVesselCode,
              vessel_short_name: vessel.vesselShortName,
              vessel_long_name: vessel.vesselLongName,
              vessel_flag_code: vessel.vesselFlagCode,
              vessel_built_year: vessel.vesselBuiltYear,
              vessel_call_sign: vessel.vesselCallSign,
              vessel_capacity_teu: vessel.vesselCapacityTEU,
            },
          });
        } catch (error) {
          console.error(
            `❌ Ошибка при сохранении судна ${vessel.vesselIMONumber}:`,
            error.message
          );
        }
      }

      console.log("✅ Данные о судах загружены успешно");
    } else {
      console.error(
        "❌ Ошибка при получении данных о судах:",
        response.status,
        response.data
      );
    }
  } catch (error) {
    console.error("❌ Ошибка при загрузке данных о судах:", error.message);
  }
}

// Функция для загрузки данных о локациях
async function loadLocationsData() {
  console.log("📍 Загружаем данные о локациях...");

  try {
    const response = await makeRequest(
      "api.maersk.com",
      "/reference-data/locations?limit=100"
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Получено ${response.data.length} локаций`);

      for (const location of response.data) {
        try {
          await prisma.locations.upsert({
            where: { carrier_geo_id: location.carrierGeoID },
            update: {
              country_code: location.countryCode,
              country_name: location.countryName,
              un_location_code: location.unLocationCode,
              city_name: location.cityName,
              un_region_code: location.unRegionCode,
              un_region_name: location.unRegionName,
              location_type: location.locationType,
              location_name: location.locationName,
            },
            create: {
              carrier_geo_id: location.carrierGeoID,
              country_code: location.countryCode,
              country_name: location.countryName,
              un_location_code: location.unLocationCode,
              city_name: location.cityName,
              un_region_code: location.unRegionCode,
              un_region_name: location.unRegionName,
              location_type: location.locationType,
              location_name: location.locationName,
            },
          });
        } catch (error) {
          console.error(
            `❌ Ошибка при сохранении локации ${location.carrierGeoID}:`,
            error.message
          );
        }
      }

      console.log("✅ Данные о локациях загружены успешно");
    } else {
      console.error(
        "❌ Ошибка при получении данных о локациях:",
        response.status,
        response.data
      );
    }
  } catch (error) {
    console.error("❌ Ошибка при загрузке данных о локациях:", error.message);
  }
}

// Функция для загрузки данных о сроках
async function loadDeadlinesData() {
  console.log("⏰ Загружаем данные о сроках...");

  try {
    // Получаем список судов для запроса сроков
    const vessels = await prisma.vessels.findMany({
      take: 5,
      select: { vessel_imo_number: true },
    });

    if (vessels.length === 0) {
      console.log("⚠️ Нет судов в базе данных для запроса сроков");
      return;
    }

    for (const vessel of vessels) {
      try {
        const params = new URLSearchParams({
          ISOCountryCode: "US",
          portOfLoad: "Los Angeles",
          vesselIMONumber: vessel.vessel_imo_number.toString(),
          voyage: "001E",
        });

        const response = await makeRequest(
          "api.maersk.com",
          `/shipment-deadlines?${params.toString()}`
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          console.log(
            `📊 Получено ${response.data.length} сроков для судна ${vessel.vessel_imo_number}`
          );

          for (const deadlineData of response.data) {
            if (deadlineData.shipmentDeadlines) {
              const shipmentDeadline = await prisma.shipmentDeadlines.create({
                data: {
                  vessel_imo_number: vessel.vessel_imo_number,
                  voyage: "001E",
                  port_of_load: "Los Angeles",
                  iso_country_code: "US",
                },
              });

              for (const deadline of deadlineData.shipmentDeadlines.deadlines) {
                await prisma.deadlines.create({
                  data: {
                    shipment_deadline_id: shipmentDeadline.id,
                    deadline_name: deadline.deadlineName,
                    deadline_local: new Date(deadline.deadlineLocal),
                  },
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(
          `❌ Ошибка при загрузке сроков для судна ${vessel.vessel_imo_number}:`,
          error.message
        );
      }
    }

    console.log("✅ Данные о сроках загружены успешно");
  } catch (error) {
    console.error("❌ Ошибка при загрузке данных о сроках:", error.message);
  }
}

// Функция для загрузки данных о расписаниях
async function loadOceanProductsData() {
  console.log("🚢 Загружаем данные о расписаниях...");

  try {
    // Получаем локации для запроса расписаний
    const locations = await prisma.locations.findMany({
      where: { city_name: { in: ["Houston", "Rotterdam"] } },
      take: 2,
      select: { carrier_geo_id: true, city_name: true },
    });

    if (locations.length < 2) {
      console.log("⚠️ Недостаточно локаций для запроса расписаний");
      return;
    }

    const [origin, destination] = locations;

    const params = new URLSearchParams({
      carrierCollectionOriginGeoID: origin.carrier_geo_id,
      carrierDeliveryDestinationGeoID: destination.carrier_geo_id,
      vesselOperatorCarrierCode: "MAEU",
      cargoType: "DRY",
      ISOEquipmentCode: "42G1",
      stuffingWeight: "18000",
      weightMeasurementUnit: "KGS",
      stuffingVolume: "10",
      volumeMeasurementUnit: "MTQ",
      exportServiceMode: "CY",
      importServiceMode: "CY",
      startDateType: "D",
      dateRange: "P4W",
    });

    const response = await makeRequest(
      "api.maersk.com",
      `/products/ocean-products?${params.toString()}`
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Получено ${response.data.length} расписаний`);

      for (const product of response.data) {
        try {
          const oceanProduct = await prisma.oceanProducts.create({
            data: {
              vessel_operator_carrier_code: product.vesselOperatorCarrierCode,
              carrier_product_id: product.carrierProductId,
              carrier_product_sequence_id: product.carrierProductSequenceId,
              product_valid_from_date: product.productValidFromDate,
              product_valid_to_date: product.productValidToDate,
              numberofproductlinks: product.numberOfProductLinks?.toString(),
            },
          });

          // Сохраняем связанные данные (транспортные расписания, ноги, транспорты)
          if (product.transportSchedules) {
            for (const schedule of product.transportSchedules) {
              const transportSchedule = await prisma.transportSchedules.create({
                data: {
                  ocean_product_id: oceanProduct.id,
                  departure_date_time: schedule.departureDateTime,
                  arrival_date_time: schedule.arrivalDateTime,
                  transit_time: schedule.transitTime,
                },
              });

              // Сохраняем ноги транспорта
              if (schedule.transportLegs) {
                for (const leg of schedule.transportLegs) {
                  const transportLeg = await prisma.transportLegs.create({
                    data: {
                      transport_schedule_id: transportSchedule.id,
                      departure_date_time: leg.departureDateTime,
                      arrival_date_time: leg.arrivalDateTime,
                    },
                  });

                  // Сохраняем транспорты
                  if (leg.transports) {
                    for (const transport of leg.transports) {
                      await prisma.transports.create({
                        data: {
                          transport_leg_id: transportLeg.id,
                          vessel_imo_number: transport.vesselIMONumber,
                          carrier_vessel_code: transport.carrierVesselCode,
                          vessel_name: transport.vesselName,
                          transport_mode: transport.transportMode,
                          carrier_trade_lane_name:
                            transport.carrierTradeLaneName,
                          carrier_departure_voyage_number:
                            transport.carrierDepartureVoyageNumber,
                          inducement_link_flag: transport.inducementLinkFlag,
                          carrier_service_code: transport.carrierServiceCode,
                          carrier_service_name: transport.carrierServiceName,
                          link_direction: transport.linkDirection,
                          carrier_code: transport.carrierCode,
                          routing_type: transport.routingType,
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Ошибка при сохранении расписания:`, error.message);
        }
      }

      console.log("✅ Данные о расписаниях загружены успешно");
    } else {
      console.error(
        "❌ Ошибка при получении данных о расписаниях:",
        response.status,
        response.data
      );
    }
  } catch (error) {
    console.error(
      "❌ Ошибка при загрузке данных о расписаниях:",
      error.message
    );
  }
}

// Главная функция
async function main() {
  const apiType = process.argv[2];

  if (!apiType) {
    console.log("📋 Доступные типы данных:");
    console.log("  vessels - данные о судах");
    console.log("  locations - данные о локациях");
    console.log("  deadlines - данные о сроках");
    console.log("  ocean-products - данные о расписаниях");
    console.log("  all - загрузить все данные");
    console.log("");
    console.log("Пример: node scripts/load_maersk_data.js vessels");
    process.exit(1);
  }

  try {
    console.log("🔗 Подключение к базе данных...");
    await prisma.$connect();
    console.log("✅ Подключение установлено");

    switch (apiType) {
      case "vessels":
        await loadVesselsData();
        break;
      case "locations":
        await loadLocationsData();
        break;
      case "deadlines":
        await loadDeadlinesData();
        break;
      case "ocean-products":
        await loadOceanProductsData();
        break;
      case "all":
        await loadVesselsData();
        await loadLocationsData();
        await loadDeadlinesData();
        await loadOceanProductsData();
        break;
      default:
        console.error("❌ Неизвестный тип данных:", apiType);
        process.exit(1);
    }

    console.log("🎉 Загрузка данных завершена");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = {
  loadVesselsData,
  loadLocationsData,
  loadDeadlinesData,
  loadOceanProductsData,
};
