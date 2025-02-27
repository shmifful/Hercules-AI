import { useRouter } from 'expo-router';
import { Text, View, Pressable } from 'react-native';

export default function App() {
    const router = useRouter();
    return (
        <View>
            <Text>WELCOME TO HERCULES AI!</Text>
            <Pressable onPress={() => router.push("/login")}><Text>Login</Text></Pressable>
            <Pressable onPress={() => router.push("/register")}><Text>Register</Text></Pressable>
        </View>
    );
}
