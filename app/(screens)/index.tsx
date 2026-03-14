import { Image } from "expo-image";
import { Keyboard, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { View, Input, Button, Text, ScrollView, Switch, YStack, XStack, Collapsible, Spinner } from "tamagui";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart2, Activity, Globe } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { runPing } from "@/lib/api";

const schema = z.object({
    url: z.url("Please enter a valid URL"),
    public: z.boolean().optional(),
});

const isLocalIpAddress = (u: string) => {
    try {
        const hostname = new URL(u).hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") return true;
        const parts = hostname.split(".");
        if (parts.length === 4 && parts.every((p) => !isNaN(parseInt(p)))) {
            if (parts[0] === "10") return true;
            if (parts[0] === "172") {
                const p2 = parseInt(parts[1], 10);
                if (p2 >= 16 && p2 <= 31) return true;
            }
            if (parts[0] === "192" && parts[1] === "168") return true;
            if (parts[0] === "169" && parts[1] === "254") return true;
        }
        if (hostname.endsWith(".local")) return true;
        return false;
    } catch {
        return false;
    }
};

export default function HomeScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ local?: any; server?: any } | null>(null);

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            url: "https://",
            public: false,
        },
    });

    const currentUrl = watch("url");
    const isLocal = isLocalIpAddress(currentUrl || "");

    useEffect(() => {
        if (isLocal) {
            setValue("public", false);
        }
    }, [isLocal, setValue]);

    const performLocalPing = async (url: string) => {
        const start = Date.now();
        let yieldValue = 100;
        let latency = 0;
        try {
            const controller = new AbortController();
            // const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(url, {
                method: "GET",
                signal: controller.signal,
            });
            // clearTimeout(timeoutId);
            const end = Date.now();
            latency = end - start;
            if (!response.ok) {
                yieldValue = Math.max(0, 100 - (response.status >= 500 ? 50 : 20));
            }
        } catch (error) {
            console.error("Local fetch error:", error);
            latency = 5000;
            yieldValue = 0;
        }
        return { url, latency, yield: yieldValue };
    };

    const onSubmit = async (data: z.infer<typeof schema>) => {
        Keyboard.dismiss();
        setLoading(true);
        setResult({}); // Reset to empty object to receive partial updates

        try {
            const localPingTask = performLocalPing(data.url).then((res) => {
                setResult((prev) => ({ ...prev, local: res }));
            });

            if (data.public) {
                const serverPingTask = runPing(data.url)
                    .then((res) => {
                        setResult((prev) => ({ ...prev, server: res.data }));
                    })
                    .catch((err) => {
                        console.error("Server ping failed:", err);
                    });

                await Promise.all([localPingTask, serverPingTask]);
            } else {
                await localPingTask;
            }
        } catch (error) {
            console.error(error);
            alert("Failed to explore URL. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            <YStack style={{ width: "100%", flex: 1, padding: 20 }}>
                <XStack style={{ justifyContent: "flex-end", marginTop: 40 }}>
                    <XStack style={{ gap: 8, alignItems: "center" }}>
                        <Controller
                            control={control}
                            name="public"
                            render={({ field }) => (
                                <XStack style={{ alignItems: "center", gap: 8 }}>
                                    <Text style={{ color: isLocal ? "#555" : field.value ? "#00FF00" : "#888", fontSize: 13, fontWeight: "bold" }}>
                                        {field.value ? "PUBLIC PING" : isLocal ? "LOCAL ONLY" : "PRIVATE PING"}
                                    </Text>
                                    <Switch size="$3" theme="dark_green" checked={field.value} onCheckedChange={field.onChange} disabled={isLocal}>
                                        <Switch.Thumb />
                                    </Switch>
                                </XStack>
                            )}
                        />
                    </XStack>
                </XStack>

                <YStack style={{ flex: 1, justifyContent: "center", gap: 20 }}>
                    <YStack style={{ gap: 8, alignSelf: "center", width: "90%" }}>
                        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>Lynx Explorer</Text>
                        <Text style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 20 }}>Analyze network latency and yield in real-time</Text>

                        <YStack style={{ gap: 12 }}>
                            <Controller
                                control={control}
                                name="url"
                                render={({ field }) => (
                                    <Input
                                        size="$5"
                                        placeholder="https://example.com"
                                        value={field.value}
                                        onChangeText={field.onChange}
                                        autoCapitalize="none"
                                        bg="$gray3"
                                        color="white"
                                        style={{ borderWidth: 1, borderColor: errors.url ? "red" : "#333" }}
                                    />
                                )}
                            />
                            {errors.url && <Text style={{ color: "red", fontSize: 12 }}>{errors.url.message}</Text>}

                            <Button theme="dark_green" size="$5" onPress={handleSubmit(onSubmit)} disabled={loading} opacity={loading ? 0.5 : 1}>
                                <XStack style={{ alignItems: "center", gap: 8 }}>
                                    {loading && <Spinner color={"white"} />}
                                    <Text style={{ fontWeight: "bold", color: "white" }}>{loading ? "Exploring" : "Run eXploration"}</Text>
                                </XStack>
                            </Button>
                        </YStack>

                        {result && (
                            <YStack style={{ gap: 16, marginTop: 30 }}>
                                <XStack style={{ gap: 8, alignItems: "center", backgroundColor: "#111", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#222" }}>
                                    <Globe size={16} color="#888" />
                                    <Text style={{ color: "white", fontSize: 14, flex: 1, fontWeight: "500" }} numberOfLines={1}>
                                        {result.local?.url || result.server?.url}
                                    </Text>
                                </XStack>

                                <XStack style={{ gap: 12 }}>
                                    {result.local && (
                                        <YStack style={{ flex: 1, backgroundColor: "#111", padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: "#222" }}>
                                            <Text style={{ color: "#00FF00", fontSize: 10, fontWeight: "900", letterSpacing: 1 }}>YOUR DEVICE</Text>
                                            <YStack>
                                                <XStack style={{ alignItems: "center", gap: 4 }}>
                                                    <Activity size={14} color="#00FF00" />
                                                    <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>{result.local.latency}ms</Text>
                                                </XStack>
                                                <Text style={{ color: "#888", fontSize: 10 }}>LATENCY</Text>
                                            </YStack>
                                            <YStack>
                                                <Text style={{ color: "#00FF00", fontSize: 20, fontWeight: "900" }}>{result.local.yield}%</Text>
                                                <Text style={{ color: "#888", fontSize: 10 }}>YIELD</Text>
                                            </YStack>
                                        </YStack>
                                    )}

                                    {result.server && (
                                        <YStack style={{ flex: 1, backgroundColor: "#111", padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: "#222" }}>
                                            <Text style={{ color: "#BD00FF", fontSize: 10, fontWeight: "900", letterSpacing: 1 }}>LYNX SERVER</Text>
                                            <YStack>
                                                <XStack style={{ alignItems: "center", gap: 4 }}>
                                                    <Activity size={14} color="#BD00FF" />
                                                    <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>{result.server.latency}ms</Text>
                                                </XStack>
                                                <Text style={{ color: "#888", fontSize: 10 }}>LATENCY</Text>
                                            </YStack>
                                            <YStack>
                                                <Text style={{ color: "#BD00FF", fontSize: 20, fontWeight: "900" }}>{result.server.yield}%</Text>
                                                <Text style={{ color: "#888", fontSize: 10 }}>YIELD</Text>
                                            </YStack>
                                        </YStack>
                                    )}
                                </XStack>
                            </YStack>
                        )}
                    </YStack>
                </YStack>
            </YStack>

            <Button theme="dark_green" onPress={() => router.push("/leaderebords")} style={{ position: "absolute", bottom: 40, right: 20, borderRadius: 30, width: 60, height: 60 }} size="$5" circular>
                <BarChart2 size={24} color="white" />
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
});
