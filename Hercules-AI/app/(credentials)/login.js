import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            setErrorMessage("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch("http://10.0.2.2:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!data.success) {
                setErrorMessage(data.message || "Login failed");
                Alert.alert("Error", errorMessage);
            } else {
                await AsyncStorage.setItem("user", JSON.stringify(data.user));
                router.push("/main");
            }
        } catch (err) {
            console.log(err);
            setErrorMessage("Network error. Please try again.");
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
           <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        onChangeText={setEmail}
                        value={email}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        onChangeText={setPassword}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                    />
                    <Pressable 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons 
                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color="#666" 
                        />
                    </Pressable>
                </View>

                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                <Pressable 
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        isLoading && styles.buttonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Text style={styles.buttonText}>Loading...</Text>
                    ) : (
                        <Text style={styles.buttonText}>LOGIN</Text>
                    )}
                </Pressable>

                <Pressable 
                    style={styles.linkContainer}
                    onPress={() => router.push("/register")}
                >
                    <Text style={styles.linkText}>Don"t have an account? <Text style={styles.link}>Register</Text></Text>
                </Pressable>
           </View>
                
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    formContainer: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginVertical: 24,
        padding: 25,
        borderRadius: 15,
        borderColor: "#000",
        borderWidth:2
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
    },
    icon: {
        marginRight: 10,
    },
    eyeIcon: {
        padding: 8,
    },
    input: {
        flex: 1,
        height: 50,
        color: "#333",
    },
    button: {
        backgroundColor: "#008080",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: "#aaa",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        marginBottom: 10,
        textAlign: "center",
    },
    linkContainer: {
        marginTop: 20,
    },
    linkText: {
        textAlign: "center",
        color: "#666",
    },
    link: {
        color: "#008080",
        fontWeight: "bold",
    },
});

export default Login;
