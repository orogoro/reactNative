import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { PinchGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { uuidv4 } from "@firebase/util";
import { Camera, CameraType, FlashMode } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../../config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { store } from "../../config";
import Slider from "@react-native-community/slider";

export default function CreatePostScreen({ navigation }) {
  // ===============Camera settings=======================================
  const [zoomValue, setZoomValue] = useState(0);
  const [range, setrange] = useState(0.03);
  const [cameraData, setcameraData] = useState();
  const [photo, setphoto] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  // =======================================================================
  const [hasPermission, setHasPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [allPermissionsChecked, setlocationPermissions] = useState(true);
  const [postData, setpostData] = useState({});
  const [photoAction, setphotoAction] = useState("Load photo");
  const [isCreateBtnDisabled, setisCreateBtnDisabled] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const { userId, userName } = useSelector((state) => state.auth);

  // =========================Pinching actions=================================
  const AnimatedImage = Animated.createAnimatedComponent(Image);

  const scale = useSharedValue(1);

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(1);
    },
  });
  const rStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });
  // =============================================================================

  useEffect(() => {
    (async () => {
      setlocationPermissions(false);
      // ======================Location actions===================================
      const { status: locationPermission } = await Location.requestForegroundPermissionsAsync();

      if (locationPermission !== "granted") {
        Alert.alert("No access to location", "Please, give permission and reload App", [
          {
            text: "Cancel",
            onPress: () => setlocationPermissions(true),
            style: "cancel",
          },
          {
            text: "Go to settings",
            onPress: () => {
              setlocationPermissions(true);
              return Linking.openURL("app-settings:");
            },
          },
        ]);
      } else {
        const { coords } = await Location.getCurrentPositionAsync({});

        setLocation(coords);
        setlocationPermissions(true);
      }
      // =================================================================================
      // =======================Camera actions============================================
      const { status } = await Camera.requestCameraPermissionsAsync();

      if (status === "granted") {
        setHasPermission("granted");
      }
      // =================================================================================
    })();
  }, []);

  if (!allPermissionsChecked) {
    return (
      <View style={{ paddingTop: 100 }}>
        <ActivityIndicator color="#FF6C00" size={"large"} />
        <Text style={{ textAlign: "center", marginTop: 15 }}>Get current location...</Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Please, give permission on your settings </Text>
        <TouchableOpacity onPress={() => Linking.openURL("app-settings:")}>
          <Text style={styles.goToSettingsLink}>Go to settings</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (hasPermission === false) {
    Alert.alert("No access to camera", "Please, give permission", [
      {
        text: "Cancel",
        onPress: () => {
          return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text>Please, give permission on your settings </Text>
              <TouchableOpacity onPress={() => Linking.openURL("app-settings:")}>
                <Text style={styles.goToSettingsLink}>Go to settings</Text>
              </TouchableOpacity>
            </View>
          );
        },
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          return Linking.openURL("app-settings:");
        },
      },
    ]);
    return;
  }

  const takePhoto = async () => {
    const photo = await cameraData.takePictureAsync();

    setphoto(photo.uri);
    setpostData((prevState) => ({
      ...prevState,
      postPhoto: photo.uri,
    }));

    setphotoAction("Edit photo");
    setisCreateBtnDisabled(false);
  };

  const crestePost = () => {
    uploadPostToServer();
    if (photo) {
      navigation.navigate("Posts");
      setpostData({});
      setphoto(null);
      setphotoAction("Load photo");
      setisCreateBtnDisabled(true);
    }
  };
  const uploadPostToServer = async () => {
    try {
      const photo = await uploadPhotoToServer();

      const docRef = await addDoc(collection(store, "posts"), {
        userId,
        userName,
        photo,
        location,
        postMessage: postData.postName || "",
        postLocation: postData.postLocation || "",
        date: Date.now(),
        private: isEnabled,
        commentAmount: 0,
      });
    } catch (error) {
      console.log(error);
    }
  };
  const uploadPhotoToServer = async () => {
    const response = await fetch(photo);
    const file = await response.blob();
    const id = uuidv4();

    const storage = getStorage(db);
    const storageRef = ref(storage, `postImage/${id}`);

    await uploadBytes(storageRef, file);

    const getCurrentPhoto = await getDownloadURL(ref(storage, `postImage/${id}`));
    return getCurrentPhoto;
  };
  // =================Buttons and inputs actions================================================
  const takeNewPhoto = () => {
    setphoto(null);
    setphotoAction("Load photo");
    setisCreateBtnDisabled(true);
  };
  const handlePostName = (text) => {
    setpostData((prevState) => ({ ...prevState, postName: text }));
  };
  const handlePostLocation = (text) => {
    setpostData((prevState) => ({ ...prevState, postLocation: text }));
  };
  const handleCameraFlip = () => {
    if (cameraType === CameraType.back) {
      setCameraType(CameraType.front);
    } else {
      setCameraType(CameraType.back);
    }
  };
  const handleCameraFlashMode = () => {
    if (flashMode === FlashMode.off) {
      setFlashMode(FlashMode.on);
    } else {
      setFlashMode(FlashMode.off);
    }
  };
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  // =============================================================================================

  return (
    <View style={{ height: "100%", borderWidth: 0, borderRadius: 8 }}>
      {!photo ? (
        <Camera
          zoom={zoomValue}
          flashMode={flashMode}
          ref={setcameraData}
          type={cameraType}
          style={styles.camera}
        >
          <View style={styles.topBtnContainer}>
            <TouchableOpacity onPress={handleCameraFlashMode} style={styles.flashbtn}>
              <Entypo
                name="flash"
                size={25}
                color={flashMode === FlashMode.on ? "yellow" : "white"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCameraFlip} style={styles.flipCameraBtn}>
              <MaterialCommunityIcons name="camera-flip-outline" size={25} color="white" />
            </TouchableOpacity>
          </View>
          <Slider
            style={styles.zoomSlider}
            value={0}
            minimumValue={0}
            maximumValue={1}
            step={range}
            minimumTrackTintColor="gold"
            maximumTrackTintColor="grey"
            onValueChange={(value) => setZoomValue(value)}
          />
          <View style={styles.bottomBtnContainer}>
            <TouchableOpacity onPress={takePhoto} style={styles.cameraBtn}>
              <Ionicons name="md-camera-sharp" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <ScrollView showsVerticalScrollIndica style={styles.container}>
          <View style={{ paddingBottom: 25, height: "100%" }}>
            <View style={styles.photoContainer}>
              <PinchGestureHandler onGestureEvent={pinchHandler}>
                <AnimatedImage
                  style={[{ width: "100%", height: "100%", resizeMode: "contain" }, rStyle]}
                  source={{ uri: photo }}
                />
              </PinchGestureHandler>
            </View>

            <Text style={styles.photoActionText}>{photoAction}</Text>
            <View style={styles.inputsContainer}>
              <TextInput
                onChangeText={handlePostName}
                placeholderTextColor={"#BDBDBD"}
                style={styles.nameInput}
                placeholder="Name..."
                value={postData.postName}
                cursorColor="#FF6C00"
              ></TextInput>
              <TextInput
                onChangeText={handlePostLocation}
                placeholderTextColor={"#BDBDBD"}
                style={styles.locationInput}
                placeholder="Location..."
                value={postData.postLocation}
                cursorColor="#FF6C00"
              ></TextInput>

              <EvilIcons
                style={{ position: "absolute", top: 80, left: -5 }}
                name="location"
                size={30}
                color="#BDBDBD"
              />
              <View style={styles.switchContainer}>
                <Text>Public</Text>
                <Switch
                  style={{ marginHorizontal: 15 }}
                  trackColor={{ false: "#767577", true: "#eef0eb" }}
                  thumbColor={isEnabled ? "#FF6C00" : "#eef0eb"}
                  ios_backgroundColor="#e0dfdc"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
                <Text>Private</Text>
              </View>

              <TouchableOpacity
                disabled={isCreateBtnDisabled}
                onPress={crestePost}
                style={isCreateBtnDisabled ? styles.disabledCreatePostBtn : styles.createPostBtn}
              >
                <Text
                  style={{
                    ...styles.createPostBtnText,
                    color: !isCreateBtnDisabled ? "white" : "#BDBDBD",
                  }}
                >
                  Create Post
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              disabled={isCreateBtnDisabled}
              onPress={takeNewPhoto}
              style={styles.deletePhoto}
            >
              <AntDesign name="delete" size={20} color="#BDBDBD" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: "white",
    paddingBottom: 25,
  },
  camera: {
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cameraBtn: {
    position: "relative",
    marginBottom: 20,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  topBtnContainer: {
    width: "100%",
    flexDirection: "row-reverse",
  },
  bottomBtnContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  flashbtn: {
    marginRight: "auto",
    padding: 15,
  },
  flipCameraBtn: {
    padding: 15,
  },
  photoContainer: {
    width: "100%",
    height: 300,
    overflow: "hidden",
  },
  zoomSlider: { transform: [{ rotate: "-90deg" }, { translateY: 160 }], width: 250, height: 20 },
  photoActionText: {
    fontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#BDBDBD",
    marginTop: 8,
  },
  inputsContainer: {
    marginTop: 32,
    marginBottom: 120,
  },
  nameInput: {
    fontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD",
    marginBottom: 16,
    height: 50,
  },
  locationInput: {
    fontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD",
    height: 50,
    paddingLeft: 30,
  },
  createPostBtn: {
    paddingHorizontal: "auto",
    paddingVertical: 16,
    backgroundColor: "#FF6C00",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 50,
  },
  disabledCreatePostBtn: {
    paddingHorizontal: "auto",
    paddingVertical: 16,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 50,
  },
  createPostBtnText: {
    ontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#BDBDBD",
  },
  deletePhoto: {
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 23,
    paddingVertical: 8,
    width: 70,
    alignItems: "center",
    borderRadius: 30,
  },
  switchContainer: {
    marginTop: 25,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  goToSettingsLink: {
    fontSize: 20,
    marginTop: 20,
    color: "#349eeb",
  },
});
