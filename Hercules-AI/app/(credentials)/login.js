import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("Incomplete fields.");

    const handleSubmit = async() => {
        const data = {
            email: email,
            password: password
        }

        console.log(data)

        try{
            const req = await fetch("http://10.0.2.2:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })

            const responseData = await req.json();
            
            if (responseData.success == false){
                setErrorMessage(responseData.message);
                Alert.alert("Error", errorMessage);
            }else{
                await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
                router.push("/main");
            }

        } catch (err){
            console.log(err)
        }
    }

    return (
    <View>
        <Text>Login</Text>
        <TextInput onChangeText={setEmail} autoCapitalize="none" placeholder="email" inputMode="email"/>
        <TextInput onChangeText={setPassword} autoCapitalize="none" placeholder="password" secureTextEntry={true} />

        <Pressable onPress={handleSubmit}>
            <Text>SUBMIT</Text>
        </Pressable>
    </View>
    );
};

export default Login;