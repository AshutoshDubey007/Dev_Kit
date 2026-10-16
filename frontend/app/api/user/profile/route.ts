import { NextRequest, NextResponse } from 'next/server';
import { getDeveloperProfile, updateDeveloperProfile } from '@/lib/db/profiles';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'ashutoshkdubey007';

    const profile = await getDeveloperProfile(username);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase().trim();
    const sessionRole = (session?.user as any)?.role;

    const body = await req.json();
    const { username, ...updates } = body;

    // Reject unauthenticated updates in production
    if (process.env.NODE_ENV === 'production' && !sessionEmail) {
      return NextResponse.json(
        { error: 'Authentication required to update profile' },
        { status: 401 }
      );
    }

    const targetUser = username || 'ashutoshkdubey007';

    // Verify object-level ownership if session is present
    if (sessionEmail && sessionRole !== 'admin') {
      const existing = await getDeveloperProfile(targetUser);
      if (existing?.email && existing.email.toLowerCase() !== sessionEmail) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot edit another user profile' },
          { status: 403 }
        );
      }
    }

    const updated = await updateDeveloperProfile(targetUser, updates);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
