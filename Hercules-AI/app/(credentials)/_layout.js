import { Stack } from "expo-router";

const CredentialsLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="login"/>
        <Stack.Screen name="register" />
    </Stack>
  );
};

export default CredentialsLayout;