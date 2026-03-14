import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v5";
import { Button, Tabs, TabsProvider, Text } from "tamagui";
import { BarChart2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";

const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
    interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    return (
        <TamaguiProvider config={config} defaultTheme={colorScheme === "dark" ? "dark" : "light"}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="leaderebords" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaView>
        </TamaguiProvider>
    );
}
