import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const AppLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="(main)"
      options={{
        title: "Home",
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons 
            name={focused ? 'home' : 'home-outline'} 
            size={size} 
            color={color} 
          />)
    }}/>

      <Tabs.Screen name="(settings)"
        options={{
          title: "Settings",
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={size} 
              color={color} 
            />)
      }}/>
    </Tabs>
  );
};

export default AppLayout;