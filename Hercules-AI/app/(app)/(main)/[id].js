import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View} from 'react-native';
import { useState } from "react";

export default function Workout() {
    const router = useRouter();
    const navigation = useNavigation();
    const {dayName, dayData} = useLocalSearchParams();
    const [exercises, setExercises] = useState([]);
    const day_id = JSON.parse(dayData).day_id

    useEffect( () => {
        navigation.setOptions({
            title: dayName
        })

        const get_ex = async () => 
        {
            console.log(day_id)
            try {
                const req = await fetch("http://10.0.2.2:5000/get_exercises", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({"id": day_id})
                });

                const responseData = await req.json();
                // Convert object to array format
                const exercisesArray = Object.entries(responseData).map(([name, details]) => ({
                    name,
                    ...details
                }));
                
                setExercises(exercisesArray);
                console.log(exercises)
                

            } catch (err) {
                console.log("Fetch error:", err);
                Alert.alert("Error", "Failed to fetch exercises");
            }
        }
        get_ex();

    }, []);

    return (
        <View style={{ padding: 20 }}>
    {/* Table Header */}
    <View style={{
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#ddd',
        marginBottom: 8,
    }}>
        <Text style={{ flex: 3, fontWeight: 'bold' }}>Exercise</Text>
        <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Sets</Text>
        <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Reps</Text>
        <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Rest</Text>
    </View>

    {/* Table Rows */}
    {exercises.map((exercise, index) => (
        <View 
            key={index}
            style={{
                flexDirection: 'row',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#f5f5f5',
            }}
        >
            <Text style={{ flex: 3 }}>{exercise.name}</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>{exercise.sets}</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>{exercise.reps}</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>{exercise.rest}</Text>
        </View>
    ))}

    <Pressable><Text>START</Text></Pressable>
</View>
    );
}