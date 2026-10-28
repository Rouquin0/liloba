"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { 
  getVerseStats, 
  hasUserLiked, 
  toggleLike, 
  getVerseComments, 
  addComment,
  recordShare,
  formatStatCount
} from "@/lib/verse-social";
import { isSpeechAvailable } from "@/lib/selah-timer";

interface VerseActionBarProps {
  verseText: string;
  reference: string;
  onShareImage?: () => void;
}

export default function VerseActionBar({ verseText, reference, onShareImage }: VerseActionBarProps) {
  const { user } = useUser();
  
  const [stats, setStats] = useState({ likes: 0, comments: 0, shares: 0 });
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    async function load() {
      const s = await getVerseStats(reference);
      setStats(s);
      if (user) {
        setIsLiked(await hasUserLiked(reference, user.id));
      }
    }
    load();
  }, [reference, user]);

  const handleLike = async () => {
    if (!user) {
      alert("Connecte-toi pour aimer ce verset et rejoindre la communauté !");
      return;
    }
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setStats(prev => ({ ...prev, likes: newLikedState ? prev.likes + 1 : prev.likes - 1 }));
    await toggleLike(reference, user.id, isLiked);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://liloba.vercel.app";
    const text = `« ${verseText} » - ${reference}\n\nDécouvre LILOBA :`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "LILOBA", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      await recordShare(reference, user?.id);
      setStats(prev => ({ ...prev, shares: prev.shares + 1 }));
    } catch (err) {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`« ${verseText} » - ${reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMore(false);
    } catch (err) {}
  };

  const handleListen = () => {
    if (!isSpeechAvailable()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${verseText}. ${reference}`);
    u.lang = "fr-FR";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
    setShowMore(false);
  };

  const handleOpenComments = async () => {
    setShowComments(true);
    setComments(await getVerseComments(reference));
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    await addComment(reference, user.id, newComment.trim());
    setNewComment("");
    const updated = await getVerseComments(reference);
    setComments(updated);
    setStats(prev => ({ ...prev, comments: updated.length }));
  };

  return (
    <>
      {/* BARRE D'ACTIONS HORIZONTALE (Plus fine) */}
      <div className="relative mt-3 flex w-full items-center justify-between border-t border-[var(--border)] pt-3">
        
        {/* J'aime */}
        <button onClick={handleLike} className="group flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform group-active:scale-90 ${isLiked ? "text-red-500" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className={`text-xs font-medium ${isLiked ? "text-red-500" : "text-[var(--muted)]"}`}>
            {formatStatCount(stats.likes)}
          </span>
        </button>

        {/* Commenter */}
        <button onClick={handleOpenComments} className="group flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)] transition-transform group-active:scale-90 group-hover:text-[var(--foreground)]">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="text-xs font-medium text-[var(--muted)]">
            {formatStatCount(stats.comments)}
          </span>
        </button>

        {/* Partager */}
        <button onClick={handleShare} className="group flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--muted)] transition-transform group-active:scale-90 group-hover:text-[var(--foreground)]">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />
          </svg>
          <span className="text-xs font-medium text-[var(--muted)]">
            {copied ? "Copié !" : formatStatCount(stats.shares)}
          </span>
        </button>

        {/* Plus */}
        <button onClick={() => setShowMore(!showMore)} className="group flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform group-active:scale-90 ${showMore ? "text-[var(--color-accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`}>
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
          <span className="text-xs font-medium text-[var(--muted)]">Plus</span>
        </button>

        {/* MENU DÉROULANT (3 points) */}
        {showMore && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
            <div className="absolute bottom-full right-0 z-50 mb-2 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl animate-fade-in">
              {onShareImage && (
                <button onClick={() => { onShareImage(); setShowMore(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-[var(--foreground)] hover:bg-[var(--surface-hover)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  Partager en image
                </button>
              )}
              <button onClick={handleCopy} className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-[var(--foreground)] hover:bg-[var(--surface-hover)] border-t border-[var(--border)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copier le texte
              </button>
              <button onClick={handleListen} className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-[var(--foreground)] hover:bg-[var(--surface-hover)] border-t border-[var(--border)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                Écouter
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODALE DES COMMENTAIRES */}
      {showComments && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Commentaires ({stats.comments})</h3>
              <button onClick={() => setShowComments(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">Fermer</button>
            </div>
            
            <div className="max-h-60 overflow-y-auto mb-4 flex flex-col gap-3">
              {comments.length === 0 ? (
                <p className="text-xs text-[var(--muted)] text-center">Aucun commentaire. Sois le premier !</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                    <p className="text-xs text-[var(--foreground)]">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Écrire un commentaire..." : "Connecte-toi pour commenter"}
                disabled={!user}
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
              <button onClick={handleSubmitComment} disabled={!user || !newComment.trim()} className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
