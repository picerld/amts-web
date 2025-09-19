import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { IBank } from "@/types/bank";
import { useRouter } from "next/navigation";

export const QuestionCard = () => {
  const router = useRouter();

  const { data }: { data: IBank[] | undefined } = trpc.bank.getAll.useQuery();

  if (data?.length == 0)
    return <p className="text-lg">Belum ada pertanyaan ...</p>;

  if (!data) return <p className="text-lg">Oops! belum ada pertanyaan ..</p>;

  return (
    <div className="grid grid-cols-4 gap-4 w-full">
      {data?.slice(0, 8).map((bank) => (
        <Card key={bank.id} className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-bold text-2xl">{bank.title}</CardTitle>
            <CardDescription className="flex justify-between">
              <p className="text-sm font-semibold">{bank.user.username}</p>
              <p className="text-sm">
                {bank.createdAt.toLocaleString("id-Id")}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>test</CardContent>
          <CardFooter className="flex gap-3">
            <Button
              onClick={() => {
                router.push("/question/create");
                localStorage.setItem("bankId", bank.id.toString());
                localStorage.setItem("topicTitle", bank.title);
              }}
              className="w-1/2"
            >
              Lihat Bank Soal
            </Button>
            <Button
              onClick={() => {
                router.push("/question/create");
                localStorage.setItem("bankId", bank.id.toString());
                localStorage.setItem("topicTitle", bank.title);
              }}
              className="w-1/2"
            >
              Preview Soal
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
