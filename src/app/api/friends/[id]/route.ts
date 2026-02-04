import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { action } = await request.json();

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to respond to this request' },
        { status: 403 }
      );
    }

    if (action === 'accept') {
      await prisma.$transaction([
        prisma.friendRequest.update({
          where: { id },
          data: { status: 'accepted' },
        }),
        prisma.friendship.create({
          data: {
            userAId: friendRequest.senderId,
            userBId: friendRequest.receiverId,
          },
        }),
      ]);

      return NextResponse.json({ message: 'Friend request accepted' });
    } else if (action === 'decline') {
      await prisma.friendRequest.update({
        where: { id },
        data: { status: 'declined' },
      });

      return NextResponse.json({ message: 'Friend request declined' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json(
      { error: 'Failed to handle friend request' },
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

    const { id: friendId } = await params;

    // Delete the friendship (could be in either direction)
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userAId: session.user.id, userBId: friendId },
          { userAId: friendId, userBId: session.user.id },
        ],
      },
    });

    return NextResponse.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
