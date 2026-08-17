"use client";

import { useId, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useReportExport } from "@/hooks/use-report-export";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/stores/filter-store";
import type { ReportType } from "@/types/reports";

export function CollapsibleChartCard({
  title,
  reportType,
  children,
  defaultOpen = false
}: {
  title: string;
  reportType: ReportType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const filters = useFilterStore((state) => state.filters);
  const exportReport = useReportExport();

  return (
    <Card className="min-w-0 overflow-hidden transition-[box-shadow,border-color] duration-300">
      <div className="flex min-w-0 items-center gap-2 p-5">
        <button
          type="button"
          className="group flex min-h-10 min-w-0 flex-1 items-center justify-between gap-3 rounded-md text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((current) => !current)}
        >
          <CardTitle className="min-w-0 truncate">{title}</CardTitle>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-cyan-200 transition-transform duration-300 group-hover:text-cyan-100",
              open && "rotate-180"
            )}
          />
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            exportReport.mutate({ type: reportType, filters });
          }}
          disabled={exportReport.isPending}
          className="shrink-0"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </div>
      <div
        id={contentId}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <CardContent className="min-w-0 border-t border-white/10 pt-0">
            <div className={cn("pt-5", !open && "pointer-events-none")}>
              {children}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
