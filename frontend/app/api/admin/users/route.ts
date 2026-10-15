import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsersList, updateUserRoleInDb } from '@/lib/db/admin';
import { UserProfileRole } from '@/lib/auth-shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAdminUsersList();
    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch platform users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, newRole } = body;

    if (!identifier || !newRole) {
      return NextResponse.json(
        { error: 'Identifier (username/email) and newRole are required' },
        { status: 400 }
      );
    }

    const validRoles: UserProfileRole[] = ['buyer', 'seller', 'operator', 'admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role specified. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateUserRoleInDb(identifier, newRole);
    return NextResponse.json({
      success: true,
      message: `Role for ${identifier} successfully updated to ${newRole}`,
      updated,
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
