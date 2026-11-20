import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { generalApiLimiter } from "@/lib/rate-limit";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    const tasks = userId
      ? await prisma.task.findMany({
          where: { userId },
          orderBy: { dueDate: "asc" },
        })
      : [];

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { id, isCompleted } = await req.json();
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { isCompleted },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category } = await req.json();

    const newTask = await prisma.task.create({
      data: {
        title,
        category: category || "Paperwork",
        dueDate: new Date(),
        userId: userId,
        isCompleted: false,
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { id, title } = await req.json();
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}