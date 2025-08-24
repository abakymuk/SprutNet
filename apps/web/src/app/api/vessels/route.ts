import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vessels = await prisma.vessel.findMany({
      take: 100,
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(vessels);
  } catch (error) {
    console.error('❌ Ошибка при получении данных о судах:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных о судах' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
