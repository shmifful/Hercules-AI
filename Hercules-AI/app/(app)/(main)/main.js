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
                const storedUser = await AsyncStorage.getItem("user")
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser);
                    console.log(user);
                }   
            } catch (error) {
                console.error("Error reading from AsyncStorage:", error);
            }finally {
                setLoading(false)
            }
        };
        
        checkLoggedInUser();
    }, []); // Add empty dependency array to run only once on mount

    const generate_plan = async () => {
        const data = {
            username: user.username,
            id: user.id
        }

        try{
            // Sending data to server to be verified
            const req = await fetch("http://10.0.2.2:5000/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })


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
