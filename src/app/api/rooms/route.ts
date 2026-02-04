import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { hostId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
        isActive: true,
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, videoUrl } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        videoUrl,
        hostId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
