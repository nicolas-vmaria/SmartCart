import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useRef, useState } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { getDashboard } from "../../lib/api/dashboard";

const ICONS: Record<string, string> = {
  dashboard: "home",
  produtos: "package",
  pedidos: "shopping-cart",
  relatorios: "bar-chart-2",
  mais: "menu",
};

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  produtos: "Produtos",
  pedidos: "Pedidos",
  relatorios: "Relatórios",
  mais: "Mais",
};

const EASE = Easing.out(Easing.cubic);

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const [tabWidth, setTabWidth] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const pillLeft = useSharedValue(0);
  const pillRight = useSharedValue(0);
  const progress = useSharedValue(0);
  const initialized = useRef(false);

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setPendingOrders(data?.pedidos_novos ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tabWidth <= 0) return;

    const targetLeft = state.index * tabWidth;
    const targetRight = (state.index + 1) * tabWidth;

    if (!initialized.current) {
      pillLeft.value = targetLeft;
      pillRight.value = targetRight;
      initialized.current = true;
      return;
    }

    const goingRight = targetLeft > pillLeft.value;

    if (goingRight) {
      // borda direita avança primeiro
      pillRight.value = withTiming(targetRight, { duration: 320, easing: EASE });
      pillLeft.value = withDelay(170, withTiming(targetLeft, { duration: 260, easing: EASE }));
    } else {
      // borda esquerda avança primeiro
      pillLeft.value = withTiming(targetLeft, { duration: 320, easing: EASE });
      pillRight.value = withDelay(170, withTiming(targetRight, { duration: 260, easing: EASE }));
    }

    // afina no meio do trajeto e volta a encher ao chegar
    progress.value = 0;
    progress.value = withTiming(1, { duration: 460, easing: Easing.inOut(Easing.ease) });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    const dip = Math.sin(progress.value * Math.PI); // 0 nas pontas, 1 no meio
    return {
      transform: [
        { translateX: pillLeft.value },
        { scaleY: 1 - dip * 0.42 },
      ],
      width: pillRight.value - pillLeft.value,
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        bottom: 30,
        left: 24,
        right: 24,
        borderRadius: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#18572C",
          borderRadius: 40,
          overflow: "hidden",
          height: 72,
          alignItems: "center",
        }}
        onLayout={(e) =>
          setTabWidth(e.nativeEvent.layout.width / state.routes.length)
        }
      >
        {tabWidth > 0 && (
          <Animated.View
            style={[
              {
                position: "absolute",
                height: "100%",
                backgroundColor: "#E9FF75",
                borderRadius: 40,
              },
              indicatorStyle,
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const color = focused ? "#18572C" : "#ffffff70";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                height: "100%",
                zIndex: 1,
              }}
              activeOpacity={0.8}
            >
              <View>
                <Feather name={ICONS[route.name] as any} size={20} color={color} />
                {route.name === "pedidos" && pendingOrders > 0 && (
                  <View style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    backgroundColor: "#EF4444",
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 3,
                  }}>
                    <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
                      {pendingOrders > 99 ? "99+" : pendingOrders}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color, fontSize: 10, fontWeight: "600" }}>
                {LABELS[route.name]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="produtos" />
      <Tabs.Screen name="pedidos" />
      <Tabs.Screen name="relatorios" />
      <Tabs.Screen name="mais" />
    </Tabs>
  );
}
