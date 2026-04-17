import type { SalaryHistoryEntry } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  history: SalaryHistoryEntry[];
}

export default function SalaryHistoryTable({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No salary history available.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Effective From</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead>Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((entry, i) => (
          <TableRow key={`${entry.effective_from}-${i}`}>
            <TableCell>{entry.effective_from}</TableCell>
            <TableCell>{entry.salary} {entry.currency}</TableCell>
            <TableCell>{entry.change ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
