import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { authSignIn } from "../redux/auth/autnOperation";

export default function RegistrationScreen({ navigation, onLayoutRootView }) {
  const initialRegisterState = {
    email: "",
    password: "",
  };

  const [loginFormData, setloginFormData] = useState(initialRegisterState);
  const [formData, setformData] = useState({});
  const [isPassworHiden, setIsPassworShowing] = useState(true);
  const [togleBtnText, setTogleBtnText] = useState("Show");
  const [isShowKeyboard, setisShowKeyboard] = useState(false);

  const dispatch = useDispatch();

  const handleEmailText = (text) =>
    setloginFormData((prevState) => ({ ...prevState, email: text }));
  const handlePasswordText = (text) =>
    setloginFormData((prevState) => ({ ...prevState, password: text }));

  const hideKeyboard = () => {
    setisShowKeyboard(false);
    Keyboard.dismiss();
  };

  const keyboardShowing = () => {
    setisShowKeyboard(true);
  };

  const onFormSubmit = () => {
    setformData(loginFormData);
    dispatch(authSignIn(loginFormData));
    setloginFormData(initialRegisterState);

    Keyboard.dismiss();
  };

  const handleShowPassword = () => {
    if (isPassworHiden) {
      setIsPassworShowing(false);
      setTogleBtnText("Hide");
    } else {
      setIsPassworShowing(true);
      setTogleBtnText("Show");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={hideKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.container}
        // onLayout={onLayoutRootView}
      >
        <ImageBackground
          style={styles.bgrImg}
          source={require("../assets/img/Photo_BG.jpg")}
        ></ImageBackground>
        <View
          style={{
            ...styles.wrap,
            marginBottom: isShowKeyboard ? -100 : 0,
          }}
        >
          <Text style={styles.registration}>Login</Text>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onFocus={keyboardShowing}
              onSubmitEditing={hideKeyboard}
              value={loginFormData.email}
              onChangeText={handleEmailText}
              keyboardType="email-address"
              cursorColor="#FF6C00"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              onFocus={keyboardShowing}
              onSubmitEditing={hideKeyboard}
              secureTextEntry={isPassworHiden}
              value={loginFormData.password}
              onChangeText={handlePasswordText}
              cursorColor="#FF6C00"
            />
            <TouchableOpacity
              onPress={(hideKeyboard, onFormSubmit)}
              activeOpacity={0.7}
              style={styles.regBtn}
            >
              <Text style={styles.btnTitle}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShowPassword}
              activeOpacity={0.7}
              style={styles.passwordVisibleTogle}
            >
              <Text style={styles.passwordVisibleTogleText}>{togleBtnText}</Text>
            </TouchableOpacity>
          </View>

          <Text
            onPress={() => {
              navigation.navigate("Registration");
            }}
            style={styles.signInLink}
          >
            Don't have an account? Sign up
          </Text>
        </View>
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "flex-end",
  },
  bgrImg: {
    position: "absolute",
    left: 0,
    top: 0,

    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height + 40,
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  wrap: {
    display: "flex",
    backgroundColor: "#FFFFFF",
    paddingTop: 30,
    paddingBottom: 50,

    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  registration: {
    fontFamily: "Roboto-Bold",
    fontWeight: "500",
    fontSize: 30,
    lineHeight: 35,
    textAlign: "center",
    letterSpacing: 0.03,
    color: "#212121",
    marginBottom: 32,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    width: 343,
    height: 50,
    padding: 16,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 10,
    backgroundColor: "#F6F6F6",
    borderColor: "#E8E8E8",
    borderWidth: 1,
    borderRadius: 8,
  },
  regBtn: {
    backgroundColor: "#FF6C00",
    borderRadius: 100,
    paddingVertical: 16,
    marginTop: 43,
  },
  btnTitle: {
    fontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "center",
    color: "#FFFFFF",
  },
  signInLink: {
    fontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    marginTop: 16,
    textAlign: "center",
    color: "#1B4371",
  },

  passwordVisibleTogle: {
    position: "absolute",
    right: 15,
    bottom: 120,
  },
  passwordVisibleTogleText: {
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#1B4371",
  },
  avatarContainer: {
    position: "absolute",
    top: "-15%",
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  addAvatar: {
    position: "absolute",
    right: "-10%",
    bottom: "10%",
  },
});
