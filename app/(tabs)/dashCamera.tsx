import api_link from "@/app/config/conf/json_conf/fetch_url.json";
import registered_link from "@/app/config/conf/json_conf/registered_url.json";
import { Fetch_to, Fetch_toFile } from "@/app/utilities";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function dashCamera() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const screenWidth = Dimensions.get("window").width;
    const gradientAnim = useRef(new Animated.Value(-screenWidth)).current;
    const [showWebView, setShowWebView] = useState(false);
    const [registerUrl, setRegisterUrl] = useState("");
    const [webViewAuthToken, setWebViewAuthToken] = useState<string | null>(null);

    useEffect(() => {
        if (!isUploading) return;
        gradientAnim.setValue(-screenWidth);
        const anim = Animated.loop(
            Animated.timing(gradientAnim, {
                toValue: screenWidth,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true
            })
        );
        anim.start();
        return () => {
            anim.stop();
            gradientAnim.setValue(-screenWidth);
        };
    }, [gradientAnim, isUploading, screenWidth]);

    useEffect(() => {
        async function check() {
        const response = await Fetch_to(`${registered_link.public_domain}${api_link.jwt.verify}`, {}, undefined, undefined, undefined, true);;
        if (!response.success) return router.back();
        const email =
            response.data?.message?.final_data?.data?.[0]?.email ??
            response.data?.message?.final_data?.email ??
            response.data?.message?.email ??
            null;
        if (email) setUserEmail(email);
        }
        check();
    }, []);

    const handleLogout = async () => {
        await Fetch_to(`${registered_link.public_domain}${api_link.jwt.deauth}`);
        await SecureStore.deleteItemAsync("auth_token");
        router.back();
    };

    const handleOpenChat = async () => {
        if (isUploading) return;
        const token = await SecureStore.getItemAsync("auth_token");
        const chatUrl = `${registered_link.public_domain}${registered_link.chat}`;
        setWebViewAuthToken(token ?? null);
        setRegisterUrl(chatUrl);
        setShowWebView(true);
    };

    const handleCapture = async () => {
        if (!cameraRef.current || isCapturing || isUploading) return;

        try {
            setIsCapturing(true);
            setIsUploading(true);

            cameraRef.current?.pausePreview?.();

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                skipProcessing: true,
            });

            const upload = await Fetch_toFile(
                `${registered_link.public_domain}${api_link.lbc_image_upload}`,
                {
                    uri: photo.uri,
                    name: `capture-${Date.now()}.jpg`,
                    type: "image/jpeg",
                },
                {
                    ...(userEmail ? { email: userEmail } : {}),
                }
            );

            console.log("Upload Result:", upload);

            if (!upload.success) {
                console.error(upload.message);
                return;
            }
            const token = await SecureStore.getItemAsync("auth_token");
            const chatUrl = `${registered_link.public_domain}${registered_link.chat}`;
            setWebViewAuthToken(token ?? null);
            setRegisterUrl(chatUrl);
            setShowWebView(true);
            return;

        } catch (err) {
            console.error("Capture Upload Error:", err);
        } finally {
            cameraRef.current?.resumePreview?.();
            setIsUploading(false);
            setIsCapturing(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centered}>
                <Text style={styles.permissionText}>Camera permission is required.</Text>
                <Pressable style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Allow Camera</Text>
                </Pressable>
            </View>
        );
    }

    const handleWebViewMessage = async(event: { nativeEvent: { data: string } }) => {
        if (event.nativeEvent.data === "closeWebView") {
            setShowWebView(false);
        }
    };

    const webViewSource = webViewAuthToken
        ? { uri: registerUrl, headers: { Authorization: `Bearer ${webViewAuthToken}` } }
        : { uri: registerUrl };

    return(
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            {(isUploading) ? (
                <View style={styles.loadingOverlay}>
                    <Animated.View
                        style={[
                            styles.gradientSweep,
                            { width: screenWidth * 4 },
                            { transform: [{ translateX: gradientAnim }] }
                        ]}
                    >
                        <LinearGradient
                            colors={["#808080", "#c0c0c0", "#232323", "#c0c0c0", "#808080"]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradientFill}
                        />
                    </Animated.View>
                    <Text style={styles.loadingText}>Analyzing image...</Text>
                </View>
            ) : null}
            <View style={styles.overlay}>
                {userEmail ? <Text style={styles.emailText}>{userEmail}</Text> : null}
                <Pressable style={styles.logoutButton} onPress={() => {
                    Alert.alert("Logout", "Are you sure you want to Logout?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Logout", style: "destructive", onPress: () => handleLogout() }])
                }}>
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
            <View style={styles.captureArea}>
                <Pressable
                    style={[styles.captureButton, (isCapturing || isUploading) && styles.captureButtonDisabled]}
                    onPress={handleCapture}
                    disabled={isCapturing || isUploading}
                >
                    <View style={styles.captureInner} />
                </Pressable>
                <Pressable
                    style={[styles.chatButton, isUploading && styles.captureButtonDisabled]}
                    onPress={handleOpenChat}
                    disabled={isUploading}
                >
                    <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
                </Pressable>
            </View>

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
                }}>
                    <Text style={styles.webViewClose}>Close</Text>
                </Pressable>
                </View>
                <WebView
                source={webViewSource}
                onMessage={handleWebViewMessage}
                sharedCookiesEnabled
                thirdPartyCookiesEnabled
                />
            </View>
            </Modal>
           
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    camera: {
        flex: 1,
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
    },
    gradientSweep: {
        position: "absolute",
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    gradientFill: {
        flex: 1,
        opacity: 0.4
    },
    loadingText: {
        color: "#fff",
        fontWeight: "600",
        letterSpacing: 0.4,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12
    },
    overlay: {
        position: "absolute",
        top: 48,
        right: 16,
        alignItems: "flex-end",
        gap: 8
    },
    emailText: {
        color: "#fff",
        backgroundColor: "rgba(35, 19, 179, 0.6)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        fontWeight: "600"
    },
    captureArea: {
        position: "absolute",
        bottom: 36,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 16
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.25)"
    },
    captureButtonDisabled: {
        opacity: 0.6
    },
    captureInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#fff"
    },
    chatButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        position: "absolute",
        left: 60
    },
    logoutButton: {
        backgroundColor: "rgba(255, 0, 0, 0.6)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    logoutText: {
        color: "#fff",
        fontWeight: "600"
    },
    permissionText: {
        color: "#333"
    },
    permissionButton: {
        backgroundColor: "#213b94",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8
    },
    permissionButtonText: {
        color: "#fff",
        fontWeight: "600"
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