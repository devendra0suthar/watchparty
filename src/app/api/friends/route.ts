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

    const userId = session.user.id;

    // Get friendships where user is either userA or userB
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: { id: true, username: true, email: true, avatar: true },
        },
        userB: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    // Extract friend info (the other user in the friendship)
    const friends = friendships.map((f) =>
      f.userAId === userId ? f.userB : f.userA
    );

    // Get pending requests
    const sentRequests = await prisma.friendRequest.findMany({
      where: { senderId: userId, status: 'pending' },
      include: {
        receiver: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    const receivedRequests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: {
        sender: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      friends,
      sentRequests,
      receivedRequests,
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
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

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { username },
    });

    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check for existing friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: session.user.id },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      );
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: session.user.id, userBId: receiver.id },
          { userAId: receiver.id, userBId: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Already friends with this user' },
        { status: 400 }
      );
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
      },
      include: {
        receiver: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
