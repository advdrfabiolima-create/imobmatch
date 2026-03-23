import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { buyersApi } from "@/services/api";
import { StateCityPicker } from "@/components/StateCityPicker";

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartamento" },
  { value: "HOUSE", label: "Casa" },
  { value: "CONDO_HOUSE", label: "Cond. Fechado" },
  { value: "LAND", label: "Terreno" },
  { value: "COMMERCIAL", label: "Comercial" },
  { value: "RURAL", label: "Rural" },
];

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipGroup}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.chip, value === o.value && styles.chipActive]}
          onPress={() => onChange(o.value)}
        >
          <Text
            style={[styles.chipText, value === o.value && styles.chipTextActive]}
          >
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

export default function NovoComprador() {
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [desiredCity, setDesiredCity] = useState("");
  const [desiredState, setDesiredState] = useState("");
  const [desiredNeighborhood, setDesiredNeighborhood] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [bedrooms, setBedrooms] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!buyerName.trim()) {
      Alert.alert("Atenção", "Informe o nome do comprador.");
      return;
    }
    if (!desiredCity.trim()) {
      Alert.alert("Atenção", "Informe a cidade desejada.");
      return;
    }
    if (!maxPrice) {
      Alert.alert("Atenção", "Informe o orçamento máximo.");
      return;
    }
    if (!propertyType) {
      Alert.alert("Atenção", "Selecione o tipo de imóvel.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        buyerName: buyerName.trim(),
        desiredCity: desiredCity.trim(),
        maxPrice: parseFloat(maxPrice.replace(/\./g, "").replace(",", ".")),
        propertyType,
      };

      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();
      if (desiredState.trim()) payload.desiredState = desiredState.trim();
      if (desiredNeighborhood.trim())
        payload.desiredNeighborhood = desiredNeighborhood.trim();
      if (minPrice)
        payload.minPrice = parseFloat(
          minPrice.replace(/\./g, "").replace(",", ".")
        );
      if (bedrooms) payload.bedrooms = parseInt(bedrooms, 10);
      if (notes.trim()) payload.notes = notes.trim();

      await buyersApi.create(payload);
      router.back();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Não foi possível cadastrar o comprador.";
      Alert.alert("Erro", Array.isArray(msg) ? msg.join("\n") : msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Comprador</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dados pessoais */}
        <Text style={styles.sectionTitle}>Dados do Comprador</Text>

        <Field label="Nome" required>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={buyerName}
            onChangeText={setBuyerName}
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="E-mail">
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Telefone">
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-9999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </Field>
          </View>
        </View>

        {/* Preferências */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
          Preferências de Busca
        </Text>

        <Field label="Tipo de Imóvel" required>
          <ChipGroup
            options={PROPERTY_TYPES}
            value={propertyType}
            onChange={setPropertyType}
          />
        </Field>

        <StateCityPicker
          stateValue={desiredState}
          cityValue={desiredCity}
          onStateChange={setDesiredState}
          onCityChange={setDesiredCity}
        />

        <Field label="Bairro">
          <TextInput
            style={styles.input}
            placeholder="Bairro preferido (opcional)"
            value={desiredNeighborhood}
            onChangeText={setDesiredNeighborhood}
          />
        </Field>

        <Field label="Quartos">
          <TextInput
            style={styles.input}
            placeholder="Nº de quartos desejado"
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="numeric"
          />
        </Field>

        {/* Orçamento */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Orçamento</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Mínimo (R$)">
              <TextInput
                style={styles.input}
                placeholder="0,00"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Máximo (R$)" required>
              <TextInput
                style={styles.input}
                placeholder="Ex: 500000"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </Field>
          </View>
        </View>

        {/* Observações */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Observações</Text>

        <Field label="Notas">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Preferências adicionais, urgência, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  saveBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  scroll: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, gap: 12, paddingBottom: 60 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#374151" },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151" },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  textArea: { height: 90, paddingTop: 12 },
  row: { flexDirection: "row", gap: 10 },
  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  chipText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  chipTextActive: { color: "#10B981" },
});
