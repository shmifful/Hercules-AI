import { useRouter } from 'expo-router';
import { Pressable, View, Text } from 'react-native';

export default function Workout() {
    const router = useRouter();
    


    return (
        <View style={{ padding: 20 }}>
            <Pressable onPress={router.push("/main")}><Text>go back</Text></Pressable>
        </View>
    );
}