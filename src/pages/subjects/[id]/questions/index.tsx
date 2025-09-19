import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { Header } from "@/components/container/Header";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { QuestionFormOuter } from "@/features/question/components/QuestionFormOuter";

export default function Page() {
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    if (router.query.id) {
      setId(Number(router.query.id));
    }
  }, [router.query.id]);

  const { data } = trpc.bank.getById.useQuery(
    { id: id! },
    { enabled: id !== null }
  );

  if (!id || !data) return <div>Loading...</div>;

  return (
    <GuardedLayout>
      <HeadMetaData
        title={data?.title}
        metaDescription="Create question for subject"
        pathName={`/subjects/${id}/questions`}
      />
      <Header
        title="Question"
        subtitle="Fill the fields below to create question for subject"
      >
        <Link
          href="/subjects"
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <ChevronLeft className="h-4 w-4" />
          All subjects
        </Link>
      </Header>
      <div className="pb-10">
        <QuestionFormOuter
          subject={{
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          }}
        />
      </div>
    </GuardedLayout>
  );
}
