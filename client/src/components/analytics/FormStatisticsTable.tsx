import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface FormStatisticsTableProps {
  data: {
    metric: string;
    count: number;
    percentage: number;
  }[];
}

export default function FormStatisticsTable({ data }: FormStatisticsTableProps) {
  return (
    <Card data-testid="card-form-statistics-table">
      <CardHeader>
        <CardTitle>Statistical Summary</CardTitle>
        <CardDescription>
          Comprehensive overview of all form submission metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Metric</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} data-testid={`stat-row-${index}`}>
                <TableCell className="font-medium text-left">{row.metric}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
                <TableCell className="text-right">{row.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
