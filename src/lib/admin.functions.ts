import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AGE_RANGES, CATEGORIES } from "@/lib/kids";

/** Signed-in adult enters the admin password; if correct they get the admin role. */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ password: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data, context }) => {
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected || data.password !== expected) {
      return { ok: false as const, error: "Wrong admin password." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" } as never, { onConflict: "user_id,role" });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/** AI suggests an age range and category from title + description. Admin only. */
export const suggestVideoMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ title: z.string().min(1).max(300), description: z.string().max(3000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only admins can use AI suggestions.");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        instructions: `You classify children's videos. Pick the single best category from: ${CATEGORIES.join(", ")}. Pick the best age range from: ${AGE_RANGES.join(", ")}. Give a one-sentence reason.`,
        input: `Title: ${data.title}\nDescription: ${data.description || "(none)"}`,
        text: {
          format: {
            type: "json_schema",
            name: "video_meta",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["category", "age_range", "reason"],
              properties: {
                category: { type: "string" },
                age_range: { type: "string" },
                reason: { type: "string" },
              },
            },
          },
        },
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) throw new Error("AI is busy — please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits have run out for this workspace.");
      throw new Error(`AI request failed (${res.status}).`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    let refused = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const frames = buf.split("\n\n");
      buf = frames.pop() ?? "";
      for (const f of frames) {
        const line = f.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          if (ev.type === "response.refusal.delta") refused = true;
        } catch {
          /* ignore partial */
        }
      }
    }
    if (refused || !text) throw new Error("AI couldn't suggest anything for this video.");
    const parsed = JSON.parse(text) as { category: string; age_range: string; reason: string };
    const category = (CATEGORIES as readonly string[]).includes(parsed.category)
      ? parsed.category
      : "Cartoons";
    const age_range = (AGE_RANGES as readonly string[]).includes(parsed.age_range)
      ? parsed.age_range
      : "4-8";
    return { category, age_range, reason: parsed.reason };
  });
