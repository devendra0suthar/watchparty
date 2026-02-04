import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: 'Room is no longer active' },
        { status: 400 }
      );
    }

    const existingMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: session.user.id,
          roomId: id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ message: 'Already a member' });
    }

    await prisma.roomMember.create({
      data: {
        userId: session.user.id,
        roomId: id,
      },
    });

    return NextResponse.json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
