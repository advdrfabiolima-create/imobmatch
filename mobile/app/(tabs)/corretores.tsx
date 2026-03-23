import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Image, Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { corretoresApi, messagesApi } from "@/services/api";

interface Corretor {
  id: string;
  name: string;
  city?: string;
  state?: string;
  creci?: string;
  avatarUrl?: string;
  agency?: string;
  propertiesCount?: number;
}

function CorretorCard({ item }: { item: Corretor }) {
  async function handleMessage() {
    router.push("/(tabs)/mensagens" as any);
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() ?? "?"}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {(item.city || item.state) && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={styles.location}>{[item.city, item.state].filter(Boolean).join(", ")}</Text>
          </View>
        )}
        {item.creci && <Text style={styles.creci}>CRECI: {item.creci}</Text>}
        {item.agency && <Text style={styles.agency} numberOfLines={1}>{item.agency}</Text>}
      </View>
      <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
        <Ionicons name="chatbubble-outline" size={18} color="#0066FF" />
      </TouchableOpacity>
    </View>
  );
}

export default function Corretores() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async (q?: string) => {
    try {
      const { data } = await corretoresApi.list(q ? { search: q } : undefined);
      setCorretores(data.data ?? data);
    } catch {
      // silencia
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSearch() { setLoading(true); load(search); }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Corretores</Text>
        <Text style={styles.subtitle}>Rede ImobMatch</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou cidade..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); load(); }}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0066FF" /></View>
      ) : (
        <FlatList
          data={corretores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CorretorCard item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Nenhum corretor encontrado</Text>
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
  },
  title: { fontSize: 22, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  searchRow: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F1F5F9", borderRadius: 10, paddingHorizontal: 12, height: 40,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardLeft: {},
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#0066FF" },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
  location: { fontSize: 12, color: "#9CA3AF" },
  creci: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  agency: { fontSize: 12, color: "#0066FF", fontWeight: "600", marginTop: 2 },
  msgBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
});
