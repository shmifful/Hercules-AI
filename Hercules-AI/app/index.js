import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View, Pressable } from 'react-native';
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
        <View>
            <Text>WELCOME TO HERCULES AI!</Text>
            <Pressable onPress={() => router.push("/login")}><Text>Login</Text></Pressable>
            <Pressable onPress={() => router.push("/register")}><Text>Register</Text></Pressable>
        </View>
    );
}
