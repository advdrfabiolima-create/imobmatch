import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: {
  name: string;
  label: string;
  icon: IconName;
  iconFocused: IconName;
}[] = [
  {
    name: "index",
    label: "Início",
    icon: "home-outline",
    iconFocused: "home",
  },
  {
    name: "imoveis",
    label: "Imóveis",
    icon: "business-outline",
    iconFocused: "business",
  },
  {
    name: "compradores",
    label: "Clientes",
    icon: "people-outline",
    iconFocused: "people",
  },
  {
    name: "matches",
    label: "Matches",
    icon: "flash-outline",
    iconFocused: "flash",
  },
  {
    name: "parcerias",
    label: "Parcerias",
    icon: "git-network-outline",
    iconFocused: "git-network",
  },
  {
    name: "mensagens",
    label: "Chat",
    icon: "chatbubbles-outline",
    iconFocused: "chatbubbles",
  },
  {
    name: "perfil",
    label: "Perfil",
    icon: "person-outline",
    iconFocused: "person",
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0066FF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          paddingBottom: 8,
          paddingTop: 6,
          height: 70,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
