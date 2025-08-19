import { compare } from 'bcryptjs';
import clientPromise from './mongodb-client'; // Assure-toi que ce fichier existe

interface Credentials {
  email: string;
  password: string;
}

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Vérifie les identifiants et retourne l'utilisateur si valide
 */
export async function loginUser(credentials: Credentials): Promise<AuthenticatedUser | null> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({
      email: credentials.email.toLowerCase().trim(),
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(credentials.password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name || '',
      email: user.email,
      role: user.role || 'user',
    };
  } catch (error) {
    console.error('Erreur loginUser:', error);
    return null;
  }
}
