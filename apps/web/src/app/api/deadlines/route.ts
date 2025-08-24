import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const deadlines = await prisma.shipmentDeadline.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        deadlines: true
      }
    });

    return NextResponse.json(deadlines);
  } catch (error) {
    console.error('❌ Ошибка при получении данных о сроках:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных о сроках' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
