import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef, useMemo } from "react";
import { StyleSheet, Text, View, Image, Button } from "react-native";
import Mapbox, { Camera, UserTrackingMode, MarkerView } from "@rnmapbox/maps";

import * as Location from "expo-location";

Mapbox.setAccessToken("public_token");

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`connecting`);
    });
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      await Location.watchPositionAsync(
        {
          // Optional: Configure options for desired accuracy, distanceFilter, etc.
          enableHighAccuracy: true,
          distanceFilter: 1, // Update location if user moves 10 meters
        },
        (location) => {
          setLocation([location.coords.longitude, location.coords.latitude]);
          socket.emit("location-update", location);
        }
      );
      socket.on("connect", () => {
        setConnectionStatus("Connected");
      });

      socket.on("connect_error", (error) => {
        setConnectionStatus("Connection Failed");
        console.log("Connection Failed", error.message);
      });
    })();
  }, []);
  console.log(`re-render`);
  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: location,
    });
  }, [location]);
  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.page}>
      <Text>{connectionStatus}</Text>
      <Button
        title="focus"
        onPress={() => {
          camera.current.flyTo(location);
        }}
      />
      <Image
        source={{
          uri: "https://i2.wp.com/genshinbuilds.aipurrjects.com/genshin/characters/furina/image.png?strip=all&quality=100",
          width: 50,
          height: 50,
        }}
        width={50}
        height={50}
      />
      <Text>{JSON.stringify(location)}</Text>
      <View style={styles.container}>
        <Mapbox.MapView style={styles.map}>
          <Camera
            ref={camera}
            followUserMode={UserTrackingMode.Follow}
            followUserLocation={true}
            followZoomLevel={15}
          ></Camera>
          {location && (
            <MarkerView
              children={
                <Image
                  source={{
                    uri: "https://i2.wp.com/genshinbuilds.aipurrjects.com/genshin/characters/furina/image.png?strip=all&quality=100",
                    width: 50,
                    height: 50,
                  }}
                  width={50}
                  height={50}
                />
              }
              coordinate={location}
            />
          )}
        </Mapbox.MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 600,
    height: 600,
  },
  map: {
    flex: 1,
  },
});
