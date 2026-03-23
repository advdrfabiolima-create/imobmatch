import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { matchesApi } from "@/services/api";

interface Match {
  id: string;
  score: number;
  status: string;
  buyer: { buyerName: string; maxPrice: number | string; desiredCity: string };
  property: { title: string; price: number | string; city: string };
}

function scoreColor(score: number) {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function formatPrice(v: number | string | undefined) {
  if (v == null) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function MatchCard({ item }: { item: Match }) {
  const color = scoreColor(item.score);
  return (
    <View style={styles.card}>
      <View style={styles.scoreRow}>
        <View style={[styles.scoreBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.scoreText, { color }]}>{item.score}%</Text>
        </View>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <View style={styles.sides}>
        <View style={styles.side}>
          <Ionicons name="person" size={14} color="#6B7280" />
          <Text style={styles.sideLabel}>{item.buyer.buyerName}</Text>
          <Text style={styles.sideSub}>
            até {formatPrice(item.buyer.maxPrice)}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color="#D1D5DB" />
        <View style={styles.side}>
          <Ionicons name="business" size={14} color="#6B7280" />
          <Text style={styles.sideLabel} numberOfLines={2}>
            {item.property.title}
          </Text>
          <Text style={styles.sideSub}>{formatPrice(item.property.price)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "best">("all");

  const load = useCallback(async () => {
    try {
      const { data } =
        filter === "best" ? await matchesApi.best() : await matchesApi.list();
      setMatches(data.data ?? data);
    } catch {
      // silencia
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Matches</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {(["all", "best"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "all" ? "Todos" : "⚡ Melhores (≥70%)"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <MatchCard item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="flash-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum match encontrado</Text>
            <Text style={styles.emptySub}>
              Cadastre compradores e gere matches no Dashboard
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterBtnActive: { backgroundColor: "#EFF6FF" },
  filterText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "#0066FF" },
  list: { padding: 20, gap: 12, paddingTop: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scoreText: { fontSize: 14, fontWeight: "800" },
  status: { fontSize: 12, color: "#9CA3AF", textTransform: "uppercase" },
  sides: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  side: { flex: 1, gap: 2 },
  sideLabel: { fontSize: 13, fontWeight: "700", color: "#111827" },
  sideSub: { fontSize: 11, color: "#6B7280" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
  emptySub: { fontSize: 13, color: "#D1D5DB", textAlign: "center" },
});
