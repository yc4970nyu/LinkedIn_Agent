import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Users } from "lucide-react";

export interface ProspectRow {
  id: string;
  name: string;
  headline: string;
  profileUrl: string;
  experienceSummary: string;
  coldMessage: string;
}

interface ResultsTableProps {
  data: ProspectRow[];
}

const ResultsTable = ({ data }: ResultsTableProps) => {
  if (data.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
          <Users className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No results yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Run a search above to find prospects and generate outreach messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Results{" "}
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {data.length}
          </span>
        </h3>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Headline
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profile URL
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Experience Summary
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Curated Cold Message
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                className="border-border transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium text-foreground whitespace-nowrap">
                  {row.name}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-normal text-sm text-muted-foreground">
                  {row.headline}
                </TableCell>
                <TableCell>
                  <a
                    href={row.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="min-w-[300px] whitespace-pre-wrap text-sm text-muted-foreground">
                  <p className="leading-relaxed">{row.experienceSummary}</p>
                </TableCell>
                <TableCell className="min-w-[350px] whitespace-normal text-sm text-muted-foreground">
                  <p className="font-mono text-xs leading-relaxed">
                    {row.coldMessage}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResultsTable;