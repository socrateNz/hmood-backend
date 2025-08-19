import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    // Vérification du header d'autorisation
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { authentifié: false, erreur: 'Aucun token fourni' },
        { status: 401 }
      );
    }

    // Extraction du token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { authentifié: false, erreur: 'Token malformé' },
        { status: 401 }
      );
    }

    // Ajout d'un timeout pour les opérations
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout de la requête')), 5000)
    );

    // Vérification du token JWT
    const decoded = await Promise.race([
      jwt.verify(token, process.env.JWT_SECRET!),
      timeoutPromise
    ]);

    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Recherche de l'utilisateur
    const userId = (decoded as { id: string }).id;
    const user = await db.collection('utilisateurs').findOne(
      { _id: new ObjectId(userId) }, 
      { projection: { motDePasse: 0 } } // Exclure le mot de passe
    );

    if (!user) {
      return NextResponse.json(
        { authentifié: false, erreur: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    return NextResponse.json({ authentifié: true, user });
  } catch (err) {
    console.error('Erreur de vérification de session:', err);
    return NextResponse.json(
      { 
        authentifié: false, 
        erreur: err instanceof Error ? err.message : 'Erreur inconnue' 
      },
      { status: 401 }
    );
  }
}