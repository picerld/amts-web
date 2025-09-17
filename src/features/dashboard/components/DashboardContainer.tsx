import { MenuSectionTabContent } from "../components/tabs/MenuSectionTabContent";
import { OverviewTabContent } from "../components/tabs/OverviewTabContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, SquareMenu } from "lucide-react";

export default function DashboardContainer() {
  return (
    <div className="flex flex-col gap-6 w-full h-screen">
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger
            value="menu"
            className="flex items-center gap-2 cursor-pointer"
          >
            <SquareMenu className="size-4!" strokeWidth={2.5} />
            Menu
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 className="size-4!" strokeWidth={2.5} />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent />
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <MenuSectionTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
