import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

const Login = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async() => {
        const data = {
            username, username,
            email: email,
            password: password
        }

        try{
            const req = await fetch("http://10.0.2.2:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })

            const responseData = await req.text();
            console.log(responseData);
        } catch (err){
            console.log(err)
        }
    }

    return (
    <View>
        <Text>Login</Text>
        <TextInput onChangeText={setUsername} autoCapitalize="none" placeholder="username"/>
        <TextInput onChangeText={setEmail} autoCapitalize="none" placeholder="email" inputMode="email"/>
        <TextInput onChangeText={setPassword} autoCapitalize="none" placeholder="password" secureTextEntry={true} />

        <Pressable onPress={handleSubmit}>
            <Text>SUBMIT</Text>
        </Pressable>
    </View>
    );
};

export default Login;