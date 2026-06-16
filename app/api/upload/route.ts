import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;

    const uploadDir = path.join(process.cwd(), "public/uploads");

    // 🔥 asegura que la carpeta exista
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      fileUrl: `/uploads/${fileName}`,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}