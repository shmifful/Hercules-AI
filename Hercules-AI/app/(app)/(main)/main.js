import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, Pressable, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Main() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [days, setDays] = useState(0);
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
                    console.log(parsedUser)

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
            } 
        };
        
        checkLoggedInUser();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.username}>{user?.username}!</Text>
                <Text style={styles.planText}>Your {days}-Day Workout Plan</Text>
            </View>

            <View style={styles.workoutsContainer}>
               {workoutDays.map((dayName, index) => (
                    <Pressable 
                        key={index}
                        style={[
                            styles.dayCard,
                            workouts[dayName].completed === 0 ? 
                                styles.dayIncomplete : styles.dayComplete
                        ]}
                        onPress={() => {
                            if (workouts[dayName].completed === 0){
                                const dayData = workouts[dayName];
                                router.push({
                                    pathname:"[id]",
                                    params: {
                                    dayName: dayName,
                                    dayData: JSON.stringify(dayData)},
                                })
                            }
                        }}
                    >
                        <Text style={[styles.dayText, workouts[dayName].completed === 1 && styles.completedDayText]}>
                            {dayName}
                        </Text>
                    </Pressable>
                ))} 
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 25,
        paddingTop: 40,
        paddingBottom: 30,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 5,
    },
    username: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    planText: {
        fontSize: 16,
    },
    workoutsContainer: {
        paddingHorizontal: 20,
    },
    dayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dayIncomplete: {
        backgroundColor: '#ffffff',
    },
    dayComplete: {
        backgroundColor: '#008080',
    },
    dayText: {
        marginLeft: 15,
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        color: '#333',
    },
    completedDayText: {
        color: 'white',
    },
});