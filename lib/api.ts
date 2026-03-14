import axios from "axios";
import Constants from "expo-constants";

import { Platform } from "react-native";

// Dynamically determine the backend URL based on the environment
let BASE_URL = "http://localhost:4000/api";

const debuggerHost = Constants.expoConfig?.hostUri;
if (debuggerHost) {
    console.log(debuggerHost);
    
    // When developing on LAN, use the dev server's IP address
    BASE_URL = `http://${debuggerHost.split(":")[0]}:4000/api`;
} else if (Platform.OS === "android") {
    // Fallback for Android emulator
    BASE_URL = "http://10.0.2.2:4000/api";
}

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const runPing = async (url: string) => {
    const response = await api.post("/public/run-ping", { url });
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await api.get("/public/leaderboard");
    return response.data;
};

export const getStats = async (url: string) => {
    const response = await api.get(`/public/stats?url=${encodeURIComponent(url)}`);
    return response.data;
};
