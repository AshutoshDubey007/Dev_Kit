import { NextRequest, NextResponse } from 'next/server';
import { getDeveloperProfile, updateDeveloperProfile } from '@/lib/db/profiles';

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
    const body = await req.json();
    const { username, ...updates } = body;

    const targetUser = username || 'ashutoshkdubey007';
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
