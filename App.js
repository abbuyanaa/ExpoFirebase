import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import * as Firebase from "firebase";
import * as ImagePicker from "expo-image-picker";

import { firebaseConfig } from "./firebase";

export default function App() {
  if (!Firebase.apps.length) {
    Firebase.initializeApp(firebaseConfig);
  }

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "android") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", image, true);
      xhr.send(null);
    });

    const ref = Firebase.storage().ref().child(new Date().toISOString());
    const snapshot = ref.put(blob);

    snapshot.on(
      Firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setUploading(true);
      },
      (error) => {
        setUploading(false);
        console.log(error);
        // blob.clear();
        return;
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setUploading(false);
          console.log("Download uri: ", url);
          // blob;
          return uri;
        });
      }
    );
  };

  return (
    <View style={styles.container}>
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 150 }} />
      )}
      <Button title="Choose Picture" onPress={pickImage} />
      {!uploading ? (
        <Button title="Upload" onPress={uploadImage} />
      ) : (
        <ActivityIndicator size="large" color="#000" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
