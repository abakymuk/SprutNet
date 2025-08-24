import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🌱 Заполняем базу данных тестовыми данными...');

    // Создаем тестовые страны
    const countries = await Promise.all([
      prisma.country.upsert({
        where: { id: 'US' },
        update: {},
        create: {
          id: 'US',
          countryName: 'United States'
        }
      }),
      prisma.country.upsert({
        where: { id: 'NL' },
        update: {},
        create: {
          id: 'NL',
          countryName: 'Netherlands'
        }
      }),
      prisma.country.upsert({
        where: { id: 'CN' },
        update: {},
        create: {
          id: 'CN',
          countryName: 'China'
        }
      }),
      prisma.country.upsert({
        where: { id: 'DK' },
        update: {},
        create: {
          id: 'DK',
          countryName: 'Denmark'
        }
      })
    ]);

    console.log(`✅ Создано ${countries.length} стран`);

    // Создаем тестовые суда
    const vessels = await Promise.all([
      prisma.vessel.upsert({
        where: { id: 9456783 },
        update: {},
        create: {
          id: 9456783,
          carrierVesselCode: 'MAE',
          vesselShortName: 'MAERSK SEVILLE',
          vesselLongName: 'MAERSK SEVILLE',
          vesselFlagCode: 'DK',
          vessel_built_year: 2010,
          vesselCallSign: 'OYGR2',
          vesselCapacityTeu: 8500
        }
      }),
      prisma.vessel.upsert({
        where: { id: 9456784 },
        update: {},
        create: {
          id: 9456784,
          carrierVesselCode: 'MAE',
          vesselShortName: 'MAERSK SEALAND',
          vesselLongName: 'MAERSK SEALAND',
          vesselFlagCode: 'DK',
          vessel_built_year: 2012,
          vesselCallSign: 'OYGR3',
          vesselCapacityTeu: 9000
        }
      }),
      prisma.vessel.upsert({
        where: { id: 9456785 },
        update: {},
        create: {
          id: 9456785,
          carrierVesselCode: 'MAE',
          vesselShortName: 'MAERSK SEATTLE',
          vesselLongName: 'MAERSK SEATTLE',
          vesselFlagCode: 'DK',
          vessel_built_year: 2015,
          vesselCallSign: 'OYGR4',
          vesselCapacityTeu: 9500
        }
      })
    ]);

    console.log(`✅ Создано ${vessels.length} судов`);

    // Создаем тестовые локации
    const locations = await Promise.all([
      prisma.location.upsert({
        where: { id: '0WII9SFZ7E1A6' },
        update: {},
        create: {
          id: '0WII9SFZ7E1A6',
          countryCode: 'US',
          countryName: 'United States',
          cityName: 'Houston',
          locationType: 'PORT',
          locationName: 'Houston Port'
        }
      }),
      prisma.location.upsert({
        where: { id: '1JUKNJGWHQBNJ' },
        update: {},
        create: {
          id: '1JUKNJGWHQBNJ',
          countryCode: 'NL',
          countryName: 'Netherlands',
          cityName: 'Rotterdam',
          locationType: 'PORT',
          locationName: 'Rotterdam Port'
        }
      }),
      prisma.location.upsert({
        where: { id: '2KLMKLX2IRCOK' },
        update: {},
        create: {
          id: '2KLMKLX2IRCOK',
          countryCode: 'CN',
          countryName: 'China',
          cityName: 'Shanghai',
          locationType: 'PORT',
          locationName: 'Shanghai Port'
        }
      }),
      prisma.location.upsert({
        where: { id: '3MNMLMY3JSDPL' },
        update: {},
        create: {
          id: '3MNMLMY3JSDPL',
          countryCode: 'US',
          countryName: 'United States',
          cityName: 'Los Angeles',
          locationType: 'PORT',
          locationName: 'Los Angeles Port'
        }
      })
    ]);

    console.log(`✅ Создано ${locations.length} локаций`);

    // Создаем тестовые расписания
    const oceanProducts = await Promise.all([
      prisma.oceanProduct.create({
        data: {
          vesselOperatorCarrierCode: 'MAEU',
          carrierProductId: 'TP1',
          carrierProductSequenceId: '001',
          productValidFromDate: new Date('2024-01-01'),
          productValidToDate: new Date('2024-12-31'),
          numberofproductlinks: '3',
          transportSchedules: {
            create: [
              {
                departureDateTime: new Date('2024-02-01T10:00:00Z'),
                arrivalDateTime: new Date('2024-02-15T14:00:00Z'),
                transitTime: '14D',
                transportLegs: {
                  create: [
                    {
                      departureDateTime: new Date('2024-02-01T10:00:00Z'),
                      arrivalDateTime: new Date('2024-02-15T14:00:00Z'),
                      transports: {
                        create: [
                                                     {
                             vesselImoNumber: 9456783,
                             carrierVesselCode: 'MAE',
                             vesselName: 'MAERSK SEVILLE',
                            transportMode: 'VSL',
                            carrierTradeLaneName: 'Transpacific',
                            carrierDepartureVoyageNumber: '001E',
                            inducementLinkFlag: 'N',
                            carrierServiceCode: 'TP1',
                            carrierServiceName: 'Transpacific Service',
                            linkDirection: 'EAST',
                            carrierCode: 'MAEU',
                            routingType: 'D'
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }),
      prisma.oceanProduct.create({
        data: {
          vesselOperatorCarrierCode: 'MAEU',
          carrierProductId: 'TP2',
          carrierProductSequenceId: '002',
          productValidFromDate: new Date('2024-01-01'),
          productValidToDate: new Date('2024-12-31'),
          numberofproductlinks: '2',
          transportSchedules: {
            create: [
              {
                departureDateTime: new Date('2024-02-05T12:00:00Z'),
                arrivalDateTime: new Date('2024-02-20T16:00:00Z'),
                transitTime: '15D',
                transportLegs: {
                  create: [
                    {
                      departureDateTime: new Date('2024-02-05T12:00:00Z'),
                      arrivalDateTime: new Date('2024-02-20T16:00:00Z'),
                      transports: {
                        create: [
                                                     {
                             vesselImoNumber: 9456784,
                             carrierVesselCode: 'MAE',
                             vesselName: 'MAERSK SEALAND',
                            transportMode: 'VSL',
                            carrierTradeLaneName: 'Transpacific',
                            carrierDepartureVoyageNumber: '002E',
                            inducementLinkFlag: 'N',
                            carrierServiceCode: 'TP2',
                            carrierServiceName: 'Transpacific Service 2',
                            linkDirection: 'EAST',
                            carrierCode: 'MAEU',
                            routingType: 'D'
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      })
    ]);

    console.log(`✅ Создано ${oceanProducts.length} расписаний`);

    // Создаем тестовые сроки
    const shipmentDeadlines = await Promise.all([
      prisma.shipmentDeadline.create({
        data: {
          vesselImoNumber: 9456783,
          voyage: '001E',
          portOfLoad: 'Los Angeles',
          isoCountryCode: 'US',
          deadlines: {
            create: [
              {
                deadlineName: 'Commercial Cargo Cutoff',
                deadlineLocal: new Date('2024-01-30T16:30:00Z')
              },
              {
                deadlineName: 'VGM Cutoff',
                deadlineLocal: new Date('2024-01-31T12:00:00Z')
              }
            ]
          }
        }
      }),
      prisma.shipmentDeadline.create({
        data: {
          vesselImoNumber: 9456784,
          voyage: '002E',
          portOfLoad: 'Los Angeles',
          isoCountryCode: 'US',
          deadlines: {
            create: [
              {
                deadlineName: 'Commercial Cargo Cutoff',
                deadlineLocal: new Date('2024-02-03T16:30:00Z')
              },
              {
                deadlineName: 'VGM Cutoff',
                deadlineLocal: new Date('2024-02-04T12:00:00Z')
              }
            ]
          }
        }
      })
    ]);

    console.log(`✅ Создано ${shipmentDeadlines.length} сроков`);

    return NextResponse.json({
      success: true,
      message: 'База данных заполнена тестовыми данными',
      summary: {
        vessels: vessels.length,
        locations: locations.length,
        oceanProducts: oceanProducts.length,
        shipmentDeadlines: shipmentDeadlines.length
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
