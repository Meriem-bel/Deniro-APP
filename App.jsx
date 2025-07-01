import 'react-native-gesture-handler'; // Keep this at the top
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import Onboarding from './components/onboarding';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/Home';
import Streak from './components/Streak';
import Profile from './components/Profile';
import Plan from './components/Plan'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Streak" component={Streak} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Plan" component={Plan} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
