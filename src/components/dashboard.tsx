"use client";

import { useState } from "react";
import { UrlShortener } from "@/components/url-shortener";
import { LinksHistory } from "@/components/links-history";

export function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLinkCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Colonne gauche - Formulaire */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Créer un lien court</h2>
          <UrlShortener onLinkCreated={handleLinkCreated} />
        </div>
      </div>
      
      {/* Colonne droite - Historique */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Historique</h2>
          </div>
          <LinksHistory key={refreshKey} />
        </div>
      </div>
    </div>
  );
} 