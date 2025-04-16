import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View} from 'react-native';

export default function Workout() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    return (
        <View style={{ padding: 20 }}>
            <Text>Hello</Text>
            <Pressable onPress={() => router.push("/main")}><Text>Go back</Text></Pressable>
        </View>
    );
}