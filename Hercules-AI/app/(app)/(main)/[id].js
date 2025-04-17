import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View, Alert, TextInput } from 'react-native';
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Workout() {
    const router = useRouter();
    const navigation = useNavigation();
    const {dayName, dayData} = useLocalSearchParams();
    const [exercises, setExercises] = useState([]);
    const [editedExercises, setEditedExercises] = useState({});
    const day_id = JSON.parse(dayData).day_id;

    useEffect( () => {
        navigation.setOptions({
            title: dayName
        })

        const get_ex = async () => 
        {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    try {
                        const req = await fetch("http://10.0.2.2:5000/get_exercises", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({"id": day_id, "user_id": parsedUser.id})
                        });
        
                        const responseData = await req.json();
                        // Convert object to array format
                        const exercisesArray = Object.entries(responseData).map(([name, details]) => ({
                            name,
                            ...details
                        }));
                        
                        setExercises(exercisesArray);
                        console.log(exercises)
                    }
                    catch (err) {
                        console.log("Fetch error:", err);
                        Alert.alert("Error", "Failed to fetch exercises");
                    }
                }
            }catch (error) {
                console.error("Error reading from AsyncStorage:", error);
                Alert.alert("Error", "Failed to load user data");
            }
        }
        get_ex();

    }, []);

    const handleOneRmChange = (index, value) => {
        setEditedExercises(prev => ({
            ...prev, [index]: Number(value) || 0
        }))
    }

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
        <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>1RM</Text>
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems:"flex-start", flexDirection:"row", padding:'0'}}>
                <TextInput 
                keyboardType='numeric'
                defaultValue={exercise.one_rm?.toString()}
                onChangeText={(text) => handleOneRmChange(index, text)}
                />
                <Text>kg</Text>
            </View>
        </View>
    ))}

    <Pressable><Text>START</Text></Pressable>
</View>
    );
}