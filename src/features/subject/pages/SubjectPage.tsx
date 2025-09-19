import { useState } from "react";
import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectDataTable } from "../components/datatable/subject-datatable";
import { Plus } from "lucide-react";
import SubjectListView from "../components/SubjectListView";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function SubjectPage() {
  const [activeTab, setActiveTab] = useState("table");

  return (
    <GuardedLayout>
      <HeadMetaData title="Subject" />
      <Header title="Subject" subtitle="Manage your own subject!">
        <Link
          href={"/subjects/create"}
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <Plus className="h-4 w-4" />
          Create new subject
        </Link>
      </Header>

      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table" className="cursor-pointer">
              Table View
            </TabsTrigger>
            <TabsTrigger value="list" className="cursor-pointer">
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <SubjectDataTable />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <SubjectListView />
          </TabsContent>
        </Tabs>
      </div>
    </GuardedLayout>
  );
}
