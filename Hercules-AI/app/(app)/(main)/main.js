import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Main() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [days, setDays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [workouts, setWorkouts] = useState(null); // Initialize as null
    const [workoutDays, setWorkoutDays] = useState([]); // New state for workout days

    useEffect(() => {
        const checkLoggedInUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setDays(parsedUser.days);

                    try {
                        const req = await fetch("http://10.0.2.2:5000/get_workouts", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({"id": parsedUser.id})
                        });
            
                        const responseData = await req.json();
                        setWorkouts(responseData);
                        
                        // Extract and set the workout day names
                        if (responseData) {
                            const daysList = Object.keys(responseData);
                            setWorkoutDays(daysList);
                        }
            
                    } catch (err) {
                        console.log("Fetch error:", err);
                        Alert.alert("Error", "Failed to fetch workouts");
                    }
                }
            } catch (error) {
                console.error("Error reading from AsyncStorage:", error);
                Alert.alert("Error", "Failed to load user data");
            } finally {
                setLoading(false);
            }
        };
        
        checkLoggedInUser();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                WELCOME TO HERCULES AI, {user?.username}!
            </Text>
            
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Your {days}-day workout plan:
            </Text>

            {workoutDays.map((dayName, index) => (
                <Pressable 
                    key={index}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? '#ddd' : '#f0f0f0',
                        padding: 15,
                        marginBottom: 10,
                        borderRadius: 5
                    })}
                    onPress={() => {
                        const dayData = workouts[dayName];
                        router.push({pathname:"[id]",
                            params: dayData
                        })
                    }}
                >
                    <Text style={{ textAlign: 'center' }}>
                        {dayName}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}