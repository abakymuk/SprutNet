import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Функция для выполнения HTTP запросов к Maersk API
async function makeRequest(hostname: string, path: string, headers: Record<string, string> = {}) {
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Consumer-Key': process.env.MAERSK_API_KEY,
        'User-Agent': 'SprutNet/1.0',
        ...headers
      }
    };

    const req = https.request(options, (res: any) => {
      let data = '';
      
      res.on('data', (chunk: any) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error: any) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Функция для загрузки данных о судах
async function loadVesselsData() {
  console.log('🚢 Загружаем данные о судах...');
  
  try {
    const response: any = await makeRequest('api-stage.maersk.com', '/reference-data/vessels?limit=50');
    
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Получено ${response.data.length} судов`);
      
      for (const vessel of response.data) {
        try {
          await prisma.vessel.upsert({
            where: { id: vessel.vesselIMONumber },
            update: {
              carrierVesselCode: vessel.carrierVesselCode,
              vesselShortName: vessel.vesselShortName,
              vesselLongName: vessel.vesselLongName,
              vesselFlagCode: vessel.vesselFlagCode,
              vessel_built_year: vessel.vesselBuiltYear,
              vesselCallSign: vessel.vesselCallSign,
              vesselCapacityTeu: vessel.vesselCapacityTEU
            },
            create: {
              id: vessel.vesselIMONumber,
              carrierVesselCode: vessel.carrierVesselCode,
              vesselShortName: vessel.vesselShortName,
              vesselLongName: vessel.vesselLongName,
              vesselFlagCode: vessel.vesselFlagCode,
              vessel_built_year: vessel.vesselBuiltYear,
              vesselCallSign: vessel.vesselCallSign,
              vesselCapacityTeu: vessel.vesselCapacityTEU
            }
          });
        } catch (error) {
          console.error(`❌ Ошибка при сохранении судна ${vessel.vesselIMONumber}:`, error);
        }
      }
      
      return { success: true, count: response.data.length };
    } else {
      return { success: false, error: `Ошибка API: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных о судах:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
}

// Функция для загрузки данных о локациях
async function loadLocationsData() {
  console.log('📍 Загружаем данные о локациях...');
  
  try {
    const response: any = await makeRequest('api-stage.maersk.com', '/reference-data/locations?limit=100');
    
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Получено ${response.data.length} локаций`);
      
      for (const location of response.data) {
        try {
          await prisma.location.upsert({
            where: { id: location.carrierGeoID },
            update: {
              countryCode: location.countryCode,
              countryName: location.countryName,
              unLocationCode: location.unLocationCode,
              cityName: location.cityName,
              unRegionCode: location.unRegionCode,
              unRegionName: location.unRegionName,
              locationType: location.locationType,
              locationName: location.locationName
            },
            create: {
              id: location.carrierGeoID,
              countryCode: location.countryCode,
              countryName: location.countryName,
              unLocationCode: location.unLocationCode,
              cityName: location.cityName,
              unRegionCode: location.unRegionCode,
              unRegionName: location.unRegionName,
              locationType: location.locationType,
              locationName: location.locationName
            }
          });
        } catch (error) {
          console.error(`❌ Ошибка при сохранении локации ${location.carrierGeoID}:`, error);
        }
      }
      
      return { success: true, count: response.data.length };
    } else {
      return { success: false, error: `Ошибка API: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных о локациях:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
}

// Функция для загрузки данных о сроках
async function loadDeadlinesData() {
  console.log('⏰ Загружаем данные о сроках...');
  
  try {
    // Получаем список судов для запроса сроков
    const vessels = await prisma.vessel.findMany({
      take: 5,
      select: { id: true }
    });
    
    if (vessels.length === 0) {
      return { success: false, error: 'Нет судов в базе данных для запроса сроков' };
    }
    
    let totalDeadlines = 0;
    
    for (const vessel of vessels) {
      try {
        const params = new URLSearchParams({
          ISOCountryCode: 'US',
          portOfLoad: 'Los Angeles',
          vesselIMONumber: vessel.id.toString(),
          voyage: '001E'
        });
        
        const response: any = await makeRequest('api-stage.maersk.com', `/shipment-deadlines?${params.toString()}`);
        
        if (response.status === 200 && Array.isArray(response.data)) {
          console.log(`📊 Получено ${response.data.length} сроков для судна ${vessel.id}`);
          
          for (const deadlineData of response.data) {
            if (deadlineData.shipmentDeadlines) {
              const shipmentDeadline = await prisma.shipmentDeadline.create({
                data: {
                  id: `deadline-${vessel.id}-${Date.now()}`,
                  vesselId: vessel.id,
                  transportId: 'transport-001',
                  deadlineType: 'CUTOFF',
                  deadlineDateTime: new Date(),
                  location: 'USLAX',
                  description: 'Voyage 001E from Los Angeles'
                }
              });
              
              for (const deadline of deadlineData.shipmentDeadlines.deadlines) {
                await prisma.deadline.create({
                  data: {
                    id: `deadline-detail-${Date.now()}-${Math.random()}`,
                    shipmentDeadlineId: shipmentDeadline.id,
                    deadlineType: deadline.deadlineType || 'CUTOFF',
                    deadlineDateTime: new Date(deadline.deadlineLocal),
                    location: deadline.location,
                    description: deadline.deadlineName
                  }
                });
                totalDeadlines++;
              }
            }
          }
        }
              } catch (error) {
          console.error(`❌ Ошибка при загрузке сроков для судна ${vessel.id}:`, error);
        }
    }
    
    return { success: true, count: totalDeadlines };
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных о сроках:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
}

// Функция для загрузки данных о расписаниях
async function loadOceanProductsData() {
  console.log('🚢 Загружаем данные о расписаниях...');
  
  try {
    // Получаем локации для запроса расписаний
    const locations = await prisma.location.findMany({
      where: { cityName: { in: ['Houston', 'Rotterdam'] } },
      take: 2,
      select: { id: true, cityName: true }
    });
    
    if (locations.length < 2) {
      return { success: false, error: 'Недостаточно локаций для запроса расписаний' };
    }
    
    const [origin, destination] = locations;
    
    const params = new URLSearchParams({
      carrierCollectionOriginGeoID: origin.id,
      carrierDeliveryDestinationGeoID: destination.id,
      vesselOperatorCarrierCode: 'MAEU',
      cargoType: 'DRY',
      ISOEquipmentCode: '42G1',
      stuffingWeight: '18000',
      weightMeasurementUnit: 'KGS',
      stuffingVolume: '10',
      volumeMeasurementUnit: 'MTQ',
      exportServiceMode: 'CY',
      importServiceMode: 'CY',
      startDateType: 'D',
      dateRange: 'P4W'
    });
    
    const response: any = await makeRequest('api-stage.maersk.com', `/products/ocean-products?${params.toString()}`);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Получено ${response.data.length} расписаний`);
      
      let totalProducts = 0;
      
      for (const product of response.data) {
        try {
          const oceanProduct = await prisma.oceanProduct.create({
            data: {
              id: `product-${product.carrierProductId || Date.now()}`,
              carrierCode: product.vesselOperatorCarrierCode || 'MAEU',
              productName: product.carrierProductId || 'Default Product',
              productType: 'OCEAN',
              description: `Product ${product.carrierProductId}`
            }
          });
          
          totalProducts++;
          
          // Сохраняем связанные данные (транспортные расписания, ноги, транспорты)
          if (product.transportSchedules) {
            for (const schedule of product.transportSchedules) {
              const transportSchedule = await prisma.transportSchedule.create({
                data: {
                  id: `schedule-${Date.now()}-${Math.random()}`,
                  oceanProductId: oceanProduct.id,
                  pol: schedule.pol || 'USLAX',
                  pod: schedule.pod || 'NLRTM',
                  effectiveFrom: new Date(schedule.departureDateTime),
                  effectiveTo: schedule.arrivalDateTime ? new Date(schedule.arrivalDateTime) : null
                }
              });
              
              // Сохраняем ноги транспорта
              if (schedule.transportLegs) {
                for (const leg of schedule.transportLegs) {
                  const transportLeg = await prisma.transportLeg.create({
                    data: {
                      id: `leg-${Date.now()}-${Math.random()}`,
                      scheduleId: transportSchedule.id,
                      legSequence: leg.legSequence || 1,
                      transportMode: leg.transportMode || 'OCE',
                      fromLocation: leg.fromLocation || 'USLAX',
                      toLocation: leg.toLocation || 'NLRTM',
                      estimatedDuration: leg.estimatedDuration
                    }
                  });
                  
                  // Сохраняем транспорты
                  if (leg.transports) {
                    for (const transport of leg.transports) {
                      await prisma.transport.create({
                        data: {
                          id: `transport-${Date.now()}-${Math.random()}`,
                          legId: transportLeg.id,
                          vesselId: transport.vesselIMONumber,
                          departureTime: new Date(transport.departureDateTime),
                          arrivalTime: new Date(transport.arrivalDateTime),
                          status: 'SCHEDULED',
                          transportModeId: transport.transportMode || 'OCE'
                        }
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Ошибка при сохранении расписания:`, error);
        }
      }
      
      return { success: true, count: totalProducts };
    } else {
      return { success: false, error: `Ошибка API: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных о расписаниях:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type) {
      return NextResponse.json({ error: 'Тип данных не указан' }, { status: 400 });
    }
    
    let result;
    
    switch (type) {
      case 'vessels':
        result = await loadVesselsData();
        break;
      case 'locations':
        result = await loadLocationsData();
        break;
      case 'deadlines':
        result = await loadDeadlinesData();
        break;
      case 'ocean-products':
        result = await loadOceanProductsData();
        break;
      default:
        return NextResponse.json({ error: 'Неизвестный тип данных' }, { status: 400 });
    }
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Данные ${type} загружены успешно`,
        count: result.count 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Ошибка в API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
