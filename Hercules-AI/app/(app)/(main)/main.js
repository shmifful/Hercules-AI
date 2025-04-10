import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Main() {
    const router = useRouter();
    const [user, setUser] = useState(null)

    useEffect(() => {
        const checkLoggedInUser = async () => {
            try {
                setUser(await AsyncStorage.getItem("user"));
                console.log("Stored user:", user);
                if (user) {
                    console.log("Logged in");
                    // You might want to parse it if it's JSON
                    // const user = JSON.parse(loggedInUser);
                }    
            } catch (error) {
                console.error("Error reading from AsyncStorage:", error);
            }
        };
        
        checkLoggedInUser();
    }, []); // Add empty dependency array to run only once on mount

    const generate_plan = async () => {
        console.log(user)
        try{
            // Sending data to server to be verified
            const req = await fetch("http://10.0.2.2:5000/generate", {
                method: "GET",
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

    return (
        <View>
            <Text>WELCOME TO HERCULES AI!</Text>
            <Pressable onPress={() => generate_plan()}><Text>Generate workout</Text></Pressable>
        </View>
    );
}
