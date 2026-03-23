import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

async function fetchCities(uf: string): Promise<string[]> {
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  );
  const data = await res.json();
  return data.map((m: { nome: string }) => m.nome);
}

// ── Picker genérico (modal com busca) ────────────────────────────────────────
function PickerModal({
  visible,
  title,
  items,
  loading,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: string[];
  loading?: boolean;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? items.filter((i) => i.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={s.search}
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color="#0066FF" />
              <Text style={s.loadingText}>Carregando cidades...</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.item}
                  onPress={() => {
                    onSelect(item);
                    setSearch("");
                    onClose();
                  }}
                >
                  <Text style={s.itemText}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={s.sep} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Botão de seleção ─────────────────────────────────────────────────────────
function SelectButton({
  value,
  placeholder,
  disabled,
  onPress,
}: {
  value: string;
  placeholder: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.btn, disabled && s.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[s.btnText, !value && s.btnPlaceholder]}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function StateCityPicker({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
}: {
  stateValue: string;
  cityValue: string;
  onStateChange: (v: string) => void;
  onCityChange: (v: string) => void;
}) {
  const [showState, setShowState] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!stateValue) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    setCities([]);
    fetchCities(stateValue)
      .then(setCities)
      .finally(() => setLoadingCities(false));
  }, [stateValue]);

  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.label}>Estado <Text style={s.req}>*</Text></Text>
        <SelectButton
          value={stateValue}
          placeholder="Selecione"
          onPress={() => setShowState(true)}
        />
      </View>
      <View style={{ flex: 2 }}>
        <Text style={s.label}>Cidade <Text style={s.req}>*</Text></Text>
        <SelectButton
          value={cityValue}
          placeholder={stateValue ? "Selecione" : "Selecione o estado"}
          disabled={!stateValue || loadingCities}
          onPress={() => setShowCity(true)}
        />
        {loadingCities && (
          <ActivityIndicator size="small" color="#0066FF" style={{ marginTop: 4 }} />
        )}
      </View>

      <PickerModal
        visible={showState}
        title="Selecione o Estado"
        items={STATES}
        onSelect={(v) => {
          onStateChange(v);
          onCityChange("");
        }}
        onClose={() => setShowState(false)}
      />
      <PickerModal
        visible={showCity}
        title="Selecione a Cidade"
        items={cities}
        loading={loadingCities}
        onSelect={onCityChange}
        onClose={() => setShowCity(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 5 },
  req: { color: "#EF4444" },
  btn: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnDisabled: { backgroundColor: "#F9FAFB", opacity: 0.7 },
  btnText: { fontSize: 14, color: "#111827", flex: 1 },
  btnPlaceholder: { color: "#9CA3AF" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  search: {
    margin: 12,
    height: 44,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
  },
  item: { paddingHorizontal: 20, paddingVertical: 14 },
  itemText: { fontSize: 15, color: "#111827" },
  sep: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 20 },
  loadingBox: { alignItems: "center", gap: 8, padding: 32 },
  loadingText: { fontSize: 14, color: "#6B7280" },
});
