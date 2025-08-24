import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const oceanProducts = await prisma.oceanProduct.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        transportSchedules: {
          include: {
            transportLegs: {
              include: {
                transports: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(oceanProducts);
  } catch (error) {
    console.error('❌ Ошибка при получении данных о расписаниях:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных о расписаниях' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
