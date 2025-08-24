import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      take: 100,
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('❌ Ошибка при получении данных о локациях:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных о локациях' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
