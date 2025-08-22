import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payloadFile = formData.get("payload") as File | null;
    const uploadFile = formData.get("file") as File | null;

    if (!payloadFile) {
      return NextResponse.json({ error: "missing data" }, { status: 400 });
    }

    const payload = JSON.parse(await payloadFile.text());
    const leadId = uuidv4();

    // Insert lead
    const { error: leadError } = await supabase.rpc("fn_insert_lead", {
      p_id: leadId,
      p_payload: payload,
    });

    if (leadError) {
      console.error("lead insert error", leadError);
      return NextResponse.json(
        { error: "lead_insert_failed", details: leadError.message },
        { status: 500 }
      );
    }

    let files: any[] = [];

    if (uploadFile) {
      const filePath = `leads/${leadId}/${uuidv4()}-${uploadFile.name}`;

      // Upload to storage
      const { error: storageError } = await supabase.storage
        .from("uploads")
        .upload(filePath, uploadFile, {
          contentType: uploadFile.type,
        });

      if (storageError) {
        console.error("storage error", storageError);
        return NextResponse.json(
          { error: "upload_failed", details: storageError.message },
          { status: 500 }
        );
      }

      // Register in media table
      const { data: mediaData, error: mediaError } = await supabase.rpc(
        "fn_add_media",
        {
          p_lead_id: leadId,
          p_path: filePath,
          p_mime_type: uploadFile.type,
          p_size_bytes: uploadFile.size,
        }
      );

      if (mediaError) {
        console.error("media error", mediaError);
        return NextResponse.json(
          { error: "media_insert_failed", details: mediaError.message },
          { status: 500 }
        );
      }

      files.push(mediaData);
    }

    return NextResponse.json({ leadId, files });
  } catch (err: any) {
    console.error("submit error", err);
    return NextResponse.json(
      { error: "server_error", details: err.message },
      { status: 500 }
    );
  }
}
