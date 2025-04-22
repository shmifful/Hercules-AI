import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Text, View, Pressable, StyleSheet, Alert } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react"

export default function Settings() {
    const router = useRouter();
    const [goal, setGoal] = useState(null)
    const [level, setLevel] = useState(null);
    const [ userID, setUserID ] = useState(null);


    const levelData = [
        { label: "🟢 Beginner", value: "Beginner"},
        { label: "🟡 Intermediate", value: "Intermediate"},
        { label: "🔴 Advanced", value: "Advanced"},
    ];

    const goalsData = [
        { label: "💪 Strength", value: "Strength" },
        { label: "🏋️ Hypertrophy (Muscle growth)", value: "Hypertrophy" },
        { label: "🏃 Endurance", value: "Endurance" },
    ];

    useEffect(() => {
        const get_pref = async () =>
        {
            const storedUser = JSON.parse(await AsyncStorage.getItem("user"));
            setUserID(storedUser.id);
            console.log(userID)

            try {
                const response = await fetch(`http://10.0.2.2:5000/get_preferences?user_id=${storedUser.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
            });
                const data = await response.json();

                setGoal(data.goal);
                setLevel(data.level);

                console.log(data)
            } catch (err) {
                console.log(err);
                setErrorMessage("Network error. Please try again.");
                Alert.alert("Error", errorMessage);
            }
        }

        get_pref();
        
    },[]);

    const updatePreferences = async () => {
        const data = {
            "user_id": userID,
            "goal": goal,
            "level": level
        }
        try {
            const response = await fetch("http://10.0.2.2:5000/update_preferences", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });

            const res = await response.json();
            
            if (res.success){
                Alert.alert("Prefences updated successfully", "Your preferences will be used to generate your workouts from next week");
            }

            console.log(data)
        } catch (err) {
            console.log(err);
            setErrorMessage("Network error. Please try again.");
            Alert.alert("Error", errorMessage);
        }
    }

    const logOut = async () => {
        await AsyncStorage.removeItem("user");
        router.push("/");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SETTINGS</Text>
            <Text style={styles.subtitle}>Update preferences</Text>

            <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>What is your fintness goal?</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={goalsData}
                    maxHeight={300}
                    placeholder={goal}
                    value={goal}
                    labelField="label"
                    valueField="value"
                    onChange={item => {
                        setGoal(item.value);
                    }}/>
            </View>
        
            <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>What is your fintness level?</Text>
                <Dropdown
                style={styles.dropdown}
                data={levelData}
                maxHeight={300}
                placeholder={level}
                value={level}
                labelField="label"
                valueField="value"
                onChange={item => {
                    setLevel(item.value);
                }}/>
            </View>

            <Pressable onPress={() => updatePreferences()} style={[styles.updateButtonContent, styles.updateButton]}>
                <Ionicons name="save-outline" size={20} color="white" style={styles.updateIcon} />
                <Text style={styles.updateButtonText}>Save preferences</Text>
            </Pressable>
            
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
    dropdownContainer: {
        marginBottom: 15,
    },
    dropdownLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    updateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    updateIcon: {
        marginRight: 5,
    },
    updateButton: {
        backgroundColor: '#4286f4',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    }
});
