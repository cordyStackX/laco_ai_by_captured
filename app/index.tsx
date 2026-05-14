import React from "react";
import { View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return(
    <View style={styles.container} >
      <Button  title="sign in"  onPress={() => {router.push("/signin")}}/>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }
})