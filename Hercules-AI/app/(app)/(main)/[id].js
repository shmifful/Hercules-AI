import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View, Alert, TextInput, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from 'react-native-element-dropdown';

export default function Workout() {
    const router = useRouter();
    const navigation = useNavigation();
    const {dayName, dayData} = useLocalSearchParams();
    const [exercises, setExercises] = useState([]);
    const [editedExercises, setEditedExercises] = useState({});
    const [userID, setUserID] = useState(null);
    const [selectedExercises, setSelectedExercises] = useState({});
    const day_id = JSON.parse(dayData).day_id;

    useEffect( () => {
        navigation.setOptions({
            title: dayName
        })

        get_ex();

    }, []);

    const get_ex = async () => 
        {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUserID(parsedUser.id)
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

    const handleOneRmChange = (index, value) => {
        setEditedExercises(prev => ({
            ...prev, [index]: Number(value) || 0
        }))
    }

    const handleExerciseChange = async (index, item, id) => {
        setSelectedExercises(prev => ({
          ...prev,
          [index]: item.value
        }));

        console.log(item)
        
        try {
            const req = await fetch("http://10.0.2.2:5000/update_ex", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({"user_id": userID, "title": item.value, "ex_id": id})
            });

            const responseData = await req.json();
            
        }
        catch (err) {
            console.log("Fetch error:", err);
            Alert.alert("Error", "Failed to fetch exercises");
        }finally{
            get_ex();
        }
    };


    const handleStart = async () => {
        const errors = new Set();
    
        exercises.forEach((ex, index) => {
        // Check edited values first
        const editedValue = editedExercises[index];
        if (editedValue !== undefined) {
            if (editedValue === 0) {
                errors.add(ex.name);
            }
        }
        // Fallback to original value if not edited
        else if (ex.one_rm === 0) {
            errors.add(ex.name);
        }
        });

        if (errors.size > 0) {
            Alert.alert("1RM Error",`Please enter your 1RM for:\n- ${Array.from(errors).join("\n- ")}`);
            return;
        }
    
        // Update 1RM if changed
        if (Object.keys(editedExercises > 0)){
            exercises.forEach(async (ex, index) =>{
                if (editedExercises[index] > ex.one_rm){
                    try {
                        const req = await fetch("http://10.0.2.2:5000/update_one_rm", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({"id": ex.id, "exercise_name": ex.name, "new_one_rm": editedExercises[index]})
                        });
        
                        const responseData = await req.json();
                        console.log(responseData)
                    }
                    catch (err) {
                        console.log("Fetch error:", err);
                        Alert.alert("Error", "Failed to update 1RM");
                    }
                }
            })
        }

        router.replace({
            pathname: "/workout", 
            params: {
                "day_id": day_id,
                exercises: JSON.stringify(
                    exercises.map((ex, index) => ({
                        ...ex,
                        one_rm: editedExercises[index] !== undefined 
                            ? editedExercises[index] 
                            : ex.one_rm
                    }))
                )
            }
        });
        
    }

    return (
        <View style={styles.container}>
        {/* Table Header */}
        <View style={styles.header}>
            <Text style={[styles.headerText, {flex: 3}]}>Exercise</Text>
            <Text style={[styles.headerText, {flex: 1}]}>Sets</Text>
            <Text style={[styles.headerText, {flex: 1}]}>Reps</Text>
            <Text style={[styles.headerText, {flex: 1}]}>Rest</Text>
            <Text style={[styles.headerText, {flex: 1.5}]}>1RM</Text>
        </View>

        {/* Table Rows */}
        <View style={styles.tableBody}>
            {exercises.map((exercise, index) => {

                const dropdownData = exercise.alt_ex.map(ex => ({
                    label: ex, 
                    value: ex
                }));
                console.log(exercise.id)
                return (
                    <View 
                        key={index}
                        style={[
                        styles.row,
                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                        ]}
                    >
                    <View style={[styles.cellText, {flex: 3}]}>
                    {/* The exercises are sorted alphabetically, so after change, they will move around */}
                    <Dropdown
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainer}
                        itemTextStyle={styles.dropdownItemText}
                        data={dropdownData}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={exercise.name}
                        value={selectedExercises[index] || exercise.name}
                        onChange={item => handleExerciseChange(index, item, exercise.id)}
                        activeColor="#f0f0f0"
                    />
                    </View>
                    <Text style={[styles.cellText, {flex: 1}]}>{exercise.sets}</Text>
                    <Text style={[styles.cellText, {flex: 1}]}>{exercise.reps}</Text>
                    <Text style={[styles.cellText, {flex: 1}]}>{exercise.rest}</Text>
                    <View style={[styles.inputWrapper, {flex: 1.5}]}>
                    <TextInput 
                        style={styles.input}
                        keyboardType="numeric"
                        defaultValue={exercise.one_rm?.toString()}
                        onChangeText={(text) => handleOneRmChange(index, text)}
                        placeholder="0"
                    />
                    <Text style={styles.unitText}>kg</Text>
                    </View>
                </View>
            )})}
        </View>

        {/* Start Button */}
        <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.buttonText}>START WORKOUT</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#f8f9fa"
    },
    header: {
      flexDirection: "row",
      paddingVertical: 14,
      paddingHorizontal: 8,
      backgroundColor: "#008080",
      borderRadius: 8,
      marginBottom: 8
    },
    headerText: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    tableBody: {
      flex: 1,
      marginBottom: 16
    },
    row: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0"
    },
    evenRow: {
      backgroundColor: "#ffffff"
    },
    oddRow: {
      backgroundColor: "#f5f5f5"
    },
    cellText: {
      textAlign: "center",
      color: "#333",
      alignSelf: "center"
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    },
    input: {
      width: 32,
      height: 32,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 6,
      padding: 4,
      textAlign: "center",
      backgroundColor: "white",
      marginRight: 4
    },
    unitText: {
      color: "#666"
    },
    startButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#008080",
      paddingVertical: 14,
      borderRadius: 8,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
      marginRight: 8
    },
    exerciseDropdown: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      dropdownContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 4,
      },
      dropdownItemText: {
        color: '#333',
        paddingVertical: 10,
        paddingHorizontal: 16,
      },
  });