import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
    const router = useRouter();

    useEffect(() => {
        const checkLoggedInUser = async () => {
            try {
                const loggedInUser = await AsyncStorage.getItem("user");
                console.log("Stored user:", loggedInUser);
                if (loggedInUser) {
                    router.push("/main")
                }    
            } catch (error) {
                console.error("Error reading from AsyncStorage:", error);
            }
        };
        
        checkLoggedInUser();
    }, []); // Add empty dependency array to run only once on mount

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>WELCOME TO</Text>
            <Text style={styles.appName}>HERCULES AI</Text>

            <View style={styles.credentialsContainer}>
                <Pressable style={styles.loginButton} onPress={() => router.push("/login")}>
                    <Text style={styles.credentials}>Login</Text>
                </Pressable>

                <Pressable style={styles.registerButton} onPress={() => router.push("/register")}>
                    <Text style={[styles.credentials, {color:"#008080"}]}>Register</Text>
                </Pressable>
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: "#F0F0FA",
    },
    credentialsContainer: {
        width: '80%',
        marginTop: 30,
    },
    credentials:{
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    welcome:{
        fontSize: 24,
        padding: 48
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#008080',
        marginBottom: 50,
        textShadowRadius: 3,
    },
    loginButton: {
        backgroundColor: '#008080',
        padding: 18,
        marginVertical: 10,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    registerButton: {
        backgroundColor: 'white',
        padding: 18,
        marginVertical: 10,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 5,
        borderWidth: 2,
        borderColor: '#008080',
    },
});
