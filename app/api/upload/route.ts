import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  const { image } = await req.json();
  if (!image) {
    return NextResponse.json({ error: "Image requise." }, { status: 400 });
  }
  try {
    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: "socialfeed"
    });
    return NextResponse.json({ url: uploadRes.secure_url });
  } catch (err) {
    return NextResponse.json({ error: "Erreur upload Cloudinary.", err }, { status: 500 });
  }
}