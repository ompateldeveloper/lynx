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
                            data.map((item, index) => {
                                const isTopThree = index < 3;
                                const colors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Gold, Silver, Bronze
                                const itemBorderColor = isTopThree ? colors[index] : "#222";

                                return (
                                    <YGroup.Item key={item.url}>
                                        <View
                                            style={{
                                                backgroundColor: "#0A0A0A",
                                                borderRadius: 20,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: itemBorderColor,
                                                shadowColor: isTopThree ? itemBorderColor : "transparent",
                                                shadowOpacity: 0.2,
                                                shadowRadius: 10,
                                                elevation: 5,
                                            }}
                                        >
                                            <XStack style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                                <XStack style={{ flex: 1, gap: 12, alignItems: "center" }}>
                                                    <View
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 16,
                                                            backgroundColor: isTopThree ? `${itemBorderColor}22` : "#1A1A1A",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            borderWidth: 1,
                                                            borderColor: isTopThree ? itemBorderColor : "#333",
                                                        }}
                                                    >
                                                        {isTopThree ? (
                                                            <Star size={16} fill={itemBorderColor} color={itemBorderColor} />
                                                        ) : (
                                                            <Text style={{ color: "#888", fontWeight: "bold", fontSize: 12 }}>{index + 1}</Text>
                                                        )}
                                                    </View>

                                                    <YStack style={{ flex: 1, gap: 2 }}>
                                                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }} numberOfLines={1}>
                                                            {item.url}
                                                        </Text>
                                                        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "500" }}>{item.totalPings} REQUESTS</Text>
                                                    </YStack>
                                                </XStack>

                                                <YStack style={{ alignItems: "flex-end", gap: 2 }}>
                                                    <XStack style={{ alignItems: "center", gap: 4 }}>
                                                        <Activity size={12} color={pingColor(item.avgLatency)} />
                                                        <Text style={{ color: pingColor(item.avgLatency), fontWeight: "900", fontSize: 18 }}>{Math.round(item.avgLatency)}ms</Text>
                                                    </XStack>
                                                    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "bold" }}>{Math.round(item.avgYield)}% YIELD</Text>
                                                </YStack>
                                            </XStack>
                                        </View>
                                    </YGroup.Item>
                                );
                            })
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
