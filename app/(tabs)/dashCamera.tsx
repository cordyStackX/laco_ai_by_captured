import api_link from "@/app/config/conf/json_conf/fetch_url.json";
import registered_link from "@/app/config/conf/json_conf/registered_url.json";
import { Fetch_to } from "@/app/utilities";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export default function dashCamera() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        async function check() {
        const response = await Fetch_to(`${registered_link.public_domain}${api_link.jwt.verify}`, {}, undefined, undefined, undefined, true);;
        if (!response.success) return router.back();
        }
        check();
    }, []);

    const handleLogout = async () => {
        await Fetch_to(`${registered_link.public_domain}${api_link.jwt.deauth}`);
        await SecureStore.deleteItemAsync("auth_token");
        router.back();
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

    return(
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" />
            <View style={styles.overlay}>
                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    camera: {
        flex: 1
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
        right: 16
    },
    logoutButton: {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    }
})