import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegistrationScreen from "../Screens/RegistrationScreen";
import LoginScreen from "../Screens/LoginScreen";
import Home from "../Screens/mainScreens/Home";
import MapScreen from "../Screens/mainScreens/MapScreen";
import CommentsScreen from "../Screens/mainScreens/CommentsScreen";
const AuthStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

export const useRotes = (isLogedIn) => {
  if (!isLogedIn) {
    return (
      <AuthStack.Navigator>
        <AuthStack.Screen
          options={{ headerShown: false }}
          name="Registration"
          component={RegistrationScreen}
        />
        <AuthStack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen options={{ headerShown: false }} name="Home" component={Home} />
      <ProfileStack.Screen
        options={{ headerTitleAlign: "center" }}
        name="Comments"
        component={CommentsScreen}
      />
      <ProfileStack.Screen
        options={{ headerTitleAlign: "center" }}
        name="Map"
        component={MapScreen}
      />
    </ProfileStack.Navigator>
  );
};
