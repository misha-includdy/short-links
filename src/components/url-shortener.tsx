"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UrlShortenerProps {
  onLinkCreated?: () => void;
}

export function UrlShortener({ onLinkCreated }: UrlShortenerProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmId, setUtmId] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ originalUrl: string; shortUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasExtractedUtm = useRef(false);

  // Extract UTM parameters from base URL only once when first entered
  useEffect(() => {
    if (!baseUrl.trim()) {
      // Clear UTM fields if base URL is empty
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setUtmTerm("");
      setUtmContent("");
      setUtmId("");
      hasExtractedUtm.current = false;
      return;
    }

    // Only extract UTM parameters if we haven't done it yet for this URL
    if (!hasExtractedUtm.current) {
      try {
        const url = new URL(baseUrl);
        const params = new URLSearchParams(url.search);
        
        // Extract UTM parameters and populate fields
        setUtmSource(params.get('utm_source') || "");
        setUtmMedium(params.get('utm_medium') || "");
        setUtmCampaign(params.get('utm_campaign') || "");
        setUtmTerm(params.get('utm_term') || "");
        setUtmContent(params.get('utm_content') || "");
        setUtmId(params.get('utm_id') || "");
        
        // Mark as extracted so we don't do it again
        hasExtractedUtm.current = true;
      } catch (error) {
        // If baseUrl is not a valid URL, clear UTM fields
        setUtmSource("");
        setUtmMedium("");
        setUtmCampaign("");
        setUtmTerm("");
        setUtmContent("");
        setUtmId("");
        hasExtractedUtm.current = false;
      }
    }
  }, [baseUrl]);

  // Reset extraction flag when base URL is cleared
  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setBaseUrl(newValue);
    
    // Reset extraction flag if URL is cleared
    if (!newValue.trim()) {
      hasExtractedUtm.current = false;
    }
  };

  // Compute the full URL with UTM parameters
  const fullUrl = useMemo(() => {
    if (!baseUrl.trim()) return "";

    try {
      const url = new URL(baseUrl);
      
      // Create a new URLSearchParams object with existing parameters
      const existingParams = new URLSearchParams(url.search);
      
      // Update or add UTM parameters
      if (utmSource.trim()) existingParams.set('utm_source', utmSource.trim());
      if (utmMedium.trim()) existingParams.set('utm_medium', utmMedium.trim());
      if (utmCampaign.trim()) existingParams.set('utm_campaign', utmCampaign.trim());
      if (utmTerm.trim()) existingParams.set('utm_term', utmTerm.trim());
      if (utmContent.trim()) existingParams.set('utm_content', utmContent.trim());
      if (utmId.trim()) existingParams.set('utm_id', utmId.trim());
      
      // Update the URL with all parameters
      url.search = existingParams.toString();
      
      return url.toString();
    } catch (error) {
      // If baseUrl is not a valid URL, return it as is
      return baseUrl;
    }
  }, [baseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, utmId]);

  // Check if the full URL is valid
  const isUrlValid = useMemo(() => {
    if (!fullUrl.trim()) return true; // Empty URL is considered valid (not an error)
    try {
      new URL(fullUrl);
      return true;
    } catch {
      return false;
    }
  }, [fullUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseUrl.trim() || !slug.trim() || !isUrlValid) return;

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
        body: JSON.stringify({ url: fullUrl, slug }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setResult({
        originalUrl: data.originalUrl || fullUrl,
        shortUrl: data.shortUrl
      });

      // Clear form
      setBaseUrl("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setUtmTerm("");
      setUtmContent("");
      setUtmId("");
      setSlug("");
      hasExtractedUtm.current = false;

      // Notify parent component to refresh history
      if (onLinkCreated) {
        try {
          onLinkCreated();
        } catch (error) {
          console.error('Error refreshing history:', error);
          // Don't show this error to the user since the link was created successfully
        }
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
          <Label htmlFor="baseUrl">URL de base</Label>
          <Input
            id="baseUrl"
            type="url"
            placeholder="https://exemple.com"
            value={baseUrl}
            onChange={handleBaseUrlChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="utmSource">UTM Source</Label>
            <Input
              id="utmSource"
              type="text"
              placeholder="google"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utmMedium">UTM Medium</Label>
            <Input
              id="utmMedium"
              type="text"
              placeholder="cpc"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utmCampaign">UTM Campaign</Label>
            <Input
              id="utmCampaign"
              type="text"
              placeholder="promo-ete"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utmTerm">UTM Term</Label>
            <Input
              id="utmTerm"
              type="text"
              placeholder="mots-cles"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utmContent">UTM Content</Label>
            <Input
              id="utmContent"
              type="text"
              placeholder="banner-1"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utmId">UTM ID</Label>
            <Input
              id="utmId"
              type="text"
              placeholder="123456789"
              value={utmId}
              onChange={(e) => setUtmId(e.target.value)}
            />
          </div>
        </div>

        {fullUrl && (
          <div className="p-3 bg-muted/50 rounded-md border">
            <Label className="text-sm font-medium">URL complète générée</Label>
            <p className="text-sm text-muted-foreground break-all mt-1">
              {isUrlValid ? fullUrl : <span className="text-red-500">URL invalide</span>}
            </p>
          </div>
        )}
        
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

        {slug.trim() && (
          <div className="p-3 bg-muted/50 rounded-md border">
            <Label className="text-sm font-medium">URL courte générée</Label>
            <p className="text-sm text-muted-foreground break-all mt-1">
              {`https://includdy.com/p/${slug.trim()}`}
            </p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !baseUrl.trim() || !slug.trim() || !isUrlValid}
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