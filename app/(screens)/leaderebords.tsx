import { useRouter } from "expo-router";
import { Activity, Star, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Button, Text, View, YGroup, YStack, ScrollView, Spinner, XStack } from "tamagui";
import { getLeaderboard } from "@/lib/api";

export default function leaderebords() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const results = await getLeaderboard();
                setData(results);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);
    const topPosStyles = [{ borderColor: "#D4AF37" }, { borderColor: "#C0C0C0" }, { borderColor: "#CD7F32" }];
    const pingColor = (latency: number) => {
        if (latency < 500) return "#00FF00";
        if (latency < 1000) return "#FFA500";
        return "#FF0000";
    };
    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, marginTop: 40 }}>
                <YStack>
                    <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>Leaderboards</Text>
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Global Network Performance</Text>
                </YStack>
                <Button variant="outlined" size="$4" onPress={() => router.back()} style={{ borderRadius: 20, borderColor: "#333" }}>
                    <X color={"white"} size={20} />
                </Button>
            </View>

            <ScrollView style={{ flex: 1, padding: 20, marginBottom: 10 }}>
                {loading ? (
                    <YStack style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 }}>
                        <Spinner size="large" color="$green10" />
                        <Text style={{ color: "#888", marginTop: 10 }}>Loading stats...</Text>
                    </YStack>
                ) : (
                    <YGroup style={{ backgroundColor: "transparent", gap: 10 }}>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <YGroup.Item key={item.url}>
                                    <View
                                        style={{
                                            backgroundColor: "#111",
                                            borderRadius: 16,
                                            padding: 16,
                                            borderWidth: 1,
                                            ...topPosStyles[index],
                                            backgroundBlendMode: "color-burn",
                                            // borderColor: index === 0 ? "#00FF00" : "#222"
                                        }}
                                    >
                                        <XStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <YStack style={{ flex: 1, gap: 4 }}>
                                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }} numberOfLines={1}>
                                                    {index + 1}. {item.url}
                                                </Text>
                                                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{item.totalPings} exploration sessions</Text>
                                            </YStack>
                                            <YStack style={{ alignItems: "flex-end", gap: 4 }}>
                                                <Text style={{ color: pingColor(item.avgLatency), fontWeight: "900", fontSize: 18 }}>{Math.round(item.avgLatency)}ms</Text>
                                                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{Math.round(item.avgYield)}% YIELD</Text>
                                            </YStack>
                                        </XStack>
                                    </View>
                                </YGroup.Item>
                            ))
                        ) : (
                            <YStack style={{ alignItems: "center", marginTop: 60, gap: 10 }}>
                                <Text style={{ color: "#888" }}>No records found yet</Text>
                                <Button theme="dark_green" onPress={() => router.back()}>
                                    Run first eXploration
                                </Button>
                            </YStack>
                        )}
                    </YGroup>
                )}
            </ScrollView>
        </View>
    );
}
