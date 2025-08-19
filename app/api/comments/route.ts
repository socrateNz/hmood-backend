import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Post from "@/models/Post";
import dbConnect from "@/lib/mongodb";

// GET : liste des commentaires d'un post
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const postId = searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId requis." }, { status: 400 });
  }
  const comments = await Comment.find({ post: postId }).populate("user", "name email role").sort({ createdAt: 1 });
  return NextResponse.json(comments);
}

// POST : ajouter un commentaire
export async function POST(req: Request) {
  await dbConnect();
  const { postId, userId, text } = await req.json();
  if (!postId || !userId || !text) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  if (!user || !post) {
    return NextResponse.json({ error: "Utilisateur ou post introuvable." }, { status: 404 });
  }
  const comment = await Comment.create({ post: postId, user: userId, text });
  return NextResponse.json(comment, { status: 201 });
}