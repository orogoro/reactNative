import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Image,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ImageBackground,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { authSignUp } from "../redux/auth/autnOperation";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../config";
import { uuidv4 } from "@firebase/util";

export default function RegistrationScreen({ navigation, onLayoutRootView }) {
  const initialRegisterState = {
    login: "",
    email: "",
    password: "",
  };

  const [registerFormData, setregisterFormData] = useState(initialRegisterState);
  const [formData, setformData] = useState({});
  const [isPassworHiden, setIsPassworShowing] = useState(true);
  const [togleBtnText, setTogleBtnText] = useState("Show");
  const [isShowKeyboard, setisShowKeyboard] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  const [galleryPermition, setgalleryPermition] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (userAvatar) {
      uploadUserAvatarToDb();
    } else {
      return;
    }
  }, [userAvatar]);

  const handleLoginText = (text) =>
    setregisterFormData((prevState) => ({ ...prevState, login: text }));
  const handleEmailText = (text) =>
    setregisterFormData((prevState) => ({ ...prevState, email: text }));
  const handlePasswordText = (text) =>
    setregisterFormData((prevState) => ({ ...prevState, password: text }));

  const hideKeyboard = () => {
    setisShowKeyboard(false);
    Keyboard.dismiss();
  };

  const keyboardShowing = () => {
    setisShowKeyboard(true);
  };

  const onFormSubmit = () => {
    setformData(registerFormData);
    dispatch(authSignUp(registerFormData));
    setregisterFormData(initialRegisterState);
    setisShowKeyboard(false);
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUserAvatar(result.assets[0].uri);
    }
  };
  const uploadUserAvatarToDb = async () => {
    const response = await fetch(userAvatar);
    const file = await response.blob();
    const id = uuidv4();
    const storage = getStorage(db);
    const storageRef = ref(storage, `usersAvatars/${id}`);
    const data = await uploadBytes(storageRef, file);
    const getCurrentPhoto = await getDownloadURL(ref(storage, `usersAvatars/${id}`));
    setregisterFormData((prevState) => ({ ...prevState, userAvatar: getCurrentPhoto }));
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
            marginBottom: isShowKeyboard ? -200 : 0,
          }}
        >
          <Text style={styles.registration}>Registration</Text>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Login"
              onFocus={keyboardShowing}
              onSubmitEditing={hideKeyboard}
              onChangeText={handleLoginText}
              value={registerFormData.login}
              name="Login"
              cursorColor="#FF6C00"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              onFocus={keyboardShowing}
              onSubmitEditing={hideKeyboard}
              value={registerFormData.email}
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
              value={registerFormData.password}
              onChangeText={handlePasswordText}
              cursorColor="#FF6C00"
            />
            <TouchableOpacity onPress={onFormSubmit} activeOpacity={0.7} style={styles.regBtn}>
              <Text style={styles.btnTitle}>Register</Text>
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
              navigation.navigate("Login");
            }}
            style={styles.signInLink}
          >
            Already have an account? Sign in
          </Text>
          <View style={styles.avatarContainer}>
            <Image
              style={{ width: 120, height: 120, borderRadius: 16 }}
              source={{ uri: registerFormData.userAvatar }}
            />
            <TouchableOpacity onPress={pickImage} style={styles.addAvatar}>
              <Image style={styles.addAvatar} source={require("../img/add.png")} />
            </TouchableOpacity>
          </View>
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
    paddingTop: 92,
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
