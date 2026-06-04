export function SourceTags({ sources }: { sources: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((s) => {
        const kev = s === "KEV"
        return (
          <span
            key={s}
            className="rounded border px-1 py-px text-[0.625rem] font-medium"
            style={
              kev
                ? {
                    color: "var(--kev)",
                    borderColor: "color-mix(in oklab, var(--kev) 30%, transparent)",
                    backgroundColor: "color-mix(in oklab, var(--kev) 14%, transparent)",
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            {s}
          </span>
        )
      })}
    </div>
  )
}
