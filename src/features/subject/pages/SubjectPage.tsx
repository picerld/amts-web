import { useState } from "react";
import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Users,
} from "lucide-react";

const mockSubjects = [
  {
    id: 1,
    name: "Matematika Dasar",
    description: "Topik soal matematika untuk tingkat dasar",
    totalQuestions: 45,
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Bahasa Indonesia",
    description: "Kumpulan soal bahasa Indonesia untuk ujian",
    totalQuestions: 30,
    createdAt: "2024-01-10",
    status: "active",
  },
  {
    id: 3,
    name: "Sejarah Indonesia",
    description: "Soal-soal tentang sejarah kemerdekaan Indonesia",
    totalQuestions: 25,
    createdAt: "2024-01-08",
    status: "draft",
  },
  {
    id: 4,
    name: "Fisika SMA",
    description: "Topik soal fisika untuk siswa SMA",
    totalQuestions: 40,
    createdAt: "2024-01-05",
    status: "active",
  },
];

export default function SubjectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("table");

  const filteredSubjects = mockSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Aktif
      </Badge>
    ) : (
      <Badge variant="neutral">Draft</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <GuardedLayout>
      <HeadMetaData title="Subject" />
      <Header title="Subject" subtitle="Kelola topik soal untuk ujian" />

      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder="Cari subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Subject Baru
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table" className="cursor-pointer">
              Table View
            </TabsTrigger>
            <TabsTrigger value="list" className="cursor-pointer">
              List View
            </TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Subject</CardTitle>
                <CardDescription>
                  Kelola semua topik soal dalam format tabel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Subject</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Total Soal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">
                          {subject.name}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {subject.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            {subject.totalQuestions}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(subject.status)}</TableCell>
                        <TableCell>{formatDate(subject.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="neutral" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                Lihat Soal
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredSubjects.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Tidak ada subject ditemukan
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Mulai dengan membuat subject baru.
                    </p>
                    <div className="mt-6">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Subject Baru
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {subject.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {subject.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="neutral" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Lihat Soal
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {subject.totalQuestions} Soal
                        </span>
                      </div>
                      {getStatusBadge(subject.status)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(subject.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="neutral" size="sm" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Users className="mr-2 h-4 w-4" />
                        Lihat Soal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSubjects.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Tidak ada subject ditemukan
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Mulai dengan membuat subject baru untuk topik soal.
                  </p>
                  <div className="mt-6">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Subject Baru
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GuardedLayout>
  );
}
