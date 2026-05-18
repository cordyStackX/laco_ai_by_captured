import { Asset } from "expo-asset";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const imageAssets = [
  require("../assets/images/favicon.png"),
  require("../assets/images/icon.png"),
  require("../assets/images/logo3.png"),
  require("../assets/images/splash-icon.png")
];

export default function Index() {
  const router = useRouter();
  const title = "Laco By Capture";
  const letterAnims = useRef(title.split("").map(() => new Animated.Value(0))).current;
  const [loadedCount, setLoadedCount] = useState(0);
  const totalCount = imageAssets.length;

  useEffect(() => {
    let isActive = true;
    const preloadAndGo = async () => {
      try {
        const assets = imageAssets.map((asset) => Asset.fromModule(asset));
        await Promise.all(
          assets.map(async (asset) => {
            await asset.downloadAsync();
            if (isActive) {
              setLoadedCount((prev) => prev + 1);
            }
          })
        );
      } catch (error) {
        console.warn("Image prefetch failed", error);
      } finally {
        if (isActive) {
          setTimeout(() => {
            router.push("/signin");
          }, 3000);
        }
      }
    };
    preloadAndGo();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const animations = letterAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 420,
        delay: index * 90,
        useNativeDriver: true
      })
    );
    Animated.stagger(60, animations).start();
  }, [letterAnims]);

  return(
    <View style={styles.container} >
      <View style={styles.titleRow}>
        {title.split("").map((letter, index) => (
          <Animated.Text
            key={`${letter}-${index}`}
            style={[
              styles.titleLetter,
              {
                opacity: letterAnims[index],
                transform: [
                  {
                    translateX: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.statusWrapper}>
        <Text style={styles.statusText}>Loading assets {loadedCount}/{totalCount}</Text>
        <View style={styles.statusBarTrack}>
          <View
            style={[
              styles.statusBarFill,
              { width: `${Math.round((loadedCount / Math.max(totalCount, 1)) * 100)}%` }
            ]}
          />
        </View>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8eef5"
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  titleLetter: {
    fontSize: 32,
    fontWeight: "700",
    color: "#213b94",
    letterSpacing: 1.2
  },
  statusWrapper: {
    marginTop: 18,
    alignItems: "center",
    gap: 8
  },
  statusText: {
    fontSize: 12,
    color: "#5a6b82",
    letterSpacing: 0.4
  },
  statusBarTrack: {
    width: 220,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#d5dce6",
    overflow: "hidden"
  },
  statusBarFill: {
    height: "100%",
    backgroundColor: "#213b94"
  }
})