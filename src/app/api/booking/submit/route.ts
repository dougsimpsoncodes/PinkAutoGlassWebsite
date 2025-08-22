import { NextResponse } from "next/server";
import { BookingSchema } from "@/lib/booking-schema";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const dataRaw = form.get("data") as string | null;
    const files: File[] = [];
    for (const [key, val] of form.entries()) {
      if (val instanceof File && key.startsWith("file")) files.push(val);
    }
    if (!dataRaw) return NextResponse.json({ error: "missing data" }, { status: 400 });

    const parsed = BookingSchema.safeParse(JSON.parse(dataRaw));
    if (!parsed.success) return NextResponse.json({ error: "validation_failed", details: parsed.error.flatten() }, { status: 422 });

    const leadUUID = parsed.data.clientGeneratedId ?? randomUUID();
    const payload = { ...parsed.data, clientGeneratedId: leadUUID };
    const { data: leadInsert, error: leadErr } = await supabase.rpc("fn_insert_lead", { p_id: leadUUID, p_payload: payload as any });
    if (leadErr) return NextResponse.json({ error: "lead_insert_failed", details: leadErr.message }, { status: 500 });

    const uploaded: Array<{ id: string; path: string }> = [];
    for (const f of files) {
      const ext = f.name.split(".").pop() || "bin";
      const storagePath = `leads/${leadUUID}/${randomUUID()}.${ext}`;
      const arrayBuf = await f.arrayBuffer();
      const { error: upErr } = await supabase.storage.from("uploads").upload(storagePath, new Uint8Array(arrayBuf), { contentType: f.type, upsert: false });
      if (upErr) return NextResponse.json({ error: "upload_failed", details: upErr.message }, { status: 500 });
      const { data: mediaId, error: mediaErr } = await supabase.rpc("fn_add_media", { p_lead_id: leadUUID, p_path: storagePath, p_mime: f.type || null, p_size: f.size });
      if (mediaErr) return NextResponse.json({ error: "media_insert_failed", details: mediaErr.message }, { status: 500 });
      uploaded.push({ id: String(mediaId), path: storagePath });
    }

    return NextResponse.json({ leadId: leadInsert, files: uploaded });
  } else {
    const body = await req.json().catch(() => null);
    if (!body?.data) return NextResponse.json({ error: "missing data" }, { status: 400 });
    const parsed = BookingSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "validation_failed", details: parsed.error.flatten() }, { status: 422 });

    const leadUUID = parsed.data.clientGeneratedId ?? randomUUID();
    const payload = { ...parsed.data, clientGeneratedId: leadUUID };
    const { data: leadInsert, error: leadErr } = await supabase.rpc("fn_insert_lead", { p_id: leadUUID, p_payload: payload as any });
    if (leadErr) return NextResponse.json({ error: "lead_insert_failed", details: leadErr.message }, { status: 500 });
    return NextResponse.json({ leadId: leadInsert });
  }
}