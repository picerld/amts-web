import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import DashboardContainer from "../components/DashboardContainer";

export default function DashboardPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Dashboard" />
      <DashboardContainer />
    </GuardedLayout>
  );
}
