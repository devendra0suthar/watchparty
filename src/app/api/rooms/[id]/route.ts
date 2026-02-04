import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
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
      include: {
        host: {
          select: { id: true, username: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, email: true, avatar: true },
            },
          },
        },
        messages: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { videoUrl, name, isActive } = await request.json();

    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the host can update the room' },
        { status: 403 }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(videoUrl !== undefined && { videoUrl }),
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (room.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the host can delete the room' },
        { status: 403 }
      );
    }

    // Delete related records first (messages, members), then the room
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { roomId: id } }),
      prisma.roomMember.deleteMany({ where: { roomId: id } }),
      prisma.room.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}
