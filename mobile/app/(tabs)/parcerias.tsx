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
import { partnershipsApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type PartnershipStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "CLOSED";

interface Partnership {
  id: string;
  status: PartnershipStatus;
  commissionSplit?: number | string;
  message?: string;
  createdAt: string;
  property: { id: string; title: string; price: number | string; city: string };
  requester: { id: string; name: string; phone?: string };
  receiver: { id: string; name: string; phone?: string };
  buyer?: { id: string; buyerName: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<PartnershipStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceita",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  CLOSED: "Encerrada",
};

const STATUS_COLOR: Record<PartnershipStatus, string> = {
  PENDING: "#F59E0B",
  ACCEPTED: "#10B981",
  REJECTED: "#EF4444",
  CANCELLED: "#9CA3AF",
  CLOSED: "#6B7280",
};

const STATUS_BG: Record<PartnershipStatus, string> = {
  PENDING: "#FFFBEB",
  ACCEPTED: "#ECFDF5",
  REJECTED: "#FEF2F2",
  CANCELLED: "#F9FAFB",
  CLOSED: "#F3F4F6",
};

function formatPrice(v: number | string | undefined) {
  if (v == null) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "ACCEPTED", label: "Aceitas" },
  { value: "CLOSED", label: "Encerradas" },
];

// ── Modal de resposta ─────────────────────────────────────────────────────────

function RespondModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (commission: string) => void;
}) {
  const [commission, setCommission] = useState("");
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <Text style={s.modalTitle}>Aceitar Parceria</Text>
          <Text style={s.modalSub}>
            Informe a divisão de comissão (%) ou deixe em branco.
          </Text>
          <TextInput
            style={s.modalInput}
            placeholder="Ex: 50 (50%)"
            keyboardType="numeric"
            value={commission}
            onChangeText={setCommission}
          />
          <View style={s.modalBtns}>
            <TouchableOpacity style={s.modalCancel} onPress={onClose}>
              <Text style={s.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.modalConfirm}
              onPress={() => onConfirm(commission)}
            >
              <Text style={s.modalConfirmText}>Aceitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Card de parceria ──────────────────────────────────────────────────────────

function PartnershipCard({
  item,
  userId,
  onAction,
}: {
  item: Partnership;
  userId: string;
  onAction: () => void;
}) {
  const [responding, setResponding] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const isRequester = item.requester.id === userId;
  const partner = isRequester ? item.receiver : item.requester;
  const color = STATUS_COLOR[item.status];
  const bg = STATUS_BG[item.status];

  async function handleAccept(commission: string) {
    setShowAcceptModal(false);
    setResponding(true);
    try {
      const split = commission ? parseFloat(commission) : undefined;
      await partnershipsApi.respond(item.id, "ACCEPTED", split);
      onAction();
    } catch {
      Alert.alert("Erro", "Não foi possível aceitar a parceria.");
    } finally {
      setResponding(false);
    }
  }

  async function handleReject() {
    Alert.alert("Recusar parceria", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Recusar",
        style: "destructive",
        onPress: async () => {
          setResponding(true);
          try {
            await partnershipsApi.respond(item.id, "REJECTED");
            onAction();
          } catch {
            Alert.alert("Erro", "Não foi possível recusar.");
          } finally {
            setResponding(false);
          }
        },
      },
    ]);
  }

  async function handleCancel() {
    Alert.alert("Cancelar solicitação", "Tem certeza?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar parceria",
        style: "destructive",
        onPress: async () => {
          setResponding(true);
          try {
            await partnershipsApi.cancel(item.id);
            onAction();
          } catch {
            Alert.alert("Erro", "Não foi possível cancelar.");
          } finally {
            setResponding(false);
          }
        },
      },
    ]);
  }

  function handleClose() {
    Alert.alert("Encerrar parceria", "Como foi o negócio?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Negócio fechado",
        onPress: async () => {
          try {
            await partnershipsApi.close(item.id, "deal_closed");
            onAction();
          } catch {
            Alert.alert("Erro", "Não foi possível encerrar.");
          }
        },
      },
      {
        text: "Negócio não fechado",
        style: "destructive",
        onPress: async () => {
          try {
            await partnershipsApi.close(item.id, "not_closed");
            onAction();
          } catch {
            Alert.alert("Erro", "Não foi possível encerrar.");
          }
        },
      },
    ]);
  }

  return (
    <View style={s.card}>
      {/* Status + data */}
      <View style={s.cardTop}>
        <View style={[s.statusBadge, { backgroundColor: bg }]}>
          <Text style={[s.statusText, { color }]}>{STATUS_LABEL[item.status]}</Text>
        </View>
        <Text style={s.dateText}>
          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      </View>

      {/* Imóvel */}
      <Text style={s.propertyTitle} numberOfLines={2}>
        {item.property.title}
      </Text>
      <View style={s.locationRow}>
        <Ionicons name="location-outline" size={12} color="#9CA3AF" />
        <Text style={s.locationText}>{item.property.city}</Text>
        <Text style={s.dot}>·</Text>
        <Text style={s.locationText}>{formatPrice(item.property.price)}</Text>
      </View>

      {/* Parceiro */}
      <View style={s.partnerRow}>
        <View style={s.partnerAvatar}>
          <Ionicons name="person" size={14} color="#0066FF" />
        </View>
        <View>
          <Text style={s.partnerLabel}>
            {isRequester ? "Para" : "De"}: {partner.name}
          </Text>
          {partner.phone && (
            <Text style={s.partnerPhone}>{partner.phone}</Text>
          )}
        </View>
      </View>

      {/* Comprador */}
      {item.buyer && (
        <View style={s.buyerRow}>
          <Ionicons name="people-outline" size={13} color="#6B7280" />
          <Text style={s.buyerText}>Comprador: {item.buyer.buyerName}</Text>
        </View>
      )}

      {/* Comissão */}
      {item.commissionSplit != null && (
        <View style={s.commissionRow}>
          <Ionicons name="cash-outline" size={13} color="#10B981" />
          <Text style={s.commissionText}>
            Divisão de comissão: {Number(item.commissionSplit)}%
          </Text>
        </View>
      )}

      {/* Mensagem */}
      {item.message && (
        <Text style={s.message}>"{item.message}"</Text>
      )}

      {/* Ações */}
      {responding ? (
        <ActivityIndicator size="small" color="#0066FF" style={{ marginTop: 8 }} />
      ) : (
        <>
          {item.status === "PENDING" && !isRequester && (
            <View style={s.actions}>
              <TouchableOpacity
                style={[s.actionBtn, s.rejectBtn]}
                onPress={handleReject}
              >
                <Text style={s.rejectBtnText}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, s.acceptBtn]}
                onPress={() => setShowAcceptModal(true)}
              >
                <Text style={s.acceptBtnText}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === "PENDING" && isRequester && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
              <Text style={s.cancelBtnText}>Cancelar solicitação</Text>
            </TouchableOpacity>
          )}

          {item.status === "ACCEPTED" && (
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Ionicons name="checkmark-circle-outline" size={15} color="#6B7280" />
              <Text style={s.closeBtnText}>Encerrar parceria</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <RespondModal
        visible={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
      />
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function Parcerias() {
  const { user } = useAuth();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const { data } = await partnershipsApi.list(
        filter === "all" ? undefined : filter
      );
      setPartnerships(data.data ?? data);
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
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>Parcerias</Text>
        <Text style={s.count}>{partnerships.length}</Text>
      </View>

      {/* Filtros */}
      <View style={s.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[s.filterBtn, filter === f.value && s.filterBtnActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[s.filterText, filter === f.value && s.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={partnerships}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <PartnershipCard
            item={item}
            userId={user?.id ?? ""}
            onAction={load}
          />
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
          <View style={s.empty}>
            <Ionicons name="git-merge-outline" size={48} color="#D1D5DB" />
            <Text style={s.emptyText}>Nenhuma parceria encontrada</Text>
            <Text style={s.emptySub}>
              Parcerias são criadas a partir dos Matches
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EEF2FF" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterBtnActive: { backgroundColor: "#F5F3FF" },
  filterText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "#8B5CF6" },
  list: { padding: 20, gap: 12, paddingTop: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  dateText: { fontSize: 12, color: "#9CA3AF" },
  propertyTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: { fontSize: 12, color: "#9CA3AF" },
  dot: { color: "#D1D5DB" },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
  },
  partnerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerLabel: { fontSize: 13, fontWeight: "600", color: "#111827" },
  partnerPhone: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  buyerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buyerText: { fontSize: 12, color: "#6B7280" },
  commissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commissionText: { fontSize: 12, color: "#10B981", fontWeight: "600" },
  message: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 10,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FCA5A5" },
  rejectBtnText: { color: "#EF4444", fontWeight: "700", fontSize: 13 },
  acceptBtn: { backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#6EE7B7" },
  acceptBtnText: { color: "#10B981", fontWeight: "700", fontSize: 13 },
  cancelBtn: {
    marginTop: 4,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelBtnText: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  closeBtn: {
    marginTop: 4,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  closeBtnText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
  emptySub: { fontSize: 13, color: "#D1D5DB", textAlign: "center" },
  modalOverlay: {
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
    gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  modalSub: { fontSize: 13, color: "#6B7280" },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalCancelText: { color: "#6B7280", fontWeight: "600" },
  modalConfirm: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
  },
  modalConfirmText: { color: "#fff", fontWeight: "700" },
});
