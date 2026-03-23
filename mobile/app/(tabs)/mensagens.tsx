import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { messagesApi } from "@/services/api";

interface Conversation {
  partner: { id: string; name: string; avatarUrl?: string };
  lastMessage: { id: string; content: string; createdAt: string; senderId: string };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function ConversationItem({
  item,
  onPress,
}: {
  item: Conversation;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.convItem} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.partner?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </Text>
      </View>
      <View style={styles.convInfo}>
        <Text style={styles.convName}>{item.partner?.name ?? "Corretor"}</Text>
        <Text style={styles.convLast} numberOfLines={1}>
          {item.lastMessage?.content ?? ""}
        </Text>
      </View>
      <View style={styles.convRight}>
        <Text style={styles.convTime}>{item.lastMessage?.createdAt ? timeAgo(item.lastMessage.createdAt) : ""}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function Mensagens() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await messagesApi.conversations();
      setConversations(data);
      if (data[0]) setMyId(data[0]?.myId ?? null);
    } catch {
      // silencia
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  async function openConversation(conv: Conversation) {
    setActiveConv(conv);
    setMsgLoading(true);
    try {
      const { data } = await messagesApi.getConversation(conv.partner.id);
      setMessages(data.messages ?? data);
    } catch {
      // silencia
    } finally {
      setMsgLoading(false);
    }
  }

  async function sendMessage() {
    if (!text.trim() || !activeConv) return;
    const content = text.trim();
    setText("");
    try {
      const { data } = await messagesApi.send(activeConv.partner.id, content);
      setMessages((prev) => [...prev, data]);
    } catch {
      // silencia
    }
  }

  // Tela de conversa
  if (activeConv) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveConv(null)} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {activeConv.partner?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={styles.chatTitle}>{activeConv.partner?.name ?? "Corretor"}</Text>
        </View>

        {/* Mensagens */}
        {msgLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#0066FF" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.msgList}
            renderItem={({ item }) => {
              const isMe = item.senderId === myId;
              return (
                <View
                  style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
                >
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.bubbleTime, isMe && { color: "#93C5FD" }]}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.msgInput}
            placeholder="Mensagem..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Lista de conversas
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.partner.id}
          renderItem={({ item }) => (
            <ConversationItem item={item} onPress={() => openConversation(item)} />
          )}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadConversations} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 20,
    backgroundColor: "#0F2957",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#0066FF" },
  convInfo: { flex: 1 },
  convName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  convLast: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  convRight: { alignItems: "flex-end", gap: 4 },
  convTime: { fontSize: 11, color: "#9CA3AF" },
  unreadBadge: {
    backgroundColor: "#0066FF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  chatTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  msgList: { padding: 16, gap: 8, paddingBottom: 20 },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleThem: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: "#0066FF",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: "#111827" },
  bubbleTextMe: { color: "#fff" },
  bubbleTime: { fontSize: 10, color: "#9CA3AF", alignSelf: "flex-end" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  msgInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
});
