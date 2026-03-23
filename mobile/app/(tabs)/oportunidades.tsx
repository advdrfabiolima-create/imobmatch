import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { oportunidadesApi } from "@/services/api";

interface Oportunidade {
  id: string;
  title: string;
  propertyType: string;
  priceNormal: number | string;
  priceUrgent: number | string;
  city: string;
  neighborhood?: string;
  description?: string;
  acceptsOffer: boolean;
  status: string;
  photoUrl?: string;
  agent?: { name: string; avatarUrl?: string };
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Apartamento", HOUSE: "Casa", CONDO_HOUSE: "Casa em Cond.",
  LAND: "Terreno", COMMERCIAL: "Comercial", RURAL: "Rural",
};

function formatPrice(v: number | string | undefined) {
  if (v == null) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function OportunidadeCard({ item }: { item: Oportunidade }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.typeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{TYPE_LABEL[item.propertyType] ?? item.propertyType}</Text>
          </View>
          {item.acceptsOffer && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>Aceita oferta</Text>
            </View>
          )}
        </View>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
        <Text style={styles.location}>{item.neighborhood ? `${item.neighborhood}, ` : ""}{item.city}</Text>
      </View>

      {item.description && (
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      )}

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Valor normal</Text>
          <Text style={styles.price}>{formatPrice(item.priceNormal)}</Text>
        </View>
        <View style={styles.urgentBox}>
          <Text style={styles.urgentLabel}>⚡ Urgente</Text>
          <Text style={styles.urgentPrice}>{formatPrice(item.priceUrgent)}</Text>
        </View>
      </View>

      {item.agent && (
        <View style={styles.agentRow}>
          <Ionicons name="person-circle-outline" size={14} color="#9CA3AF" />
          <Text style={styles.agentName}>{item.agent.name}</Text>
        </View>
      )}
    </View>
  );
}

export default function Oportunidades() {
  const [items, setItems] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await oportunidadesApi.list();
      setItems(data.data ?? data);
    } catch {
      // silencia
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Oportunidades</Text>
          <Text style={styles.headerSub}>Imóveis com venda urgente</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/nova-oportunidade" as any)}
        >
          <Ionicons name="add" size={22} color="#0066FF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0066FF" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <OportunidadeCard item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="pricetag-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Nenhuma oportunidade disponível</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#0F2957",
    paddingTop: 64, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeRow: { flexDirection: "row", gap: 6 },
  typeBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontWeight: "700", color: "#0066FF" },
  offerBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  offerBadgeText: { fontSize: 11, fontWeight: "700", color: "#059669" },
  time: { fontSize: 11, color: "#9CA3AF" },
  title: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 12, color: "#9CA3AF" },
  desc: { fontSize: 13, color: "#64748B", lineHeight: 18 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 },
  priceLabel: { fontSize: 11, color: "#9CA3AF" },
  price: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  urgentBox: { alignItems: "flex-end" },
  urgentLabel: { fontSize: 11, color: "#F59E0B", fontWeight: "600" },
  urgentPrice: { fontSize: 16, fontWeight: "800", color: "#D97706" },
  agentRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  agentName: { fontSize: 12, color: "#9CA3AF" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
});
