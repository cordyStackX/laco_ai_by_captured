import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

export default function Index() {
  const [form, setForm] = useState({
    email: "", password: ""
  })

  const handleSubmit = () => {
    alert(form.email)
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
          <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(text) => {
            setForm((prev) => ({ ...prev, email: text }));
          }}
          placeholder="Enter your email"
          />
          <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(text) => {
            setForm((prev) => ({ ...prev, password: text }));
          }}
          placeholder="Enter your password"
          secureTextEntry={true}
          />
      </View>
      

      <View style={styles.buttonWrapper}>
        <View style={styles.buttonContainer}>
          <Button title="sign in" onPress={handleSubmit} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="register" onPress={handleSubmit} />
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    borderColor: "#000",
    borderWidth: 1,
    width: "80%",
    margin: 10,
    borderRadius: 8
  },
  buttonWrapper: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  inputWrapper: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    margin: 0
  },
  buttonContainer: {
    width: "38%",
    margin: 5,
    borderRadius: 8,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android shadow
    elevation: 5
  }
})
