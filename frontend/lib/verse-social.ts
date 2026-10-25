import { supabase } from "@/lib/supabase";

// Formater les grands nombres (ex: 607300 -> 607,3 k)
export function formatStatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "").replace(".", ",") + " M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "").replace(".", ",") + " k";
  return num.toString();
}

export async function getVerseStats(verseRef: string) {
  const { data } = await supabase.rpc("get_verse_stats", { p_ref: verseRef });
  if (!data) return { likes: 0, comments: 0, shares: 0 };
  return data as { likes: number; comments: number; shares: number };
}

export async function hasUserLiked(verseRef: string, userId: string) {
  const { data } = await supabase
    .from("verse_likes")
    .select("id")
    .eq("verse_ref", verseRef)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function toggleLike(verseRef: string, userId: string, isLiked: boolean) {
  if (isLiked) {
    await supabase.from("verse_likes").delete().eq("verse_ref", verseRef).eq("user_id", userId);
  } else {
    await supabase.from("verse_likes").insert({ verse_ref: verseRef, user_id: userId });
  }
}

export async function recordShare(verseRef: string, userId?: string) {
  await supabase.from("verse_shares").insert({ verse_ref: verseRef, user_id: userId || null });
}

export async function getVerseComments(verseRef: string) {
  const { data } = await supabase
    .from("verse_comments")
    .select("id, content, created_at, user_id")
    .eq("verse_ref", verseRef)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function addComment(verseRef: string, userId: string, content: string) {
  await supabase.from("verse_comments").insert({ verse_ref: verseRef, user_id: userId, content });
}
