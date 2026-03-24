"use client";

import { forwardRef } from "react";
import { useCities } from "@/hooks/use-cities";

interface CitySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  stateValue: string;
}

export const CitySelect = forwardRef<HTMLSelectElement, CitySelectProps>(
  ({ stateValue, className, ...props }, ref) => {
    const { cities, isLoading } = useCities(stateValue);

    const placeholder = !stateValue
      ? "Selecione o estado primeiro"
      : isLoading
      ? "Carregando cidades..."
      : "Selecione a cidade";

    return (
      <select
        ref={ref}
        disabled={!stateValue || isLoading || props.disabled}
        className={
          className ??
          "h-10 w-full rounded-md border border-border bg-muted/60 text-foreground px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        }
        {...props}
      >
        <option value="">{placeholder}</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    );
  }
);

CitySelect.displayName = "CitySelect";
