import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

interface AuthResponse {
  token: string;
  user: any;
}

export default function LoginScreen() {
  const router = useRouter();
  const auth: any = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post<AuthResponse>("/auth/login", { email, password });
      await auth.loginUser(res.data.user, res.data.token);
      router.replace("/" as any);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LastPuff Login</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry onChangeText={setPassword} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>

      <Link href="/auth/signup"><Text style={styles.switchText}>Create an account</Text></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", padding: 20 },
  title: { color: "#39FF14", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#39FF14", padding: 12, borderRadius: 10, marginBottom: 12, color: "#fff" },
  button: { backgroundColor: "#39FF14", padding: 15, borderRadius: 10 },
  buttonText: { color: "#000", fontWeight: "bold", textAlign: "center" },
  switchText: { color: "#39FF14", marginTop: 15, textAlign: "center" },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
