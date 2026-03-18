import { useQuery } from "@tanstack/react-query";

export function useCities(state: string) {
  const { data: cities = [], isLoading } = useQuery<string[]>({
    queryKey: ["ibge-cities", state],
    queryFn: () =>
      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`
      )
        .then((r) => r.json())
        .then((data) => data.map((m: { nome: string }) => m.nome)),
    enabled: !!state,
    staleTime: 1000 * 60 * 60, // cache 1h — cidades não mudam
    gcTime: 1000 * 60 * 60 * 24,
  });

  return { cities, isLoading };
}
