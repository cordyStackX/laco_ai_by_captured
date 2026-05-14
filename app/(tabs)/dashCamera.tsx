import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import registered_link from "@/app/config/conf/json_conf/registered_url.json";
import api_link from "@/app/config/conf/json_conf/fetch_url.json";
import { Fetch_to } from "@/app/utilities";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export default function dashCamera() {
    const router = useRouter();

    useEffect(() => {
        async function check() {
        const response = await Fetch_to(`${registered_link.public_domain}${api_link.jwt.verify}`, {}, undefined, undefined, undefined, true);;
        if (!response.success) return router.back();
        }
        check();
    }, []);

    return(
        <View style={styles.container} >
            <Text onPress={async() => {
                await Fetch_to(`${registered_link.public_domain}${api_link.jwt.deauth}`);
                await SecureStore.deleteItemAsync("auth_token");
                router.back();
            }}>if You see cordy well done click me to logout</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    }
})