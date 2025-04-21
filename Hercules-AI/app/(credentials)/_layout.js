import { Stack } from "expo-router";

const CredentialsLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="login"
        options={{
          headerShown: false
        }}/>
        <Stack.Screen name="register" 
        options={{
          headerShown: false
        }}/>
    </Stack>
  );
};

export default CredentialsLayout;