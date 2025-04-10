import { Tabs } from "expo-router";

const AppLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="(main)"
      options={{
        headerShown: false
    }}/>

      <Tabs.Screen name="(settings)"
        options={{
        headerShown: false
      }}/>
    </Tabs>
  );
};

export default AppLayout;