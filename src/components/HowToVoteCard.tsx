function VoteIcon({ variant }: { variant: "yes" | "no" }) {
  const isYes = variant === "yes";
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        isYes ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
      }`}
    >
      {isYes ? "✓" : "✗"}
    </span>
  );
}

export function HowToVoteCard() {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-gray-900">How to Vote</h2>
      <ol className="mt-3 space-y-3 text-sm text-gray-700">
        <li className="flex gap-2">
          <span className="shrink-0 font-semibold text-violet-700">1.</span>
          <span>
            Review the summary below and click <VoteIcon variant="yes" /> if you&rsquo;re
            available and <VoteIcon variant="no" /> if you&rsquo;re not.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 font-semibold text-violet-700">2.</span>
          <span>If you need to add a note, simply click the date to expand and add.</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 font-semibold text-violet-700">3.</span>
          <span>
            If you&rsquo;d like to suggest an additional date, simply click the date on the
            calendar to suggest a new date.
          </span>
        </li>
      </ol>
    </div>
  );
}
