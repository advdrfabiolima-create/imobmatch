import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#0066FF" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.iconBox}>
          <Ionicons name="globe-outline" size={48} color="#0066FF" />
        </View>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.desc}>
          O cadastro de novos corretores é feito exclusivamente pelo site oficial.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => Linking.openURL("https://www.useimobmatch.com.br")}
        >
          <Ionicons name="open-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Acessar www.useimobmatch.com.br</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back2}>← Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  back: { paddingTop: 60, paddingHorizontal: 20 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 20, marginTop: -60 },
  logo: { width: 160, height: 56 },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  desc: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0066FF", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, width: "100%" as any, justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  back2: { color: "#0066FF", fontSize: 14, fontWeight: "600" },
});
