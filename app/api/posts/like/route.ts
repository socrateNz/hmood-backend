import { NextResponse } from "next/server";
import Post from "@/models/Post";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();
  const { postId, userId } = await req.json();
  if (!postId || !userId) {
    return NextResponse.json({ error: "postId et userId requis." }, { status: 400 });
  }
  const post = await Post.findById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post introuvable." }, { status: 404 });
  }
  const alreadyLiked = post.likedBy.includes(userId);
  if (alreadyLiked) {
    post.likedBy.pull(userId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(userId);
    post.likes += 1;
  }
  await post.save();
  return NextResponse.json({ likes: post.likes, likedBy: post.likedBy });
}