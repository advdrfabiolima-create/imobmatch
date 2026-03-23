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
      activeOpacity={href ? 0.75 : 1}
      onPress={href ? () => router.push(href as any) : undefined}
    >
      <View style={[styles.cardIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    try { await matchesApi.generate(); load(); } catch {} finally { setGenerating(false); }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0066FF" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]} 👋</Text>
          <Text style={styles.subGreeting}>Seu painel de hoje</Text>
        </View>
        <TouchableOpacity
          style={[styles.generateBtn, generating && { opacity: 0.6 }]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="flash" size={18} color="#fff" />}
          <Text style={styles.generateBtnText}>Gerar Matches</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.row}>
          <StatCard icon="business" label="Imóveis" value={stats?.propertiesCount ?? 0} color="#0066FF" bg="#DBEAFE" href="/(tabs)/imoveis" />
          <StatCard icon="people" label="Clientes" value={stats?.buyersCount ?? 0} color="#059669" bg="#D1FAE5" href="/(tabs)/compradores" />
        </View>
        <View style={styles.row}>
          <StatCard icon="flash" label="Matches" value={stats?.matchesCount ?? 0} color="#D97706" bg="#FEF3C7" href="/(tabs)/matches" />
          <StatCard icon="git-merge" label="Parcerias" value={stats?.partnershipsPending ?? 0} color="#7C3AED" bg="#EDE9FE" href="/(tabs)/parcerias" />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/novo-imovel")}>
            <Ionicons name="add-circle" size={22} color="#0066FF" />
            <Text style={styles.actionText}>Novo Imóvel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/novo-comprador")}>
            <Ionicons name="person-add" size={22} color="#059669" />
            <Text style={styles.actionText}>Novo Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/(tabs)/mensagens")}>
            <Ionicons name="chatbubbles" size={22} color="#7C3AED" />
            <Text style={styles.actionText}>Mensagens</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EEF2FF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0F2957",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 28,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: "#fff" },
  subGreeting: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  generateBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#0066FF",
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
  },
  generateBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  content: { padding: 20, gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    alignItems: "flex-start", gap: 10,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardValue: { fontSize: 28, fontWeight: "800", color: "#0F172A" },
  cardLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14,
    alignItems: "center", gap: 8,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  actionText: { fontSize: 12, fontWeight: "600", color: "#374151", textAlign: "center" },
});
