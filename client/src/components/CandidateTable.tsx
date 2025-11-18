import { CandidateEvaluation } from "@shared/schema";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { FileDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { useState, useMemo } from "react";

interface CandidateTableProps {
  candidates: CandidateEvaluation[];
  onGeneratePDF: (candidate: CandidateEvaluation) => void;
  defaultSortColumn?: SortColumn | null;
  defaultSortDirection?: SortDirection;
}

type SortColumn = 'name' | 'status' | 'phone' | 'email' | 'appliedDate' | 'date' | 'performance';
type SortDirection = 'asc' | 'desc' | null;

function calculateOverallScore(candidate: CandidateEvaluation): { score: number; rating: string } {
  const scores = [
    parseFloat(candidate.experienceScore || '0'),
    parseFloat(candidate.compassionScore || '0'),
    parseFloat(candidate.professionalismScore || '0'),
    parseFloat(candidate.safetyScore || '0'),
  ].filter(s => s > 0);
  
  if (scores.length === 0) {
    return { score: 0, rating: 'N/A' };
  }
  
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const roundedScore = Math.round(average * 10) / 10;
  
  let rating = '';
  
  if (roundedScore >= 4.5) {
    rating = 'Exceptional';
  } else if (roundedScore >= 3.5) {
    rating = 'Good';
  } else if (roundedScore >= 2.5) {
    rating = 'Average';
  } else if (roundedScore >= 1.5) {
    rating = 'Below Average';
  } else {
    rating = 'Poor';
  }
  
  return { score: roundedScore, rating };
}

export default function CandidateTable({
  candidates,
  onGeneratePDF,
  defaultSortColumn = null,
  defaultSortDirection = null,
}: CandidateTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedCandidates = useMemo(() => {
    if (!sortColumn || !sortDirection) return candidates;

    return [...candidates].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'name':
          aValue = a.contactName?.toLowerCase() || '';
          bValue = b.contactName?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.result || '';
          bValue = b.result || '';
          break;
        case 'phone':
          aValue = a.phoneNumber || '';
          bValue = b.phoneNumber || '';
          break;
        case 'email':
          aValue = a.emailAddress?.toLowerCase() || '';
          bValue = b.emailAddress?.toLowerCase() || '';
          break;
        case 'appliedDate':
          aValue = new Date(a.dateTime || 0).getTime();
          bValue = new Date(b.dateTime || 0).getTime();
          break;
        case 'date':
          aValue = new Date(a.dateTime || 0).getTime();
          bValue = new Date(b.dateTime || 0).getTime();
          break;
        case 'performance':
          aValue = calculateOverallScore(a).score;
          bValue = calculateOverallScore(b).score;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [candidates, sortColumn, sortDirection]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 inline opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3.5 h-3.5 ml-1 inline" />;
    }
    return <ArrowDown className="w-3.5 h-3.5 ml-1 inline" />;
  };

  if (candidates.length === 0) {
    return (
      <Card className="p-12">
        <p className="text-center text-muted-foreground">
          No candidate data available. Upload a CSV file to get started.
        </p>
      </Card>
    );
  }

  return (
    <Card data-testid="card-candidate-table">
      <ScrollArea className="w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[150px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('name')}
                  data-testid="header-name"
                >
                  Name<SortIcon column="name" />
                </TableHead>
                <TableHead 
                  className="w-[150px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('status')}
                  data-testid="header-status"
                >
                  Status<SortIcon column="status" />
                </TableHead>
                <TableHead 
                  className="min-w-[130px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('phone')}
                  data-testid="header-phone"
                >
                  Phone<SortIcon column="phone" />
                </TableHead>
                <TableHead 
                  className="min-w-[180px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('email')}
                  data-testid="header-email"
                >
                  Email<SortIcon column="email" />
                </TableHead>
                <TableHead 
                  className="min-w-[160px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('appliedDate')}
                  data-testid="header-applied-date"
                >
                  Applied Date<SortIcon column="appliedDate" />
                </TableHead>
                <TableHead 
                  className="min-w-[160px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('date')}
                  data-testid="header-date"
                >
                  Interview Date<SortIcon column="date" />
                </TableHead>
                <TableHead 
                  className="min-w-[180px] text-left align-middle cursor-pointer hover-elevate"
                  onClick={() => handleSort('performance')}
                  data-testid="header-performance"
                >
                  Overall Performance<SortIcon column="performance" />
                </TableHead>
                <TableHead className="min-w-[100px] text-right align-middle">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCandidates.map((candidate, index) => (
                <TableRow key={index} data-testid={`row-candidate-${index}`}>
                  <TableCell className="w-[150px] font-medium text-left align-middle" data-testid="text-name">
                    {candidate.contactName}
                  </TableCell>
                  <TableCell className="w-[150px] text-left align-middle">
                    <Badge
                      variant={candidate.result === "PASS" ? "default" : "destructive"}
                      className={`font-medium ${candidate.result === "PASS" ? "bg-green-600 hover:bg-green-600/80" : ""}`}
                      data-testid="badge-status"
                    >
                      {candidate.result}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle" data-testid="text-phone">
                    {candidate.phoneNumber}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle" data-testid="text-email">
                    {candidate.emailAddress || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle" data-testid="text-applied-date">
                    {candidate.dateTime}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle">
                    {candidate.dateTime}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle" data-testid="text-overall-performance">
                    {(() => {
                      const overall = calculateOverallScore(candidate);
                      return overall.score > 0 
                        ? `${overall.score.toFixed(1)} / 5.0 - ${overall.rating}`
                        : 'N/A';
                    })()}
                  </TableCell>
                  <TableCell className="text-right align-middle">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onGeneratePDF(candidate)}
                      data-testid={`button-generate-pdf-${index}`}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
}
