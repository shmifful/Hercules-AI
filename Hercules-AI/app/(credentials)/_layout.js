import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="login"/>
        <Stack.Screen name="register" />
    </Stack>
  );
};

export default RootLayout;