import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb-client';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
