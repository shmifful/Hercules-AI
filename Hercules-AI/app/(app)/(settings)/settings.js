import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
    const router = useRouter();

    const logOut = async () => {
        await AsyncStorage.removeItem("user");
        router.push("/");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SETTINGS</Text>
            
            <Pressable onPress={logOut} style={styles.option}>
                <View style={styles.optionContent}>
                    <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                    <Text style={[styles.optionText, { color: "#ff4444" }]}>Log Out</Text>
                </View>
            </Pressable>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFFF",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginVertical: 20,
        textAlign: "center",
    },
    option: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    optionContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
});
