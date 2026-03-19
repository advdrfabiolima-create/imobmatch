"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bed, Bath, Maximize2, MapPin, Edit, Trash2, ChevronDown, RotateCcw, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    type: string;
    status: string;
    listingType?: string;
    price: number;
    city: string;
    state: string;
    neighborhood?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaM2?: number;
    photos: string[];
    agent?: { name: string; phone?: string };
  };
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (newStatus: string) => void;
  onGenerateOpportunity?: () => void;
}

const STATUS_OPTIONS: Record<string, { value: string; label: string; color: string }[]> = {
  AVAILABLE: [
    { value: "SOLD",     label: "Marcar como Vendido",  color: "text-green-700" },
    { value: "RENTED",   label: "Marcar como Alugado",  color: "text-blue-700" },
    { value: "INACTIVE", label: "Desativar temporariamente", color: "text-gray-600" },
  ],
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  SOLD:      "bg-purple-100 text-purple-700",
  RENTED:    "bg-blue-100 text-blue-700",
  INACTIVE:  "bg-gray-100 text-gray-500",
};

export function PropertyCard({ property, showActions, onEdit, onDelete, onStatusChange, onGenerateOpportunity }: PropertyCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mainPhoto = property.photos?.[0] || "https://via.placeholder.com/400x250?text=Sem+Foto";
  const isAvailable = property.status === "AVAILABLE";
  const isInactive = property.status === "INACTIVE";
  const isClosed = property.status === "SOLD" || property.status === "RENTED";

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={mainPhoto}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <Badge className="bg-white/90 text-gray-800 border-0 shadow-sm text-xs">
            {PROPERTY_TYPE_LABELS[property.type]}
          </Badge>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${STATUS_BADGE_STYLES[property.status] ?? "bg-gray-100 text-gray-500"}`}>
            {PROPERTY_STATUS_LABELS[property.status]}
          </span>
          {property.listingType === "RENT" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-sm bg-orange-100 text-orange-700">
              Aluguel
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-sm bg-blue-100 text-blue-700">
              Venda
            </span>
          )}
        </div>
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-blue-50 text-blue-600"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 text-red-600"
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <Link href={`/imovel/${property.id}${showActions ? "?from=dashboard" : ""}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {property.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ""}
            {property.city}/{property.state}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" /> {property.bedrooms} quartos
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {property.bathrooms}
            </span>
          )}
          {property.areaM2 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-4 w-4" /> {Number(property.areaM2)}m²
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-blue-600">{formatCurrency(property.price)}</span>
          <Link
            href={`/imovel/${property.id}${showActions ? "?from=dashboard" : ""}`}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Ver detalhes
          </Link>
        </div>

        {/* Status actions */}
        {showActions && onStatusChange && (
          <div className="border-t pt-3 space-y-2">
            {/* Gerar Oportunidade — apenas para imóveis disponíveis */}
            {isAvailable && onGenerateOpportunity && (
              <button
                onClick={onGenerateOpportunity}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-orange-200 bg-orange-50 text-sm font-medium text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                🔥 Gerar oportunidade
              </button>
            )}

            {isAvailable && (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Alterar status
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>
                {showDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {STATUS_OPTIONS.AVAILABLE.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onStatusChange(opt.value);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${opt.color}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(isInactive || isClosed) && (
              <button
                onClick={() => onStatusChange("AVAILABLE")}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-blue-200 text-sm text-blue-600 hover:bg-blue-50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isInactive ? "Reativar imóvel" : "Marcar como disponível"}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
