import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image, Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { propertiesApi, uploadApi } from "@/services/api";
import { StateCityPicker } from "@/components/StateCityPicker";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const TYPES = [
  { value: "APARTMENT",   label: "Apartamento" },
  { value: "HOUSE",       label: "Casa"         },
  { value: "CONDO_HOUSE", label: "Casa Cond."   },
  { value: "LAND",        label: "Terreno"      },
  { value: "COMMERCIAL",  label: "Comercial"    },
  { value: "RURAL",       label: "Rural"        },
];

const LISTING = [
  { value: "SALE", label: "Venda" },
  { value: "RENT", label: "Aluguel" },
];

// ─── Componentes auxiliares ───────────────────────────────────────────────────

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

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function NovoImovel() {
  // Campos obrigatórios
  const [title, setTitle]       = useState("");
  const [type, setType]         = useState("APARTMENT");
  const [listing, setListing]   = useState("SALE");
  const [price, setPrice]       = useState("");
  const [city, setCity]         = useState("");
  const [state, setState]       = useState("");

  // Campos opcionais
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress]           = useState("");
  const [bedrooms, setBedrooms]         = useState("");
  const [bathrooms, setBathrooms]       = useState("");
  const [suites, setSuites]             = useState("");
  const [parking, setParking]           = useState("");
  const [area, setArea]                 = useState("");
  const [description, setDescription]  = useState("");

  // Fotos
  const [photos, setPhotos]     = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);

  // ── Selecionar fotos ──────────────────────────────────────────────────────
  async function pickPhotos() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Permita o acesso à galeria nas configurações.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 10));
    }
  }

  function removePhoto(uri: string) {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!title.trim() || !price || !city.trim() || !state.trim()) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios: título, preço, cidade e estado.");
      return;
    }
    const priceNum = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Atenção", "Informe um preço válido.");
      return;
    }

    setSaving(true);
    try {
      // 1. Upload das fotos locais (file://, content://, ou caminho sem http)
      let photoUrls: string[] = [];
      const localPhotos = photos.filter((p) => !p.startsWith("http"));
      if (localPhotos.length > 0) {
        setUploading(true);
        photoUrls = await uploadApi.images(localPhotos);
        setUploading(false);
      }

      // 2. Criar imóvel
      await propertiesApi.create({
        title:        title.trim(),
        type,
        listingType:  listing,
        price:        priceNum,
        city:         city.trim(),
        state:        state.trim().toUpperCase(),
        neighborhood: neighborhood.trim() || undefined,
        address:      address.trim() || undefined,
        bedrooms:     bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms:    bathrooms ? parseInt(bathrooms) : undefined,
        suites:       suites ? parseInt(suites) : undefined,
        parkingSpots: parking ? parseInt(parking) : undefined,
        areaM2:       area ? parseFloat(area) : undefined,
        description:  description.trim() || undefined,
        photos:       photoUrls.length > 0 ? photoUrls : undefined,
      });

      Alert.alert("Sucesso", "Imóvel cadastrado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.log("ERRO IMOVEL:", JSON.stringify(err?.response?.data ?? err?.message ?? err));
      const msg = err?.response?.data?.message ?? err?.message ?? "Não foi possível cadastrar o imóvel.";
      Alert.alert("Erro", Array.isArray(msg) ? msg.join("\n") : String(msg));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Imóvel</Text>
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

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* ── Fotos ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
            {photos.map((uri) => (
              <View key={uri} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(uri)}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 10 && (
              <TouchableOpacity style={styles.photoAdd} onPress={pickPhotos}>
                <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                <Text style={styles.photoAddText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          {uploading && (
            <View style={styles.uploadingRow}>
              <ActivityIndicator size="small" color="#0066FF" />
              <Text style={styles.uploadingText}>Enviando fotos...</Text>
            </View>
          )}
        </View>

        {/* ── Informações básicas ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações básicas</Text>

          <Field label="Título" value={title} onChangeText={setTitle}
            placeholder="Ex: Apartamento 3 quartos - Vila Madalena" required />

          <Chips label="Tipo" options={TYPES} value={type as any} onChange={setType as any} />
          <Chips label="Negociação" options={LISTING} value={listing as any} onChange={setListing as any} />

          <Field label="Preço (R$)" value={price} onChangeText={setPrice}
            placeholder="Ex: 450000" keyboardType="numeric" required />
        </View>

        {/* ── Localização ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.fieldGroup}>
            <StateCityPicker
              stateValue={state}
              cityValue={city}
              onStateChange={setState}
              onCityChange={setCity}
            />
          </View>
          <Field label="Bairro" value={neighborhood} onChangeText={setNeighborhood}
            placeholder="Ex: Vila Madalena" />
          <Field label="Endereço" value={address} onChangeText={setAddress}
            placeholder="Ex: Rua das Flores, 123" />
        </View>

        {/* ── Características ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Quartos" value={bedrooms} onChangeText={setBedrooms}
                keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Field label="Suítes" value={suites} onChangeText={setSuites}
                keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Field label="Banheiros" value={bathrooms} onChangeText={setBathrooms}
                keyboardType="numeric" placeholder="0" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Vagas" value={parking} onChangeText={setParking}
                keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Field label="Área (m²)" value={area} onChangeText={setArea}
                keyboardType="numeric" placeholder="0" />
            </View>
          </View>
        </View>

        {/* ── Descrição ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Field label="Descrição" value={description} onChangeText={setDescription}
            placeholder="Descreva os detalhes do imóvel..." multiline />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  saveBtn: {
    backgroundColor: "#0066FF", paddingHorizontal: 18,
    paddingVertical: 8, borderRadius: 10, minWidth: 70, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  form: { padding: 20, gap: 16 },
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
  row: { flexDirection: "row" },
  chipsScroll: { marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#F3F4F6", marginRight: 8, borderWidth: 1.5, borderColor: "#F3F4F6",
  },
  chipActive: { backgroundColor: "#EFF6FF", borderColor: "#0066FF" },
  chipText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  chipTextActive: { color: "#0066FF" },
  photosRow: { marginTop: 4 },
  photoThumb: { position: "relative", marginRight: 10 },
  photoImg: { width: 90, height: 90, borderRadius: 10 },
  photoRemove: { position: "absolute", top: -6, right: -6 },
  photoAdd: {
    width: 90, height: 90, borderRadius: 10, borderWidth: 1.5,
    borderColor: "#E5E7EB", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  photoAddText: { fontSize: 11, color: "#9CA3AF" },
  uploadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  uploadingText: { fontSize: 13, color: "#6B7280" },
});
