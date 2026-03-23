import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { matchesApi, partnershipsApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Match {
  id: string;
  score: number;
  status: string;
  buyer: {
    id: string;
    buyerName: string;
    maxPrice: number | string;
    desiredCity: string;
    agent?: { id: string; name: string };
  };
  property: {
    id: string;
    title: string;
    price: number | string;
    city: string;
    agentId?: string;
    agent?: { id: string; name: string };
  };
  partnership?: {
    id: string;
    status: string;
  } | null;
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

// ── Modal de solicitação de parceria ─────────────────────────────────────────

function PartnershipModal({
  visible,
  onClose,
  onConfirm,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (commission: number | undefined, message: string) => void;
  loading: boolean;
}) {
  const [commission, setCommission] = useState("50");
  const [message, setMessage] = useState("");

  const myShare = commission ? Math.min(100, Math.max(0, Number(commission))) : 50;
  const partnerShare = 100 - myShare;

  function handleConfirm() {
    const split = commission ? parseFloat(commission) : undefined;
    onConfirm(split, message);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Solicitar Parceria</Text>
          <Text style={styles.modalSub}>
            Defina a divisão de comissão e envie uma mensagem ao parceiro.
          </Text>

          {/* Divisão visual */}
          <View style={styles.splitRow}>
            <View style={[styles.splitSide, { backgroundColor: "#EFF6FF" }]}>
              <Text style={styles.splitLabel}>Você</Text>
              <Text style={[styles.splitPct, { color: "#0066FF" }]}>{myShare}%</Text>
            </View>
            <Text style={styles.splitVs}>÷</Text>
            <View style={[styles.splitSide, { backgroundColor: "#F3F4F6" }]}>
              <Text style={styles.splitLabel}>Parceiro</Text>
              <Text style={[styles.splitPct, { color: "#6B7280" }]}>{partnerShare}%</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Minha parte (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={commission}
              onChangeText={setCommission}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mensagem (opcional)</Text>
            <TextInput
              style={[styles.input, { height: 72, paddingTop: 10, textAlignVertical: "top" }]}
              placeholder="Tenho um comprador qualificado para este imóvel..."
              value={message}
              onChangeText={setMessage}
              multiline
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose} disabled={loading}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalConfirm, loading && { opacity: 0.6 }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalConfirmText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Card de match ──────────────────────────────────────────────────────────────

function MatchCard({
  item,
  userId,
  onPartnershipSent,
}: {
  item: Match;
  userId: string;
  onPartnershipSent: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const color = scoreColor(item.score);

  // Quem é o "outro" agente neste match
  const iMyBuyer = item.buyer?.agent?.id === userId;
  const otherAgentId = iMyBuyer
    ? (item.property?.agentId ?? item.property?.agent?.id)
    : item.buyer?.agent?.id;
  const otherAgentName = iMyBuyer
    ? item.property?.agent?.name
    : item.buyer?.agent?.name;
  const isCrossAgent = !!otherAgentId && otherAgentId !== userId;

  const partnershipStatus = item.partnership?.status;
  const canRequest = isCrossAgent && !partnershipStatus;
  const partnershipLabel =
    partnershipStatus === "PENDING"  ? "Solicitação enviada" :
    partnershipStatus === "ACCEPTED" ? "Parceria ativa" : null;
  const partnershipColor =
    partnershipStatus === "PENDING"  ? "#F59E0B" :
    partnershipStatus === "ACCEPTED" ? "#10B981" : "#9CA3AF";

  async function handleRequest(commission: number | undefined, message: string) {
    if (!item.property?.id || !otherAgentId) return;
    setRequesting(true);
    try {
      await partnershipsApi.request({
        propertyId: item.property.id,
        receiverId: otherAgentId,
        commissionSplit: commission,
        message: message.trim() || undefined,
      });
      setShowModal(false);
      onPartnershipSent();
      Alert.alert("Parceria solicitada!", "O corretor será notificado.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Não foi possível solicitar a parceria.";
      Alert.alert("Erro", Array.isArray(msg) ? msg.join("\n") : String(msg));
    } finally {
      setRequesting(false);
    }
  }

  return (
    <View style={styles.card}>
      {/* Score + status */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.scoreText, { color }]}>{item.score}%</Text>
        </View>
        <Text style={styles.matchStatus}>{item.status}</Text>
      </View>

      {/* Comprador → Imóvel */}
      <View style={styles.sides}>
        <View style={styles.side}>
          <Ionicons name="person" size={14} color="#6B7280" />
          <Text style={styles.sideLabel}>{item.buyer.buyerName}</Text>
          <Text style={styles.sideSub}>até {formatPrice(item.buyer.maxPrice)}</Text>
          {item.buyer.agent && item.buyer.agent.id !== userId && (
            <Text style={styles.sideAgent}>Corretor: {item.buyer.agent.name}</Text>
          )}
        </View>
        <Ionicons name="arrow-forward" size={18} color="#D1D5DB" />
        <View style={styles.side}>
          <Ionicons name="business" size={14} color="#6B7280" />
          <Text style={styles.sideLabel} numberOfLines={2}>{item.property.title}</Text>
          <Text style={styles.sideSub}>{formatPrice(item.property.price)}</Text>
          {item.property.agent && item.property.agentId !== userId && (
            <Text style={styles.sideAgent}>Corretor: {item.property.agent.name}</Text>
          )}
        </View>
      </View>

      {/* Status da parceria existente */}
      {partnershipLabel && (
        <View style={[styles.partnershipStatus, { borderColor: partnershipColor + "50" }]}>
          <Ionicons name="git-network-outline" size={14} color={partnershipColor} />
          <Text style={[styles.partnershipStatusText, { color: partnershipColor }]}>
            {partnershipLabel}
          </Text>
        </View>
      )}

      {/* Botão Fazer Parceria */}
      {canRequest && (
        <TouchableOpacity
          style={styles.partnerBtn}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="git-network-outline" size={16} color="#fff" />
          <Text style={styles.partnerBtnText}>
            Fazer Parceria
            {otherAgentName ? ` com ${otherAgentName}` : ""}
          </Text>
        </TouchableOpacity>
      )}

      <PartnershipModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleRequest}
        loading={requesting}
      />
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "best">("all");

  async function handleGenerate() {
    try {
      await matchesApi.generate();
      setLoading(true);
      load();
    } catch {
      // silencia
    }
  }

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
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
          <Ionicons name="flash" size={16} color="#fff" />
          <Text style={styles.generateBtnText}>Gerar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {(["all", "best"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "Todos" : "⚡ Melhores (≥70%)"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MatchCard item={item} userId={user?.id ?? ""} onPartnershipSent={load} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
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
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EEF2FF" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
    backgroundColor: "#0F2957",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  generateBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterBtnActive: { backgroundColor: "#EEF2FF" },
  filterText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "#0066FF" },
  list: { padding: 20, gap: 12, paddingTop: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  scoreText: { fontSize: 14, fontWeight: "800" },
  matchStatus: { fontSize: 12, color: "#9CA3AF", textTransform: "uppercase" },
  sides: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  side: { flex: 1, gap: 2 },
  sideLabel: { fontSize: 13, fontWeight: "700", color: "#111827" },
  sideSub: { fontSize: 11, color: "#6B7280" },
  sideAgent: { fontSize: 11, color: "#0066FF", marginTop: 2 },
  partnershipStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  partnershipStatusText: { fontSize: 12, fontWeight: "700" },
  partnerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    borderRadius: 10,
    paddingVertical: 11,
  },
  partnerBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
  emptySub: { fontSize: 13, color: "#D1D5DB", textAlign: "center" },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    gap: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  modalSub: { fontSize: 13, color: "#6B7280" },
  splitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  splitSide: {
    flex: 1, borderRadius: 10, paddingVertical: 12,
    alignItems: "center", gap: 4,
  },
  splitLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  splitPct: { fontSize: 22, fontWeight: "800" },
  splitVs: { fontSize: 20, color: "#D1D5DB", fontWeight: "700" },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  input: {
    height: 48, borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10,
    paddingHorizontal: 14, fontSize: 14, color: "#111827",
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 2 },
  modalCancel: {
    flex: 1, height: 44, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  modalCancelText: { color: "#6B7280", fontWeight: "600" },
  modalConfirm: {
    flex: 1, height: 44, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#7C3AED",
  },
  modalConfirmText: { color: "#fff", fontWeight: "700" },
});
