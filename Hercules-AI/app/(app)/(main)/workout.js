import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutScreen() {
    const router = useRouter();
    const [remember, setRemember] = useState(false);
    const [exerciseData, setExerciseData] = useState([]);
    const [multiplier, setMultiplier] = useState(0.5);
    const [currentExercise, setCurrentExercise] = useState(0);
    const [exerciseSet, setExerciseSet] = useState(1);
    const [done, setDone] = useState(false);
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [desc, setDesc] = useState("");
    const [rateEx, setRateEx] = useState(false);
    const [rate, setRate] = useState(0);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const { day_id, exercises } = useLocalSearchParams();

    useEffect(() => {
        const parsedExercises = JSON.parse(exercises);
        setExerciseData(parsedExercises);
        getExDesc(parsedExercises[currentExercise].name);

        if (parsedExercises[0]?.sets === "1-5") {
            setMultiplier(0.9);
        } else if (parsedExercises[0]?.sets === "8-12") {
            setMultiplier(0.7);
        }
    }, []);

    const incrementSetOrExercise = () => {
        const current = exerciseData[currentExercise];

        if (exerciseSet < current.sets) {
            setExerciseSet(exerciseSet + 1);
            startStopwatch();
        } else if (currentExercise < exerciseData.length - 1) {
            setRateEx(true);
            getExDesc(exerciseData[currentExercise+1].name);
            setCurrentExercise(currentExercise + 1);
            setExerciseSet(1);
            startStopwatch();
        } else {
            setRateEx(true);
            setDone(true);
        }
    };

    const readDesc = (text) => {
        // Text-to-Speech
        Speech.speak(text, {
            language: 'en',
            pitch: 1,
            rate: 1
        });
    }

    // Function to start the stopwatch
    const startStopwatch = () => {
        startTimeRef.current = Date.now() - time * 1000;
        intervalRef.current = setInterval(() => {
            setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000)
        setRunning(true);
    }

    // Function to reset the stopwatch
    const resetStopwatch = () => {
        clearInterval(intervalRef.current);
        setTime(0);
        setRunning(false);
    }

    // Function to get exercise description
    const getExDesc = async (ex) => {
        try {
          const encodedEx = encodeURIComponent(ex);
          const response = await fetch(`http://10.0.2.2:5000/get_exercise_description?exercise=${encodedEx}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          setDesc(data.description); 
        } catch (error) {
          console.error('Error fetching exercise description:', error);
          setDesc("Description not available");
        }
    };

    const submitRating = async () => {
        if (rate > 0) {
            const data = {
                "id": exerciseData[currentExercise-1].id,
                "rating": rate
            }

            await fetch(`http://10.0.2.2:5000/rating/${data.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            setRate(0);
        }
        console.log(rate);
        setRateEx(false);
    }

    if (!remember) {
        return (
            <View style={styles.reminderContainer}>
                <Ionicons name="warning-outline" size={48} color="#FFA500" style={styles.warningIcon} />
                <Text style={styles.reminderTitle}>Important Reminder</Text>
                <Text style={styles.reminderText}>
                    Please remember to stretch and warm up before starting your workout. 
                    If you feel physically unfit to workout, please stop and seek medical help.
                </Text>
                <Pressable style={styles.reminderButton} onPress={() => setRemember(true)}>
                    <Text style={styles.reminderButtonText}>I UNDESTAND</Text>
                </Pressable>
            </View>
        );
    }

    const current = exerciseData[currentExercise];

    if (running){
        return(
            <View style={styles.timerContainer}>
                <Text style={styles.timerTitle}>Rest time</Text>
                <Text style={styles.timerSubtitle}>Recommended rest: {current?.rest}</Text>
                <Text style={styles.timerDisplay}>Time reseted: {Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60)}: {time % 60 < 10 ? `0${time % 60}` : time % 60}</Text>
                <Pressable style={styles.buttonPressed} onPress={() => resetStopwatch()}>
                    <Text style={styles.timerButtonText}>NEXT EXERCISE</Text>
                </Pressable>
            </View>
        )
    }

    if (rateEx){
        return (
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingTitle}>How would you rate this exercise?</Text>
                <Text style={styles.ratingSubtitle}>(5 being the best)</Text>

                <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Pressable 
                            key={star}
                            onPress={() => setRate(star)}
                        >
                            <Ionicons 
                                name={rate >= star ? "star" : "star-outline"} 
                                size={40} 
                                color={rate >= star ? "#FFD700" : "#666"} 
                                style={styles.starIcon}
                            />
                        </Pressable>
                    ))}
                </View>
                
                <View style={styles.ratingButtons}>
                    <Pressable 
                        style={[styles.ratingButton, styles.skipButton]}
                        onPress={() => setRateEx(false)}
                    >
                        <Text style={styles.skipButtonText}>SKIP</Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.ratingButton, styles.submitButton]}
                        onPress={() => submitRating()}
                    >
                        <Text style={styles.submitButtonText}>SUBMIT</Text>
                    </Pressable>
                </View>
                
            </View>
        )
    }

    const finishWorkout = async () => {
        console.log(day_id)
        const res = await fetch("http://10.0.2.2:5000/completed", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"day_id": day_id}),
        })

        router.replace("/main");
    }

    if (done) {
        return (
            <View style={styles.completeContainer}>
                <Ionicons name="trophy-outline" size={72} color="#FFD700" />
                <Text style={styles.completeTitle}>Workout Complete! 🎉</Text>
                <Text style={styles.completeText}>Great job today!</Text>
                <Pressable style={styles.completeButton} onPress={() => finishWorkout()}><Text style={styles.completeButtonText}>RETURN TO MAIN</Text></Pressable>
            </View>
        );
    }

    return (
        <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{current?.name}</Text>

            <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseWeight}>
                    {current?.one_rm * multiplier} kg
                </Text>
                <Text style={styles.exerciseReps}>
                    {current?.reps.split("-")[0]} - {current?.reps.split("-")[1]} reps
                </Text>
                <Text style={styles.exerciseSet}>
                    Set {exerciseSet} of {current?.sets}
                </Text>
            </View>

            <Pressable style={styles.descriptionButton} onPress={()=>readDesc(desc)}>
                <Ionicons name="volume-high-outline" size={20} color="#008080" />
                <Text>READ DESCRIPTION OUT LOUD</Text>
            </Pressable>
            
            <Text style={styles.exerciseDescription}>{desc}</Text>

            <Pressable style={styles.restButton} onPress={incrementSetOrExercise}>
                <Text style={styles.restButtonText}>Rest</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    reminderContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        margin: 20,
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
    },
    warningIcon: {
        marginBottom: 15,
    },
    reminderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    reminderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    reminderButton: {
        backgroundColor: '#008080',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    reminderButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    timerContainer: {
        margin: 20,
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
    },
    timerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    timerSubtitle: {
        fontSize: 16,
        marginBottom: 20,
    },
    timerDisplay: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    timerButton: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    timerButtonText: {
        color: '#008080',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
    },

    ratingContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        margin: 20,
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
    },
    ratingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    ratingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 25,
    },
    ratingStars: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    starIcon: {
        marginHorizontal: 5,
    },
    ratingButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    ratingButton: {
        padding: 15,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    skipButton: {
        backgroundColor: '#f0f0f0',
    },
    skipButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#008080',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    completeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        margin: 20,
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
    },
    completeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 15,
    },
    completeText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 25,
    },
    completeButton: {
        backgroundColor: '#008080',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    completeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    exerciseContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        margin: 20,
        padding: 25,
        borderRadius: 15,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    exerciseDetails: {
        marginBottom: 20,
        alignItems: 'center',
    },
    exerciseWeight: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#008080',
        marginBottom: 5,
    },
    exerciseReps: {
        fontSize: 18,
        color: '#666',
        marginBottom: 5,
    },
    exerciseSet: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    descriptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    descriptionButtonText: {
        color: '#008080',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 25,
    },
    restButton: {
        backgroundColor: '#008080',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    restButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
