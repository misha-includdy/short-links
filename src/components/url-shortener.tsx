"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UrlShortenerProps {
  onLinkCreated?: () => void;
}

export function UrlShortener({ onLinkCreated }: UrlShortenerProps) {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ originalUrl: string; shortUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !slug.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, slug }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setResult({
        originalUrl: data.originalUrl || url,
        shortUrl: data.shortUrl
      });

      // Clear form
      setUrl("");
      setSlug("");

      // Notify parent component to refresh history
      if (onLinkCreated) {
        onLinkCreated();
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://exemple.com?utm_source=shortlinks&utm_medium=link&utm_campaign=promo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            type="text"
            placeholder="mon-lien-court"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !url.trim() || !slug.trim()}
        >
          {loading ? "Génération..." : "Générer"}
        </Button>
      </form>
      
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 shadow-none">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && (
        <Card className="p-0 bg-green-600/10 border-green-600/20 shadow-none">
          <CardContent className="p-4">
            <h2 className="text-md font-medium mb-1">Lien généré</h2>
            <div className="flex items-center gap-2">
              <a 
                href={result.shortUrl} 
                title={result.shortUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-medium text-foreground break-all inline-block border-b border-transparent hover:border-foreground/50 transition-colors"
              >
                {result.shortUrl}
              </a>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs whitespace-nowrap inline-block"
                onClick={() => copyToClipboard(result.shortUrl)}
              >
                {copied ? "Copié" : "Copier"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 