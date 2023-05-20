import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PostsScreen from "./PostsScreen";
import CreatePostScreen from "./CreatePostsScreen";
import ProfileScreen from "./ProfileScreen";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";
import { View } from "react-native";
import { userLogOut } from "../../redux/auth/autnOperation";
import { useDispatch } from "react-redux";

const NavTab = createBottomTabNavigator();
export default function Home({ navigation }) {
  const dispatch = useDispatch();
  return (
    <NavTab.Navigator
      initialRouteName="Posts"
      backBehavior="history"
      screenOptions={{
        headerTitleAlign: "center",
        tabBarStyle: { paddingHorizontal: 60, height: 60 },
        tabBarShowLabel: false,
      }}
    >
      <NavTab.Screen
        name="Posts"
        component={PostsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <AntDesign name="appstore-o" size={size} color={color} />
          ),
          headerRight: ({ focused, color, size }) => (
            <TouchableOpacity onPress={() => dispatch(userLogOut())} style={{ paddingRight: 20 }}>
              <MaterialIcons name="logout" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          ),
        }}
      />
      <NavTab.Screen
        name="Create Post"
        component={CreatePostScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={{
                backgroundColor: "#FF6C00",
                textAlign: "center",
                paddingHorizontal: 28,
                paddingVertical: 10,
                borderRadius: 20,
              }}
            >
              <Ionicons style={{}} name="md-add" size={size} color="white" />
            </View>
          ),
          headerLeft: ({ focused, color, size }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Posts")}
              style={{ paddingLeft: 20 }}
            >
              <MaterialCommunityIcons name="keyboard-backspace" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          ),
          tabBarStyle: { display: "none" },
        }}
      />
      <NavTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </NavTab.Navigator>
  );
}
