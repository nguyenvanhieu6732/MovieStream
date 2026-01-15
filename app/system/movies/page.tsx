"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ExternalLink, Film } from "lucide-react";

interface PremiumMovie {
  id: string;
  slug: string;
  note?: string;
  createdAt: string;
}

export default function PremiumMoviesPage() {
  const [movies, setMovies] = useState<PremiumMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    const res = await fetch("/api/admin/premium-movies");
    const data = await res.json();
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleRemove = async (slug: string) => {
    if (!confirm("Gỡ phim này khỏi Premium?")) return;

    await fetch("/api/admin/premium-movies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });

    fetchMovies();
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Film /> Quản lý phim Premium
      </h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Tên / ghi chú</TableHead>
            <TableHead>Ngày thêm</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {movies.map((movie) => (
            <TableRow key={movie.id}>
              <TableCell className="font-mono">{movie.slug}</TableCell>
              <TableCell>{movie.note || "-"}</TableCell>
              <TableCell>
                {new Date(movie.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/movie/${movie.slug}`} target="_blank">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Xem
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(movie.slug)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Gỡ
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {movies.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Chưa có phim Premium nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
