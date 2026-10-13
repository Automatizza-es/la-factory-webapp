// Shown inside the app frame (header, sidebar and bottom bar stay put) the
// moment someone taps a link, while the server renders the page. Without
// it, a tap looks like nothing happened until the whole page is ready.
export function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 rounded-lg bg-sand/50" />
        <div className="h-4 w-64 max-w-full rounded-lg bg-sand/30" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 rounded-2xl bg-white shadow-sm" />
        <div className="h-32 rounded-2xl bg-white shadow-sm" />
        <div className="hidden h-32 rounded-2xl bg-white shadow-sm lg:block" />
      </div>
      <div className="h-48 rounded-2xl bg-white shadow-sm" />
    </div>
  );
}
