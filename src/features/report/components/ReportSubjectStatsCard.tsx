import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Users } from "lucide-react";

export const ReportSubjectStatsCard = ({
  stats,
}: {
  stats: { average: number; highest: number; lowest: number; total: number };
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          <BarChart3
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={2.5}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.average}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Grade</CardTitle>
          <Trophy
            className="h-4! w-4! text-muted-foreground"
            strokeWidth={2.5}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.highest}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lowest Grade</CardTitle>
          <BarChart3
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={2.5}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.lowest}</div>
        </CardContent>
      </Card>
    </div>
  );
};
