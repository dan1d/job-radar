import { NextRequest, NextResponse } from "next/server";
import { getCategories, upsertCategory, deleteCategory } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getCategories());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.id || !body.label || !body.query) {
    return NextResponse.json(
      { error: "id, label, and query are required" },
      { status: 400 }
    );
  }
  const categories = await upsertCategory({
    id: body.id,
    label: body.label,
    query: body.query,
    proposalTemplate: body.proposalTemplate || "",
  });
  return NextResponse.json(categories);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const categories = await deleteCategory(id);
  return NextResponse.json(categories);
}
