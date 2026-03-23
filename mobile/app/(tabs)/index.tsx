import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usersApi, matchesApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  propertiesCount: number;
  buyersCount: number;
  matchesCount: number;
  partnershipsPending: number;
}

interface StatCardProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: number;
  color: string;
  bg: string;
  href?: string;
}

function StatCard({ icon, label, value, color, bg, href }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { flex: 1 }]}
      activeOpacity={href ? 0.7 : 1}
      onPress={href ? () => router.push(href as any) : undefined}
    >
      <View style={[styles.cardIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      {href && <Ionicons name="chevron-forward" size={13} color="#D1D5DB" style={{ alignSelf: "flex-end" }} />}
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dashRes] = await Promise.all([usersApi.dashboard()]);
      setStats(dashRes.data);
    } catch {
      // silencia erro
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]} 👋</Text>
          <Text style={styles.subGreeting}>Seu painel de hoje</Text>
        </View>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={() => matchesApi.generate()}
        >
          <Ionicons name="flash" size={18} color="#fff" />
          <Text style={styles.generateBtnText}>Gerar Matches</Text>
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      <Text style={styles.sectionTitle}>Resumo</Text>
      <View style={styles.row}>
        <StatCard
          icon="business"
          label="Imóveis"
          value={stats?.propertiesCount ?? 0}
          color="#0066FF"
          bg="#EFF6FF"
          href="/(tabs)/imoveis"
        />
        <StatCard
          icon="people"
          label="Compradores"
          value={stats?.buyersCount ?? 0}
          color="#10B981"
          bg="#ECFDF5"
          href="/(tabs)/compradores"
        />
      </View>
      <View style={styles.row}>
        <StatCard
          icon="flash"
          label="Matches"
          value={stats?.matchesCount ?? 0}
          color="#F59E0B"
          bg="#FFFBEB"
          href="/(tabs)/matches"
        />
        <StatCard
          icon="git-merge"
          label="Parcerias"
          value={stats?.partnershipsPending ?? 0}
          color="#8B5CF6"
          bg="#F5F3FF"
          href="/(tabs)/parcerias"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingTop: 60, gap: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subGreeting: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0066FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  generateBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  row: { flexDirection: "row", gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "flex-start",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: { fontSize: 26, fontWeight: "800", color: "#111827" },
  cardLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
});
