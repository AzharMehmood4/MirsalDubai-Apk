import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screen/LoginScreen';
import ViewScreen from './screen/ViewScreen';
import AddRecordScreen from './screen/AddRecordScreen';
import EditRecordScreen from './screen/EditRecordScreen';
import ViewRecordScreen from './screen/ViewRecordScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="View" component={ViewScreen} />
        <Stack.Screen name="AddRecord" component={AddRecordScreen} />
        <Stack.Screen name="EditRecord" component={EditRecordScreen} />
        <Stack.Screen name="ViewFile" component={ViewRecordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
