import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Text, View, Pressable } from 'react-native';

export default function Settings() {
    const router = useRouter();

    const logOut = async () => {
        await AsyncStorage.removeItem("user");
        router.push("/");
    }

    return (
        <View>
            <Text>SETTINGS HERCULES AI!</Text>
            <Pressable onPress={() => logOut()}><Text>Log out</Text></Pressable>
        </View>
    );
}
