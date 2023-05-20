import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { store } from "../../config";
import { useEffect, useState } from "react";
import { EvilIcons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { userLogOut, updateuserAvatar } from "../../redux/auth/autnOperation";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../config";
import { uuidv4 } from "@firebase/util";

export default function ProfileScreen({ navigation }) {
  const defaultAvatar =
    "https://www.charlotteathleticclub.com/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png";
  const [userPostsData, setuserPostsData] = useState(null);
  const [newUserAvatar, setNewUserAvatar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImg, setcurrentImg] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const dispatch = useDispatch();
  const { userId, userName, userAvatar } = useSelector((state) => state.auth);

  const getCurrentUserPosts = async () => {
    try {
      const q = query(collection(store, "posts"), where("userId", "==", userId));
      onSnapshot(q, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        setuserPostsData(data);
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCurrentUserPosts();
    if (newUserAvatar) {
      uploadNewUserAvatarToDb();
    }
  }, [newUserAvatar]);

  const createThreeButtonAlert = async (postId) =>
    Alert.alert("A you sure?", "Delete", [
      {
        text: "Cancel",
        onPress: () => {
          return;
        },
        style: "cancel",
      },
      { text: "OK", onPress: () => deleteDoc(doc(store, "posts", `${postId}`)) },
    ]);

  const handleCommentsShow = (photo, id, currentUserId, commentAmount) => {
    navigation.navigate("Comments", { photo, id, currentUserId, commentAmount });
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewUserAvatar(result.assets[0].uri);
    }
  };
  const handleShowFullSizeImg = (img) => {
    setisLoading(true);
    setcurrentImg(img);
    setModalVisible(true);
  };
  const uploadNewUserAvatarToDb = async () => {
    const response = await fetch(newUserAvatar);
    const file = await response.blob();
    const id = uuidv4();
    const storage = getStorage(db);
    const storageRef = ref(storage, `usersAvatars/${id}`);
    const data = await uploadBytes(storageRef, file);
    const getCurrentPhoto = await getDownloadURL(ref(storage, `usersAvatars/${id}`));

    dispatch(updateuserAvatar({ getCurrentPhoto }));
  };
  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.bgrImg}
        source={require("../../assets/img/Photo_BG.jpg")}
      ></ImageBackground>
      <View style={styles.profileInfo}>
        <TouchableOpacity style={styles.logOutBtn} onPress={() => dispatch(userLogOut())}>
          <MaterialIcons name="logout" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <Text style={styles.profileName}>{userName}</Text>
        <View style={styles.avatarContainer}>
          <Image
            style={{ width: 120, height: 120, borderRadius: 16 }}
            source={{ uri: userAvatar ? userAvatar : defaultAvatar }}
          />
          <TouchableOpacity onPress={pickImage} style={styles.addAvatar}>
            <Image style={styles.addAvatar} source={require("../../img/add.png")} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        style={styles.postsList}
        data={userPostsData}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            <TouchableOpacity
              onPress={() => createThreeButtonAlert(item.id)}
              style={styles.deletePostBtn}
            >
              <MaterialIcons
                style={{ textAlign: "center" }}
                name="delete-forever"
                size={20}
                color="#BDBDBD"
              />
            </TouchableOpacity>
            <Pressable onPress={() => handleShowFullSizeImg(item.photo)}>
              <Image source={{ uri: item.photo }} style={styles.postImg} />
            </Pressable>

            <Text>{item.postMessage}</Text>
            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    handleCommentsShow(item.photo, item.id, item.userId, item.commentAmount)
                  }
                >
                  {item.commentAmount > 0 ? (
                    <FontAwesome name="comment" size={20} color="#FF6C00" />
                  ) : (
                    <FontAwesome name="comment-o" size={20} color="#BDBDBD" />
                  )}
                </TouchableOpacity>
                <Text
                  style={{
                    ...styles.commentAmountNumber,
                    color: item.commentAmount > 0 ? "#212121" : "#BDBDBD",
                  }}
                >
                  {item.commentAmount}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                }}
              >
                {item.location !== null && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Map", {
                        latitude: item.location.latitude,
                        longitude: item.location.longitude,
                      })
                    }
                  >
                    <EvilIcons name="location" size={24} color="#BDBDBD" />
                  </TouchableOpacity>
                )}

                <Text style={styles.postLocationText}>{item.postLocation}</Text>
              </View>
            </View>
            <Modal
              onShow={() => setisLoading(false)}
              animationType="fade"
              transparent={false}
              visible={modalVisible}
            >
              <Pressable onPress={() => setModalVisible(!modalVisible)}>
                {isLoading && (
                  <ActivityIndicator
                    style={{ alignItems: "center", marginTop: 100 }}
                    color="#FF6C00"
                    size="large"
                  ></ActivityIndicator>
                )}
                <Image source={{ uri: currentImg }} style={styles.fullSizeImg} />
              </Pressable>
            </Modal>
          </View>
        )}
      ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    height: "100%",
  },
  profileInfo: {
    alignItems: "center",
    backgroundColor: "white",
    paddingBottom: 15,
    paddingTop: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  avatarContainer: {
    position: "absolute",
    top: "-55%",
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  logOutBtn: {
    marginLeft: "auto",
    paddingRight: 40,
    marginBottom: 45,
  },
  profileName: {
    fontFamily: "Roboto-Bold",
    fontWeight: "500",
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: 0.01,
    color: "#212121",
    textAlign: "center",
  },
  postsList: {
    backgroundColor: "white",
    height: "100%",
    paddingTop: 15,
  },
  postItem: {
    marginBottom: 34,
    borderRadius: 15,
    marginLeft: "auto",
    marginRight: "auto",
  },
  postImg: {
    width: 360,
    height: 240,
    borderRadius: 10,
    marginBottom: 8,
  },
  commentAmountNumber: {
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 10,
  },
  postLocationText: {
    fontFamily: "Roboto-Regulat",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    textDecorationLine: "underline",
    marginLeft: 5,
  },
  deletePostBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 50,
    justifyContent: "center",
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#BDBDBD",
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
  addAvatar: {
    position: "absolute",
    right: "-10%",
    bottom: "10%",
  },
  fullSizeImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
