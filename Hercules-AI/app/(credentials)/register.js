import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Register = () => {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("Incomplete fields.");
    const [days, setDays] = useState(3)
    const [goal, setGoal] = useState("Strength")
    const [level, setLevel] = useState("Beginner");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async() => {
        const data = {
            username: username, 
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            days: parseInt(days),
            goal: goal,
            level: level
        }

        console.log(data)

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
        { label: '3 days per week', value: '3' },
        { label: '4 days per week', value: '4' },
        { label: '5 days per week', value: '5' },
        { label: '6 days per week', value: '6' },
    ];


    const goalsData = [
        { label: '💪 Strength', value: 'Strength' },
        { label: '🏋️ Hypertrophy (Muscle growth)', value: 'Hypertrophy' },
        { label: '🏃 Endurance', value: 'Endurance' },
    ];

    const levelData = [
        { label: "🟢 Beginner", value: "Beginner"},
        { label: "🟡 Intermediate", value: "Intermediate"},
        { label: "🔴 Advanced", value: "Advanced"},
    ];

    return (
    <View style={styles.formContainer}>
        <Text style={styles.title}>Create Your Account</Text>

        <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} onChangeText={setUsername} autoCapitalize="none" placeholder="Username"/>
        </View>

        <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" inputMode="email"/>
        </View>
            
        <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} onChangeText={setPassword} autoCapitalize="none" secureTextEntry={!showPassword} placeholder="Password" />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666"/>
            </Pressable>
        </View>

        <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} onChangeText={setConfirmPassword} autoCapitalize="none" secureTextEntry={!showPassword} placeholder="Confirm Password" />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666"/>
            </Pressable>
        </View>
            
        <Text style={styles.sectionTitle}>Training Preferences</Text>

        <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>How many days a week are you going to train?</Text>
            <Dropdown
                style={styles.dropdown}
                data={daysData}
                maxHeight={300}
                placeholder={days +" days per week"}
                value={days}
                labelField="label"
                valueField="value"
                onChange={item => {
                    setDays(item.value);
                }}/>
        </View>
        
        <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>What is your fintness goal?</Text>
            <Dropdown
                style={styles.dropdown}
                data={goalsData}
                maxHeight={300}
                placeholder={goal}
                value={goal}
                labelField="label"
                valueField="value"
                onChange={item => {
                    setGoal(item.value);
                }}/>
        </View>
        
        <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>What is your fintness level?</Text>
            <Dropdown
            style={styles.dropdown}
            data={levelData}
            maxHeight={300}
            placeholder={level}
            value={level}
            labelField="label"
            valueField="value"
            onChange={item => {
                setLevel(item.value);
            }}/>
        </View>
        

        <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>SUBMIT</Text>
        </Pressable>

        <Pressable style={styles.linkContainer} onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign in</Text></Text>
        </Pressable>
        
    </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginVertical: 24,
        padding: 25,
        borderRadius: 15,
        borderColor: "#000",
        borderWidth:2
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    dropdownContainer: {
        marginBottom: 15,
    },
    dropdownLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#008080',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkContainer: {
        marginTop: 20,
    },
    linkText: {
        textAlign: 'center',
        color: '#666',
    },
    link: {
        color: '#008080',
        fontWeight: 'bold',
    },
});

export default Register;