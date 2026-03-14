import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { View, Input, Button, Text, ScrollView, Switch, YStack, XStack, Collapsible } from "tamagui";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart2, Activity, Globe } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { runPing } from "@/lib/api";

const schema = z.object({
    url: z.url("Please enter a valid URL"),
    public: z.boolean().optional()
});

export default function HomeScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            url: "https://",
            public: false,
        },
    });

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setLoading(true);
        setResult(null);
        try {
            const res = await runPing(data.url);
            setResult(res.data);
        } catch (error) {
            console.error(error);
            alert("Failed to ping URL. Make sure the server is running.");
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
                                <Switch size="$3" theme="dark_green" checked={watch("public")} onChange={(e) => field.onChange(e)}>
                                    <Switch.Thumb />
                                </Switch>
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
                            
                            <Button 
                                theme="dark_green" 
                                size="$5"
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                                opacity={loading ? 0.5 : 1}
                            >
                                <Text style={{ fontWeight: "bold", color: "white" }}>{loading ? "Exploring..." : "Run eXploration"}</Text>
                            </Button>
                        </YStack>

                        {result && (
                            <YStack style={{ backgroundColor: "#111", padding: 20, borderRadius: 16, gap: 16, marginTop: 30, borderWidth: 1, borderColor: "#222" }}>
                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Results</Text>
                                <XStack style={{ justifyContent: "space-between" }}>
                                    <YStack style={{ gap: 4 }}>
                                        <Text style={{ color: "#888", fontSize: 11, fontWeight: "600" }}>LATENCY</Text>
                                        <XStack style={{ alignItems: "center", gap: 4 }}>
                                            <Activity size={18} color="#00FF00" />
                                            <Text style={{ color: "white", fontSize: 24, fontWeight: "900" }}>{result.latency}ms</Text>
                                        </XStack>
                                    </YStack>
                                    <YStack style={{ alignItems: "flex-end", gap: 4 }}>
                                        <Text style={{ color: "#888", fontSize: 11, fontWeight: "600" }}>YIELD</Text>
                                        <Text style={{ color: "#00FF00", fontSize: 24, fontWeight: "900" }}>{result.yield}%</Text>
                                    </YStack>
                                </XStack>
                                <XStack style={{ gap: 8, alignItems: "center", backgroundColor: "#222", padding: 8, borderRadius: 8 }}>
                                    <Globe size={14} color="#888" />
                                    <Text style={{ color: "#888", fontSize: 12, flex: 1 }} numberOfLines={1}>{result.url}</Text>
                                </XStack>
                            </YStack>
                        )}
                    </YStack>
                </YStack>
            </YStack>

            <Button 
                theme="dark_green" 
                onPress={() => router.push("/leaderebords")} 
                style={{ position: "absolute", bottom: 40, right: 20, borderRadius: 30, width: 60, height: 60 }}
                size="$5"
                circular
            >
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
