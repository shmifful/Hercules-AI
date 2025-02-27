import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async() => {
        const data = {
            username: username, 
            email: email,
            password: password,
            confirmPassword: confirmPassword
        }

        try{
            const req = await fetch("http://10.0.2.2:5000/register", {
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
        <Text>REGISTER</Text>
        <TextInput onChangeText={setUsername} autoCapitalize="none" placeholder="username"/>
        <TextInput onChangeText={setEmail} autoCapitalize="none" placeholder="email" inputMode="email"/>
        <TextInput onChangeText={setPassword} autoCapitalize="none" placeholder="password" secureTextEntry={true} />
        <TextInput onChangeText={setConfirmPassword} autoCapitalize="none" placeholder="confirm password" secureTextEntry={true} />

        <Pressable onPress={handleSubmit}>
            <Text>SUBMIT</Text>
        </Pressable>
    </View>
    );
};

export default Register;