"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  ColumnDef,
  Column,
  Row,
} from "@tanstack/react-table";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

interface Link {
  slug: string;
  originalUrl: string;
  shortUrl: string;
}

export function LinksHistory() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Erreur lors du chargement");
        return;
      }

      setLinks(data.links || []);
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const copyToClipboard = async (text: string, slug: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const columns: ColumnDef<Link>[] = [
    {
      accessorKey: "slug",
      header: ({ column }: { column: Column<Link> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              Lien
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {column.getIsSorted() === "desc" ? (
                  <>
                    <ArrowDownIcon className="h-3 w-3" />
                    <span>(nouveaux d&apos;abord)</span>
                  </>
                ) : column.getIsSorted() === "asc" ? (
                  <>
                    <ArrowUpIcon className="h-3 w-3" />
                    <span>(anciens d&apos;abord)</span>
                  </>
                ) : (
                  <>
                    <ArrowDownIcon className="h-3 w-3" />
                    <span>(nouveaux d&apos;abord)</span>
                  </>
                )}
              </div>
            </div>
          </Button>
        );
      },
      cell: ({ row }: { row: Row<Link> }) => {
        const link = row.original;
        return (
          <div className="space-y-1">
            <a 
              href={link.shortUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-medium hover:underline transition-colors block truncate"
              title={link.shortUrl}
            >
              {link.shortUrl}
            </a>
            <a 
              href={link.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors block truncate"
              title={link.originalUrl}
            >
              {link.originalUrl}
            </a>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }: { row: Row<Link> }) => {
        const link = row.original;
        return (
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => copyToClipboard(link.shortUrl, link.slug)}
            >
              {copiedSlug === link.slug ? "Copié" : "Copier"}
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={fetchLinks}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Aucun lien généré pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DataTable columns={columns} data={links} onRefresh={fetchLinks} />
    </div>
  );
} 