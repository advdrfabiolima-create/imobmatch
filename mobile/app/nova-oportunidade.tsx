import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Switch,
} from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { oportunidadesApi } from "@/services/api";

const TYPES = [
  { value: "APARTMENT",   label: "Apartamento" },
  { value: "HOUSE",       label: "Casa"         },
  { value: "CONDO_HOUSE", label: "Casa Cond."   },
  { value: "LAND",        label: "Terreno"      },
  { value: "COMMERCIAL",  label: "Comercial"    },
  { value: "RURAL",       label: "Rural"        },
];

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}{required && <Text style={styles.req}> *</Text>}
    </Text>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline, required,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean; required?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Label text={label} required={required} />
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ""}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function Chips<T extends string>({
  label, options, value, onChange,
}: {
  label: string; options: { value: T; label: string }[];
  value: T; onChange: (v: T) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Label text={label} required />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, value === opt.value && styles.chipActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function NovaOportunidade() {
  const params = useLocalSearchParams<{
    propertyId?: string;
    title?: string;
    priceNormal?: string;
    city?: string;
    propertyType?: string;
  }>();

  const [title, setTitle]           = useState(params.title ?? "");
  const [type, setType]             = useState(params.propertyType ?? "APARTMENT");
  const [priceNormal, setPriceNormal] = useState(params.priceNormal ?? "");
  const [priceUrgent, setPriceUrgent] = useState("");
  const [city, setCity]             = useState(params.city ?? "");
  const [description, setDescription] = useState("");
  const [acceptsOffer, setAcceptsOffer] = useState(false);
  const [saving, setSaving]         = useState(false);

  async function handleSave() {
    if (!title.trim() || !priceNormal || !priceUrgent || !city.trim()) {
      Alert.alert("Atenção", "Preencha: título, preço normal, preço urgente e cidade.");
      return;
    }
    const normal = parseFloat(priceNormal.replace(/[^0-9.]/g, ""));
    const urgent = parseFloat(priceUrgent.replace(/[^0-9.]/g, ""));
    if (isNaN(normal) || normal <= 0 || isNaN(urgent) || urgent <= 0) {
      Alert.alert("Atenção", "Informe preços válidos.");
      return;
    }

    setSaving(true);
    try {
      await oportunidadesApi.create({
        title:        title.trim(),
        propertyType: type,
        priceNormal:  normal,
        priceUrgent:  urgent,
        city:         city.trim(),
        description:  description.trim() || undefined,
        acceptsOffer,
        propertyId:   params.propertyId ?? undefined,
      });
      Alert.alert("Sucesso", "Oportunidade publicada!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Não foi possível publicar.";
      Alert.alert("Erro", Array.isArray(msg) ? msg.join("\n") : String(msg));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Oportunidade</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {params.propertyId && (
          <View style={styles.linkedBanner}>
            <Ionicons name="link-outline" size={16} color="#059669" />
            <Text style={styles.linkedText}>Vinculado ao imóvel selecionado</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <Field label="Título" value={title} onChangeText={setTitle}
            placeholder="Ex: Apartamento 3q - Venda urgente, abaixo do mercado" required />

          <Chips label="Tipo de imóvel" options={TYPES} value={type as any} onChange={setType as any} />

          <Field label="Cidade" value={city} onChangeText={setCity}
            placeholder="Ex: São Paulo" required />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preços</Text>

          <Field label="Preço normal (R$)" value={priceNormal} onChangeText={setPriceNormal}
            placeholder="Ex: 500000" keyboardType="numeric" required />

          <View style={styles.urgentHint}>
            <Ionicons name="flash" size={14} color="#DC2626" />
            <Text style={styles.urgentHintText}>
              Preço urgente é o valor reduzido para venda rápida
            </Text>
          </View>

          <Field label="Preço urgente (R$)" value={priceUrgent} onChangeText={setPriceUrgent}
            placeholder="Ex: 430000" keyboardType="numeric" required />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>

          <Field label="Descrição" value={description} onChangeText={setDescription}
            placeholder="Descreva o motivo da urgência, estado do imóvel..." multiline />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Aceita oferta / proposta</Text>
              <Text style={styles.switchSub}>Permite que outros corretores façam propostas</Text>
            </View>
            <Switch
              value={acceptsOffer}
              onValueChange={setAcceptsOffer}
              trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
              thumbColor={acceptsOffer ? "#059669" : "#9CA3AF"}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  saveBtn: {
    backgroundColor: "#DC2626", paddingHorizontal: 18,
    paddingVertical: 8, borderRadius: 10, minWidth: 80, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  form: { padding: 20, gap: 16 },
  linkedBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#ECFDF5", borderRadius: 10, padding: 12,
  },
  linkedText: { fontSize: 13, color: "#059669", fontWeight: "600" },
  section: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, gap: 4,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 8 },
  fieldGroup: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 5 },
  req: { color: "#EF4444" },
  input: {
    height: 48, borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10,
    paddingHorizontal: 14, fontSize: 14, color: "#111827", backgroundColor: "#fff",
  },
  inputMulti: { height: 100, paddingTop: 12 },
  chipsScroll: { marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#F3F4F6", marginRight: 8, borderWidth: 1.5, borderColor: "#F3F4F6",
  },
  chipActive: { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
  chipText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  chipTextActive: { color: "#DC2626" },
  urgentHint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 8, padding: 10, marginTop: 10,
  },
  urgentHintText: { fontSize: 12, color: "#DC2626", flex: 1 },
  switchRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  switchLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  switchSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
});
