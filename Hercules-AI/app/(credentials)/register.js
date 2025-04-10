import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Register = () => {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("Incomplete fields.");
    const [days, setDays] = useState(3)
    const [goal, setGoal] = useState("Strength")

    const handleSubmit = async() => {
        const data = {
            username: username, 
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            days: parseInt(days),
            goal: goal
        }

        try{
            // Sending data to server to be verified
            const req = await fetch("http://10.0.2.2:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })

            const responseData = await req.json();
            
            if (responseData.success == false){
                setErrorMessage(responseData.message)
                Alert.alert("Error", errorMessage)
            }else{
                await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
                router.push("/main");
            }

        } catch (err){
            console.log(err)
        }
    }

    const daysData = [
        { label: '3 days', value: '3' },
        { label: '4 days', value: '4' },
        { label: '5 days', value: '5' },
        { label: '6 days', value: '6' },
      ];

    const goalsData = [
        { label: 'Strength', value: 'Strength' },
        { label: 'Hypertrophy (Muscle growth)', value: 'Hypertrophy' },
        { label: 'Endurance', value: 'Endurance' },
    ];

    return (
    <View>
        <Text>REGISTER</Text>
        <TextInput onChangeText={setUsername} autoCapitalize="none" placeholder="username"/>
        <TextInput onChangeText={setEmail} autoCapitalize="none" placeholder="email" inputMode="email"/>
        <TextInput onChangeText={setPassword} autoCapitalize="none" placeholder="password" secureTextEntry={true} />
        <TextInput onChangeText={setConfirmPassword} autoCapitalize="none" placeholder="confirm password" secureTextEntry={true} />
        <Text>How many days a week are you going to train?</Text>
        <Dropdown
            data={daysData}
            maxHeight={300}
            placeholder={days +" days"}
            value={days}
            labelField="label"
            valueField="value"
            onChange={item => {
                setDays(item.value);
              }}
        />
        <Text>What is your fintness goal?</Text>
        <Dropdown
            data={goalsData}
            maxHeight={300}
            placeholder={goal}
            value={goal}
            labelField="label"
            valueField="value"
            onChange={item => {
                setGoal(item.value);
              }}
        />

        <Pressable onPress={handleSubmit}>
            <Text>SUBMIT</Text>
        </Pressable>
    </View>
    );
};

export default Register;