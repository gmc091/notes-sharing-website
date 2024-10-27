// app/(authenticated)/points/page.tsx

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, Loader2 } from "lucide-react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import Link from "next/link";

interface PointTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

const transactionTypeConfig: Record<
  string,
  { label: string; variant: BadgeProps["variant"] }
> = {
  VIEW_SPENT: {
    label: "Visualizzazione",
    variant: "destructive",
  },
  VIEW_EARNED: {
    label: "Guadagno visualizzazione",
    variant: "secondary",
  },
  UPLOAD_REWARD: {
    label: "Premio caricamento",
    variant: "secondary",
  },
  MONTHLY_BONUS: {
    label: "Bonus mensile",
    variant: "secondary",
  },
  RATING_BONUS: {
    label: "Bonus valutazione",
    variant: "secondary",
  },
};

export default function PointsHistoryPage() {
  const [transactions, setTransactions] = React.useState<PointTransaction[]>(
    []
  );
  const [totalPoints, setTotalPoints] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointsRes, historyRes] = await Promise.all([
          fetch("/api/points"),
          fetch("/api/points/history"),
        ]);

        if (!pointsRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch points data");
        }

        const [pointsData, historyData] = await Promise.all([
          pointsRes.json(),
          historyRes.json(),
        ]);

        setTotalPoints(pointsData.points);
        setTransactions(historyData.transactions);
      } catch (error) {
        console.error("Error fetching points data:", error);
        setError("Si è verificato un errore durante il caricamento dei dati");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button asChild>
                <Link href="/">Torna alla home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla home
        </Link>

        <div className="space-y-6">
          {/* Points Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />I tuoi punti
              </CardTitle>
              <CardDescription>
                Storia completa delle tue transazioni di punti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Punti totali
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {totalPoints}
                  </p>
                </div>
                <Button asChild variant="default">
                  <Link href="/upload" className="flex items-center gap-2">
                    Carica appunti
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Storico transazioni</CardTitle>
              <CardDescription>
                Tutti i movimenti dei tuoi punti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead className="text-right">Punti</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nessuna transazione trovata
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(transaction.createdAt).toLocaleDateString(
                            "it-IT",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transactionTypeConfig[transaction.type]
                                ?.variant || "default"
                            }
                          >
                            {transactionTypeConfig[transaction.type]?.label ||
                              transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
