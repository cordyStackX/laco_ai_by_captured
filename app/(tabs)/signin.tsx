import { IMAGES } from "@/app/config";
import api_link from "@/app/config/conf/json_conf/fetch_url.json";
import registered_link from "@/app/config/conf/json_conf/registered_url.json";
import { Fetch_to } from "@/app/utilities";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { WebView } from "react-native-webview";

export default function Signin() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "", password: ""
  })
  const [status, setStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerUrl, setRegisterUrl] = useState("");
  const [webViewAuthToken, setWebViewAuthToken] = useState<string | null>(null);
  const [webViewNeedsAuth, setWebViewNeedsAuth] = useState(false);

  useEffect(() => {
    async function check() {
      const response = await Fetch_to(`${registered_link.public_domain}${api_link.jwt.verify}`, {}, undefined, undefined, undefined, true);
      if (response.success) return router.push("/(tabs)/dashCamera");
    }
    check();
  }, []);

  const handleSubmit = async () => {
    if (loading) return;

    setStatus(false);
    setMessage("");

    if (form.email === "admin@admin.com") {
      setStatus(true);
      setMessage("Admin only allowed to Login in the web browser.");
      return;
    }

    if (form.email === "" || form.password === "") {
      setStatus(true);
      setMessage("Email and password are required.");
      return;
    }

    setLoading(true);
    const status = await Fetch_to(`${registered_link.public_domain}${api_link.check_status}`, { email: form.email });
    if (!status.success) {
      setStatus(true);
      setMessage(status.message);
      setLoading(false);
      return;
    }

    const response = await Fetch_to(`${registered_link.public_domain}${api_link.signin}`, form);
    if (!response.success) {
      setStatus(true);
      setMessage(response.message);
      setLoading(false);
      return;
    }

    const check_code = await Fetch_to(`${registered_link.public_domain}${api_link.checkcode}`, { email: form.email });
    if (check_code.success) {
      setShowWebView(true);
      setWebViewNeedsAuth(true);
      setWebViewAuthToken(await SecureStore.getItemAsync("auth_token"));
      setRegisterUrl(`${registered_link.public_domain}${registered_link.auth}${form.email}`);
    } else {
      setStatus(true);
      setMessage(check_code.message);
      setLoading(false);
      return;
    }

  };

  const handleWebViewMessage = async(event: { nativeEvent: { data: string } }) => {
    if (event.nativeEvent.data === "closeWebView") {
      setShowWebView(false);
    } else {
      const code = event.nativeEvent.data;
      
      const response = await Fetch_to(`${registered_link.public_domain}${api_link.checkcode}`, { email: form.email, code: code, key: "confirm_code" });
      if(response.success) {
        setLoading(false);
        setShowWebView(false);
        const auth = await Fetch_to(`${registered_link.public_domain}${api_link.jwt.auth}`, { email: form.email });
        const token = auth.data?.token;
        if (auth.success && typeof token === "string") {
          await SecureStore.setItemAsync("auth_token", token);
          router.push("/(tabs)/dashCamera");
          Alert.alert("Sign in Successfully");
        }
        return;
      } else {
        setStatus(true);
        setMessage(response.message);
        setLoading(false);
        setShowWebView(false);
        return;
      }
      
    }
  };

  const webViewSource = webViewNeedsAuth && webViewAuthToken
    ? { uri: registerUrl, headers: { Authorization: `Bearer ${webViewAuthToken}` } }
    : { uri: registerUrl };

  return (
    
    <View style={styles.container}>
      <View style={styles.logoContainer} >
        <Image source={IMAGES.logo} style={styles.logo} />
        <Text style={styles.logoText} >LACO by Captured</Text>
      </View>
      <View style={styles.inputWrapper}>
          <TextInput
          style={[styles.input, status ? styles.Error : null]}
          value={form.email}
          onChangeText={(text) => {
            setForm((prev) => ({ ...prev, email: text }));
          }}
          placeholder="Enter your email"
          placeholderTextColor="#9aa0a6"
          autoComplete="email"
          />
          <TextInput
          style={[styles.input, status ? styles.Error : null]}
          value={form.password}
          onChangeText={(text) => {
            setForm((prev) => ({ ...prev, password: text }));
          }}
          placeholder="Enter your password"
          placeholderTextColor="#9aa0a6"
          secureTextEntry={true}
          autoComplete="password"
          />
      </View>
      {status ? (
        <Text style={styles.message} > {message} </Text>
      ) : null}
      
      <View style={styles.buttonWrapper}>
        
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SIGN IN</Text>
            )}
          </Pressable>
        </View>

      </View>
      <Pressable onPress={() => {
        setShowWebView(true);
        setWebViewNeedsAuth(false);
        setWebViewAuthToken(null);
        setRegisterUrl(`${registered_link.public_domain}${registered_link.register}`);
      }}>
        <Text style={styles.registerLink}>Register</Text>
      </Pressable>
      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWebView(false)}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Pressable onPress={() => {
              Alert.alert("Close", "Are you sure you want to exit?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Close", style: "destructive", onPress: () => setShowWebView(false) }
              ]);
              setLoading(false);
            }}>
              <Text style={styles.webViewClose}>Close</Text>
            </Pressable>
          </View>
          <WebView
            source={webViewSource}
            onMessage={handleWebViewMessage}
          />
        </View>
      </Modal>
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
    borderColor: "#213b94",
    borderWidth: 2,
    width: "80%",
    margin: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    overflow: "hidden"
  },
  logoContainer: {
    width: "100%",
    height: "auto",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 5,
    resizeMode: "contain"
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#808080"
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
    height: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  Error: {
    borderColor: "#f00"
  },
  message: {
    color: "#f00",
    marginTop: 20
  },
  buttonContainer: {
    width: "80%",
    borderRadius: 12,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android shadow
    elevation: 5
  },
  button: {
    backgroundColor: "#213b94",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  buttonPressed: {
    opacity: Platform.OS === "ios" ? 0.8 : 1
  },
  buttonDisabled: {
    opacity: 0.7
  },
  registerLink: {
    color: "#213b94",
    fontWeight: "600",
    marginTop: 0
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  webViewHeader: {
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5"
  },
  webViewClose: {
    color: "#213b94",
    fontWeight: "600"
  }
})
