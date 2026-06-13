import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="produtos" options={{ title: "Produtos"}} />
        <Tabs.Screen name="pedidos" options={{ title: "Pedidos"}} />
        <Tabs.Screen name="relatorios" options={{ title: "Relatórios"}} />
        <Tabs.Screen name="mais" options={{ title: "Mais"}} />
    </Tabs>
  )
}
