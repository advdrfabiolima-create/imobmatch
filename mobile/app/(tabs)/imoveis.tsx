import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { propertiesApi } from "@/services/api";

type PropertyStatus = "AVAILABLE" | "SOLD" | "RENTED" | "INACTIVE";

const STATUS_LABEL: Record<PropertyStatus, string> = {
  AVAILABLE: "Disponível",
  SOLD: "Vendido",
  RENTED: "Alugado",
  INACTIVE: "Inativo",
};
const STATUS_COLOR: Record<PropertyStatus, string> = {
  AVAILABLE: "#10B981",
  SOLD: "#0066FF",
  RENTED: "#7C3AED",
  INACTIVE: "#9CA3AF",
};
const STATUS_BG: Record<PropertyStatus, string> = {
  AVAILABLE: "#ECFDF5",
  SOLD: "#EFF6FF",
  RENTED: "#F5F3FF",
  INACTIVE: "#F3F4F6",
};

interface Property {
  id: string;
  title: string;
  type: string;
  listingType?: string;
  transactionType: string;
  price: number;
  city: string;
  state: string;
  status?: PropertyStatus;
  bedrooms?: number;
  areaM2?: number;
  photos?: string[];
}

function formatPrice(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PropertyCard({
  item,
  onDelete,
}: {
  item: Property;
  onDelete: (id: string) => void;
}) {
  function confirmDelete() {
    Alert.alert("Remover imóvel", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => onDelete(item.id),
      },
    ]);
  }

  const cover = item.photos?.[0];
  const badge = item.listingType === "RENT" ? "Aluguel" : item.listingType === "SALE" ? "Venda" : item.transactionType;

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/imovel/${item.id}`)} activeOpacity={0.85}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.cardPhoto} />
      ) : (
        <View style={styles.cardPhotoPlaceholder}>
          <Ionicons name="business-outline" size={32} color="#D1D5DB" />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
            {item.status && item.status !== "AVAILABLE" && (
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[item.status] }]}>
                <Text style={[styles.statusBadgeText, { color: STATUS_COLOR[item.status] }]}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
      <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
      <View style={styles.cardMeta}>
        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
        <Text style={styles.cardMetaText}>
          {item.city}, {item.state}
        </Text>
        {!!item.areaM2 && (
          <>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.cardMetaText}>{item.areaM2} m²</Text>
          </>
        )}
        {!!item.bedrooms && (
          <>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="bed-outline" size={13} color="#9CA3AF" />
            <Text style={styles.cardMetaText}>{item.bedrooms}</Text>
          </>
        )}
      </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Imoveis() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await propertiesApi.myProperties();
      setProperties(data.data ?? data);
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
      await propertiesApi.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      Alert.alert("Erro", "Não foi possível remover o imóvel.");
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
          <Text style={styles.title}>Meus Imóveis</Text>
          <Text style={styles.count}>{properties.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/novo-imovel")}
        >
          <Ionicons name="add" size={22} color="#0066FF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PropertyCard item={item} onDelete={handleDelete} />
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
            <Ionicons name="business-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum imóvel cadastrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EEF2FF" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 20,
    backgroundColor: "#0F2957",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  count: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
  },
  list: { padding: 20, gap: 12, paddingTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardPhoto: { width: "100%", height: 160 },
  cardPhotoPlaceholder: {
    width: "100%", height: 120,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
  },
  cardBody: { padding: 14, gap: 6 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { color: "#0066FF", fontSize: 11, fontWeight: "700" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardPrice: { fontSize: 17, fontWeight: "800", color: "#0066FF" },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  cardMetaText: { fontSize: 12, color: "#9CA3AF" },
  dot: { color: "#D1D5DB", fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
});
