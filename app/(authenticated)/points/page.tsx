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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  ArrowLeft,
  Coins,
  TrendingDown,
  TrendingUp,
  Loader2,
} from "lucide-react";
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
  {
    label: string;
    variant: BadgeProps["variant"];
    icon?: React.ReactNode;
    description?: string;
  }
> = {
  VIEW_SPENT: {
    label: "Visualizzazione appunti",
    variant: "destructive",
    icon: <TrendingDown className="h-3 w-3" />,
    description: "Punti spesi per visualizzare appunti",
  },
  PURCHASE_SPENT: {
    label: "Acquisto appunti",
    variant: "destructive",
    icon: <TrendingDown className="h-3 w-3" />,
    description: "Punti spesi per acquistare appunti",
  },
  PURCHASE_EARNED: {
    label: "Vendita appunti",
    variant: "secondary",
    icon: <TrendingUp className="h-3 w-3" />,
    description: "Punti guadagnati dalla vendita dei tuoi appunti",
  },
  UPLOAD_REWARD: {
    label: "Premio caricamento",
    variant: "secondary",
    icon: <TrendingUp className="h-3 w-3" />,
    description: "Bonus per il caricamento di nuovi appunti",
  },
  MONTHLY_BONUS: {
    label: "Bonus mensile",
    variant: "secondary",
    icon: <TrendingUp className="h-3 w-3" />,
    description: "Bonus mensile per l'attività sulla piattaforma",
  },
};

export default function PointsHistoryPage() {
  const [transactions, setTransactions] = React.useState<PointTransaction[]>(
    []
  );
  const [totalPoints, setTotalPoints] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const stats = React.useMemo(() => {
    if (!transactions.length) return null;

    return {
      earned: transactions.reduce(
        (sum, t) => (t.amount > 0 ? sum + t.amount : sum),
        0
      ),
      spent: Math.abs(
        transactions.reduce(
          (sum, t) => (t.amount < 0 ? sum + t.amount : sum),
          0
        )
      ),
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointsRes, historyRes] = await Promise.all([
          fetch("/api/v1/users/me/points"),
          fetch("/api/v1/users/me/points/history"),
        ]);

        if (!pointsRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch points data");
        }

        const [pointsData, historyData] = await Promise.all([
          pointsRes.json(),
          historyRes.json(),
        ]);

        // Convert old PURCHASE type to new specific types based on amount
        const processedTransactions = historyData.transactions.map(
          (t: PointTransaction) => ({
            ...t,
            type:
              t.type === "PURCHASE"
                ? t.amount > 0
                  ? "PURCHASE_EARNED"
                  : "PURCHASE_SPENT"
                : t.type,
          })
        );

        setTotalPoints(pointsData.points);
        setTransactions(processedTransactions);
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
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
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
          {/* Points Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Punti Totali
                </CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {totalPoints}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saldo attuale disponibile
                </p>
              </CardContent>
            </Card>

            {stats && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Punti Guadagnati
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +{stats.earned}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Totale punti in entrata
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Punti Spesi
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      -{stats.spent}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Totale punti in uscita
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Transazioni
                    </CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalTransactions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Numero totale di movimenti
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/upload">Carica appunti</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/library">Sfoglia appunti</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Storico transazioni</CardTitle>
              <CardDescription>
                Tutti i movimenti dei tuoi punti in ordine cronologico
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
                    transactions.map((transaction) => {
                      const typeConfig =
                        transactionTypeConfig[transaction.type];
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "it-IT",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={typeConfig?.variant || "default"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {typeConfig?.icon}
                              {typeConfig?.label || transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              {transaction.description}
                              {typeConfig?.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {typeConfig.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
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
                      );
                    })
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
