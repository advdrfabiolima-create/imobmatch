import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { buyersApi } from "@/services/api";

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  CONDO_HOUSE: "Casa em Condomínio",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
  RURAL: "Rural",
};

interface Buyer {
  id: string;
  buyerName: string;
  desiredCity: string;
  desiredState?: string;
  maxPrice: number;
  minPrice?: number;
  propertyType: string;
  bedrooms?: number;
  status: string;
  openMatchCount?: number;
}

function formatPrice(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function BuyerCard({
  item,
  onDelete,
}: {
  item: Buyer;
  onDelete: (id: string) => void;
}) {
  function confirmDelete() {
    Alert.alert("Remover comprador", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => onDelete(item.id),
      },
    ]);
  }

  const typeLabel = PROPERTY_TYPE_LABEL[item.propertyType] ?? item.propertyType;
  const isInactive = item.status !== "ACTIVE";

  return (
    <View style={[styles.card, isInactive && styles.cardInactive]}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#0066FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.buyerName} numberOfLines={1}>
              {item.buyerName}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#9CA3AF" />
              <Text style={styles.locationText}>
                {item.desiredCity}
                {item.desiredState ? `, ${item.desiredState}` : ""}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{typeLabel}</Text>
        </View>
        {!!item.bedrooms && (
          <View style={styles.badgeGray}>
            <Ionicons name="bed-outline" size={12} color="#6B7280" />
            <Text style={styles.badgeGrayText}>{item.bedrooms} quartos</Text>
          </View>
        )}
        {!!item.openMatchCount && item.openMatchCount > 0 && (
          <View style={styles.badgeMatch}>
            <Ionicons name="flash" size={12} color="#F59E0B" />
            <Text style={styles.badgeMatchText}>{item.openMatchCount} matches</Text>
          </View>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Orçamento</Text>
        <Text style={styles.priceValue}>
          {item.minPrice ? `${formatPrice(item.minPrice)} – ` : "até "}
          {formatPrice(item.maxPrice)}
        </Text>
      </View>
    </View>
  );
}

export default function Compradores() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await buyersApi.myBuyers();
      setBuyers(data.data ?? data);
    } catch {
      // silencia
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    try {
      await buyersApi.delete(id);
      setBuyers((prev) => prev.filter((b) => b.id !== id));
    } catch {
      Alert.alert("Erro", "Não foi possível remover o comprador.");
    }
  }

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.title}>Compradores</Text>
          <Text style={styles.count}>{buyers.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/novo-comprador")}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={buyers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BuyerCard item={item} onDelete={handleDelete} />
        )}
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
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum comprador cadastrado</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  count: {
    backgroundColor: "#ECFDF5",
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  list: { padding: 20, gap: 12, paddingTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInactive: { opacity: 0.6 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTopLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  buyerName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  locationText: { fontSize: 12, color: "#9CA3AF" },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { color: "#0066FF", fontSize: 11, fontWeight: "700" },
  badgeGray: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeGrayText: { color: "#6B7280", fontSize: 11, fontWeight: "600" },
  badgeMatch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeMatchText: { color: "#F59E0B", fontSize: 11, fontWeight: "700" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
  },
  priceLabel: { fontSize: 12, color: "#9CA3AF" },
  priceValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
});
