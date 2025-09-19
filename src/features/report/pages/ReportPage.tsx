import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { UserGradeDatatable } from "../components/datatable/user-grade-datatable";
import SubjectListView from "@/features/subject/components/SubjectListView";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("student-list");

  return (
    <GuardedLayout>
      <HeadMetaData title="Report" />
      <Header title="Report" subtitle="See the student subject report!" />

      <div className="container mx-auto mt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student-list" className="cursor-pointer">
              by Student
            </TabsTrigger>
            <TabsTrigger value="subject" className="cursor-pointer">
              by Subject
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student-list">
            <UserGradeDatatable />
          </TabsContent>

          <TabsContent value="subject" className="mt-14">
            <SubjectListView />
          </TabsContent>
        </Tabs>
      </div>
    </GuardedLayout>
  );
}
