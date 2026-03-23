import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { propertiesApi } from "@/services/api";

const { width } = Dimensions.get("window");

type PropStatus = "AVAILABLE" | "SOLD" | "RENTED" | "INACTIVE";

const STATUS_OPTS: { value: PropStatus; label: string; color: string; bg: string }[] = [
  { value: "AVAILABLE", label: "Disponível", color: "#10B981", bg: "#ECFDF5" },
  { value: "SOLD",      label: "Vendido",    color: "#0066FF", bg: "#EFF6FF" },
  { value: "RENTED",    label: "Alugado",    color: "#7C3AED", bg: "#F5F3FF" },
  { value: "INACTIVE",  label: "Inativo",    color: "#9CA3AF", bg: "#F3F4F6" },
];

interface Property {
  id: string;
  title: string;
  type: string;
  listingType?: string;
  price: number;
  city: string;
  state: string;
  neighborhood?: string;
  address?: string;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpots?: number;
  areaM2?: number;
  description?: string;
  photos?: string[];
  isPublic?: boolean;
  status?: string;
}

function formatPrice(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InfoChip({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color="#0066FF" />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    propertiesApi.getById(id).then(({ data }) => {
      setProperty(data);
    }).catch(() => {
      Alert.alert("Erro", "Não foi possível carregar o imóvel.");
      router.back();
    }).finally(() => setLoading(false));
  }, [id]);

  function handleStatusChange() {
    const options = STATUS_OPTS.map((opt) => ({
      text: opt.label + (property?.status === opt.value ? " ✓" : ""),
      onPress: async () => {
        if (property?.status === opt.value) return;
        setUpdatingStatus(true);
        try {
          await propertiesApi.update(id, { status: opt.value });
          setProperty((p) => p ? { ...p, status: opt.value } : p);
        } catch {
          Alert.alert("Erro", "Não foi possível atualizar o status.");
        } finally {
          setUpdatingStatus(false);
        }
      },
    }));
    Alert.alert("Alterar Status", "Selecione o novo status do imóvel:", [
      ...options,
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  function confirmDelete() {
    Alert.alert("Remover imóvel", "Tem certeza? Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive",
        onPress: async () => {
          try {
            await propertiesApi.delete(id);
            router.back();
          } catch {
            Alert.alert("Erro", "Não foi possível remover o imóvel.");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (!property) return null;

  const photos = property.photos ?? [];
  const badge = property.listingType === "RENT" ? "Aluguel" : "Venda";

  return (
    <View style={styles.container}>
      {/* Header flutuante */}
      <View style={styles.floatHeader}>
        <TouchableOpacity style={styles.floatBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatBtn} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Galeria de fotos */}
        {photos.length > 0 ? (
          <View>
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
            >
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
            {photos.length > 1 && (
              <View style={styles.dots}>
                {photos.map((_, i) => (
                  <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="business-outline" size={56} color="#D1D5DB" />
          </View>
        )}

        <View style={styles.content}>
          {/* Badge + título */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
            {property.isPublic && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={[styles.badgeText, { color: "#10B981" }]}>Público</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>

          {/* Status do imóvel */}
          {(() => {
            const s = STATUS_OPTS.find((o) => o.value === (property.status ?? "AVAILABLE")) ?? STATUS_OPTS[0];
            return (
              <TouchableOpacity
                style={[styles.statusBtn, { backgroundColor: s.bg, borderColor: s.color + "40" }]}
                onPress={handleStatusChange}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color={s.color} />
                ) : (
                  <>
                    <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                    <Text style={[styles.statusBtnText, { color: s.color }]}>{s.label}</Text>
                    <Ionicons name="chevron-down" size={14} color={s.color} />
                  </>
                )}
              </TouchableOpacity>
            );
          })()}

          {/* Localização */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color="#6B7280" />
            <Text style={styles.location}>
              {[property.neighborhood, property.city, property.state]
                .filter(Boolean).join(", ")}
            </Text>
          </View>
          {property.address && (
            <Text style={styles.address}>{property.address}</Text>
          )}

          {/* Características */}
          {(property.bedrooms || property.bathrooms || property.suites ||
            property.parkingSpots || property.areaM2) && (
            <View style={styles.chips}>
              {!!property.areaM2 && (
                <InfoChip icon="resize-outline" label={`${property.areaM2} m²`} />
              )}
              {!!property.bedrooms && (
                <InfoChip icon="bed-outline" label={`${property.bedrooms} quartos`} />
              )}
              {!!property.suites && (
                <InfoChip icon="bed-outline" label={`${property.suites} suítes`} />
              )}
              {!!property.bathrooms && (
                <InfoChip icon="water-outline" label={`${property.bathrooms} banheiros`} />
              )}
              {!!property.parkingSpots && (
                <InfoChip icon="car-outline" label={`${property.parkingSpots} vagas`} />
              )}
            </View>
          )}

          {/* Descrição */}
          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Publicar como Oportunidade */}
          <TouchableOpacity
            style={styles.oppBtn}
            onPress={() =>
              router.push({
                pathname: "/nova-oportunidade",
                params: {
                  propertyId: property.id,
                  title: property.title,
                  priceNormal: String(property.price),
                  city: property.city,
                  propertyType: property.type,
                },
              } as any)
            }
          >
            <Ionicons name="pricetag-outline" size={20} color="#fff" />
            <Text style={styles.oppBtnText}>Publicar como Oportunidade</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  floatHeader: {
    position: "absolute", top: 52, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16,
  },
  floatBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  photo: { width, height: 280, resizeMode: "cover" },
  photoPlaceholder: {
    width: "100%", height: 220,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  dots: {
    flexDirection: "row", justifyContent: "center", gap: 6,
    position: "absolute", bottom: 12, left: 0, right: 0,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff", width: 18 },
  content: { padding: 20, gap: 10 },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: {
    backgroundColor: "#EFF6FF", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  badgeGreen: { backgroundColor: "#ECFDF5" },
  badgeText: { color: "#0066FF", fontSize: 12, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "800", color: "#111827", lineHeight: 26 },
  price: { fontSize: 22, fontWeight: "800", color: "#0066FF" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 14, color: "#6B7280", flex: 1 },
  address: { fontSize: 13, color: "#9CA3AF" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#EFF6FF", paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 20,
  },
  chipText: { fontSize: 13, color: "#0066FF", fontWeight: "600" },
  section: { marginTop: 8, gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  description: { fontSize: 14, color: "#6B7280", lineHeight: 22 },
  statusBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBtnText: { fontSize: 13, fontWeight: "700" },
  oppBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#DC2626", borderRadius: 14, paddingVertical: 14,
    marginTop: 8,
  },
  oppBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
