import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MessageCircle, Search } from "lucide-react";
import { BoardCreate, BoardManage, BoardReply } from "@/components/board/BoardControls";
import { BoardText } from "@/components/board/BoardText";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getBoardDictionary, type BoardComment, type BoardPost } from "@/lib/board";
import { INTL_LOCALE } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export type BoardSearchParams = { q?: string; status?: string; page?: string; replies?: string; comment?: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cardClass = "rounded-2xl bg-white p-5 shadow-sm";
function pageNumber(value?: string) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 5000) : 1;
}

export async function BoardList({ searchParams }: { searchParams: Promise<BoardSearchParams> }) {
  const current = await getCurrentCoworker();
  if (!current) return null;
  const locale = await getLocale();
  const t = getBoardDictionary(locale);
  const params = await searchParams;
  const admin = current.access === "admin";
  const base = admin ? "/admin/tablon" : "/tablon";
  const query = (params.q ?? "").trim().slice(0, 200);
  const status = ["active", "closed", ...(admin ? ["archived"] : [])].includes(params.status ?? "") ? params.status! : "all";
  const page = pageNumber(params.page);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_board", { p_query: query, p_status: status, p_offset: (page - 1) * 20 });
  if (error) throw new Error(t.loadError);
  const posts = (data ?? []) as (Pick<BoardPost, "id" | "author_name" | "title" | "body" | "status" | "created_at"> & { comment_count: number; comment_match: string | null })[];
  const date = (value: string) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: "medium", timeZone: "Europe/Madrid" }).format(new Date(value));
  const pageHref = (number: number) => `${base}?${new URLSearchParams({ q: query, status, page: String(number) })}`;
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="board-heading">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t.title}</h1>
        <p className="mt-2 text-base text-warm-gray">{t.subtitle}</p>
      </div>
      {current.access !== "guest" ? <BoardCreate contactId={current.contactId} base={base} /> : <p className="text-sm text-warm-gray">{t.guest}</p>}
      <form action={base} className="board-filter flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t.search}</span>
          <Search aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
          <input name="q" maxLength={200} defaultValue={query} placeholder={t.search} className="w-full rounded-xl border border-sand/80 bg-white/80 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-brown-dark" />
        </label>
        <select name="status" defaultValue={status} aria-label={t.title} className="rounded-xl border border-sand/80 bg-white/80 px-3 py-3 text-sm text-ink outline-none focus:border-brown-dark">
          <option value="all">{t.all}</option><option value="active">{t.active}</option><option value="closed">{t.closed}</option>
          {admin && <option value="archived">{t.archived}</option>}
        </select>
        <button className="rounded-xl bg-brown-dark px-5 py-3 text-sm font-medium text-white transition hover:bg-brown">{t.searchButton}</button>
      </form>
      {!posts.length && <p className={cardClass}>{t.empty}</p>}
      {posts.length > 0 && <section className="board-cork p-4 sm:p-5" aria-label={t.title}>
        <div className="board-notes grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.slice(0, 20).map((post) => (
            <article key={post.id} className="board-note flex min-w-0 flex-col gap-3 p-5 text-ink transition-shadow hover:shadow-lg">
              <Link href={`${base}/${post.id}`} className="flex flex-wrap items-start justify-between gap-2 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brown-dark">
                <h2 className="min-w-0 text-lg font-semibold leading-snug [overflow-wrap:anywhere]">{post.title}</h2>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-brown-dark">{t[post.status]}</span>
              </Link>
              <BoardText text={post.body} className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80 [overflow-wrap:anywhere]" />
              {post.comment_match && <div className="rounded-xl bg-cream/90 p-3 text-sm">
                <p className="font-medium text-brown-dark">{t.commentMatch}</p>
                <BoardText text={post.comment_match} className="mt-1 line-clamp-3 whitespace-pre-wrap [overflow-wrap:anywhere]" />
              </div>}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sand/50 pt-3 text-xs text-warm-gray">
                <span>{post.author_name} · {date(post.created_at)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" aria-hidden />{post.comment_count} {t.comments.toLowerCase()}</span>
              </div>
            </article>
          ))}
        </div>
      </section>}
      <nav aria-label={t.title} className="flex justify-between gap-3 text-sm font-medium text-brown-dark">
        {page > 1 ? <Link href={pageHref(page - 1)}>{t.previous}</Link> : <span />}
        {posts.length > 20 && <Link href={pageHref(page + 1)}>{t.next}</Link>}
      </nav>
    </div>
  );
}

