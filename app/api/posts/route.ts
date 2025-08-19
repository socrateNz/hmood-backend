import { NextResponse } from "next/server";
import Post from "@/models/Post";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

// GET : liste tous les posts
export async function GET() {
  await dbConnect();
  const posts = await Post.find().populate("author", "name email role").sort({ createdAt: -1 });
  return NextResponse.json(posts);
}

// POST : créer un post
export async function POST(req: Request) {
  await dbConnect();
  const { title, description, imageUrl, authorId } = await req.json();

  console.log(title, description, imageUrl, authorId);
  
  if (!title || !description || !authorId) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  const author = await User.findById(authorId);
  if (!author) {
    return NextResponse.json({ error: "Auteur introuvable." }, { status: 404 });
  }
  const post = await Post.create({
    title,
    description,
    imageUrl,
    author: author._id
  });
  return NextResponse.json(post, { status: 201 });
}

// PATCH : modifier un post (id en query)
export async function PATCH(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID du post requis." }, { status: 400 });
  }
  const { title, description, imageUrl } = await req.json();
  const post = await Post.findByIdAndUpdate(
    id,
    { title, description, imageUrl, updatedAt: Date.now() },
    { new: true }
  );
  if (!post) {
    return NextResponse.json({ error: "Post introuvable." }, { status: 404 });
  }
  return NextResponse.json(post);
}

// DELETE : supprimer un post (id en query)
export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID du post requis." }, { status: 400 });
  }
  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    return NextResponse.json({ error: "Post introuvable." }, { status: 404 });
  }
  return NextResponse.json({ message: "Post supprimé." });
}