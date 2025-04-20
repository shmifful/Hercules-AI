import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View, Text } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import * as Speech from 'expo-speech';

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
    const { exercises } = useLocalSearchParams();

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

            fetch(`http://10.0.2.2/rating/${data.id}`, {
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
            <View style={{ padding: 20 }}>
                <Text>
                    Please remember to stretch and warm up before starting to workout. If you feel physically unfit to workout, please stop and seek medical help.
                </Text>
                <Pressable onPress={() => setRemember(true)}>
                    <Text>OK</Text>
                </Pressable>
            </View>
        );
    }

    const current = exerciseData[currentExercise];

    if (running){
        return(
            <View style={{ padding: 20 }}>
                <Text>Rest time</Text>
                <Text>Recommended rest: {current?.rest}</Text>
                <Text>Time reseted: {Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60)}: {time % 60 < 10 ? `0${time % 60}` : time % 60}</Text>
                <Pressable onPress={() => resetStopwatch()}><Text>Next exercise</Text></Pressable>
            </View>
        )
    }

    if (rateEx){
        return (
            <View>
                <Text>How would you rate the exercise? (5 being the best)</Text>
                <View style={{flexDirection:"row"}}>
                    <Pressable onPress={() => setRate(1)}><Text>1</Text></Pressable>
                    <Pressable onPress={() => setRate(2)}><Text>2</Text></Pressable>
                    <Pressable onPress={() => setRate(3)}><Text>3</Text></Pressable>
                    <Pressable onPress={() => setRate(4)}><Text>4</Text></Pressable>
                    <Pressable onPress={() => setRate(5)}><Text>5</Text></Pressable>
                </View>
                
                <View style={{flexDirection:"row"}}>
                    <Pressable onPress={() => setRateEx(false)}><Text>Skip</Text></Pressable>
                    <Pressable onPress={() => submitRating()}><Text>SUBMIT</Text></Pressable>
                </View>
                
            </View>
        )
    }

    if (done) {
        return (
            <View style={{ padding: 20 }}>
                <Text>Workout complete! 🎉</Text>
                <Pressable onPress={() => router.replace("/main")}><Text>Return to main</Text></Pressable>
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text>{current?.name}</Text>
            <Text>Description: {desc}</Text>
            <Pressable onPress={()=>readDesc(desc)}><Text>READ DESCRIPTION OUT LOUD</Text></Pressable>
            <Text>{current?.one_rm * multiplier} kg</Text>
            <Text>Do between {current?.reps.split("-")[0]} to {current?.reps.split("-")[1]} reps</Text>
            <Text>Set {exerciseSet} of {current?.sets}</Text>
            <Pressable onPress={incrementSetOrExercise}>
                <Text>Rest</Text>
            </Pressable>
        </View>
    );
}