export async function BoardDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<BoardSearchParams>;
}) {
  const current = await getCurrentCoworker();
  if (!current) return null;
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const locale = await getLocale();
  const t = getBoardDictionary(locale);
  const admin = current.access === "admin";
  const base = admin ? "/admin/tablon" : "/tablon";
  const filters = await searchParams;
  const supabase = await createClient();
  let replyPage = pageNumber(filters.replies);
  if (filters.comment && UUID.test(filters.comment)) {
    const { data: comment } = await supabase.from("board_comments").select("id")
      .eq("id", filters.comment).eq("post_id", id).maybeSingle();
    if (comment) {
      const { data: targetPage } = await supabase.rpc("board_reply_page", { p_id: comment.id });
      replyPage = targetPage ?? 1;
    }
  }
  const [{ data: raw, error }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from("board_posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("board_comments").select("id, author_name, body, created_at").eq("post_id", id)
      .order("created_at", { ascending: false }).order("id", { ascending: false }).range((replyPage - 1) * 50, replyPage * 50),
  ]);
  if (error || commentsError) throw new Error(t.loadError);
  if (!raw) notFound();
  const post = raw as BoardPost;
  const replies = (comments ?? []) as BoardComment[];
  const date = (value: string) => new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid",
  }).format(new Date(value));
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link href={base} className="text-sm font-medium text-brown-dark">← {t.back}</Link>
      <article className={`${cardClass} flex min-w-0 flex-col gap-4`}>
        <span className="self-start rounded-full bg-cream px-3 py-1 text-xs text-brown-dark">{t[post.status]}</span>
        <h1 className="text-2xl font-bold [overflow-wrap:anywhere]">{post.title}</h1>
        <p className="text-xs text-warm-gray">{post.author_name} · {date(post.created_at)}</p>
        <BoardText text={post.body} className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]" />
        {post.attachments.length > 0 && <section aria-label={t.attachments} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {post.attachments.filter((a) => a.type.startsWith("image/")).map((file) => (
              <a key={file.path} href={`/api/board/files?path=${encodeURIComponent(file.path)}`} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-sand">
                {/* eslint-disable-next-line @next/next/no-img-element -- authenticated private Storage image */}
                <img src={`/api/board/files?path=${encodeURIComponent(file.path)}`} alt={file.name} className="max-h-80 w-full object-contain" loading="lazy" />
              </a>
            ))}
          </div>
          {post.attachments.filter((a) => !a.type.startsWith("image/")).map((file) => (
            <a key={file.path} href={`/api/board/files?download=1&path=${encodeURIComponent(file.path)}`} target="_blank" rel="noreferrer"
              className="flex min-w-0 items-center gap-2 rounded-xl border border-sand p-3 text-sm text-brown-dark">
              <FileText aria-hidden className="h-5 w-5 shrink-0" /><span className="min-w-0 break-words">{file.name}</span>
            </a>
          ))}
        </section>}
      </article>
      {(admin || (post.author_contact_id === current.contactId && post.status !== "archived")) &&
        <BoardManage post={post} contactId={current.contactId} base={base} admin={admin} />}
      {post.status !== "active" && <p className="rounded-xl bg-sand/30 p-4 text-sm text-brown-dark">{post.status === "closed" ? t.closedHint : t.archivedHint}</p>}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t.comments}</h2>
        {!replies.length && <p className="text-sm text-warm-gray">{t.noComments}</p>}
        {replies.slice(0, 50).map((comment) => (
          <article id={`comment-${comment.id}`} key={comment.id} className={`${cardClass} scroll-mt-5 target:ring-2 target:ring-sand`}>
            <p className="text-sm font-semibold">{comment.author_name}</p>
            <p className="mt-1 text-xs text-warm-gray">{date(comment.created_at)}</p>
            <BoardText text={comment.body} className="mt-3 whitespace-pre-wrap text-sm [overflow-wrap:anywhere]" />
          </article>
        ))}
        <nav aria-label={t.comments} className="flex justify-between gap-3 text-sm text-brown-dark">
          {replyPage > 1 ? <Link href={`?replies=${replyPage - 1}`}>{t.previous}</Link> : <span />}
          {replies.length > 50 && <Link href={`?replies=${replyPage + 1}`}>{t.next}</Link>}
        </nav>
      </section>
      {post.status === "active" && current.access !== "guest" && <BoardReply postId={post.id} />}
      {current.access === "guest" && <p className="text-sm text-warm-gray">{t.guest}</p>}
    </div>
  );
}
