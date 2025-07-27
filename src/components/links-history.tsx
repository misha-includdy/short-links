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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Link {
  slug: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string | null;
}

export function LinksHistory() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Erreur lors du chargement");
        return;
      }

      // Validate the data structure
      const validLinks = (data.links || []).filter((link: any) => {
        if (!link || typeof link !== 'object') {
          console.error('Invalid link object:', link);
          return false;
        }
        if (typeof link.originalUrl !== 'string') {
          console.error('Invalid originalUrl:', link.originalUrl);
          return false;
        }
        return true;
      });

      setLinks(validLinks);
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const cleanupCorruptedData = async () => {
    try {
      setCleaning(true);
      const response = await fetch('/api/links', { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok) {
        console.log(data.message);
        // Refresh the links after cleanup
        await fetchLinks();
      } else {
        console.error('Cleanup failed:', data.error);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      setCleaning(false);
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
                  <ArrowDownIcon className="h-3 w-3" />
                ) : column.getIsSorted() === "asc" ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
              </div>
            </div>
          </Button>
        );
      },
      cell: ({ row }: { row: Row<Link> }) => {
        const link = row.original;
        
        // Ensure we have valid data
        if (!link || typeof link.originalUrl !== 'string') {
          console.error('Invalid link data in cell:', link);
          return <div className="text-xs text-red-500">Erreur de données</div>;
        }
        
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
      accessorKey: "createdAt",
      header: ({ column }: { column: Column<Link> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              Date
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {column.getIsSorted() === "desc" ? (
                  <ArrowDownIcon className="h-3 w-3" />
                ) : column.getIsSorted() === "asc" ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
              </div>
            </div>
          </Button>
        );
      },
      size: 120,
      cell: ({ row }: { row: Row<Link> }) => {
        const link = row.original;
        
        // Ensure we have valid data
        if (!link) {
          console.error('Invalid link data in date cell:', link);
          return <div className="text-xs text-red-500">Erreur</div>;
        }
        
        if (!link.createdAt) {
          return (
            <div className="text-xs text-muted-foreground">
              N/A
            </div>
          );
        }
        
        const date = new Date(link.createdAt);
        const dateStr = format(date, "dd MMM yyyy", { locale: fr });
        const timeStr = format(date, "HH:mm", { locale: fr });
        
        return (
          <div className="text-xs text-muted-foreground">
            <div>{dateStr}</div>
            <div>{timeStr}</div>
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
          <div className="flex items-start">
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
        <div className="flex gap-2 justify-center mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLinks}
          >
            Réessayer
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={cleanupCorruptedData}
            disabled={cleaning}
          >
            {cleaning ? "Nettoyage..." : "Nettoyer données corrompues"}
          </Button>
        </div>
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