import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import API from "../../services/api";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

interface AuthResponse {
  token: string;
  user: any;
}

export default function SignupScreen() {
  const router = useRouter();
  const auth: any = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    plan: "gradual",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const onSignup = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      };

      const res = await API.post<AuthResponse>("/auth/signup", payload);
      await auth.loginUser(res.data.user, res.data.token);
      router.replace("/" as any);
    } catch (err: any) {
  console.log("FULL SIGNUP ERROR:", JSON.stringify(err, null, 2));
  console.log("ERROR RESPONSE:", err.response?.data);
  setError(err.response?.data?.message || err.message || "Signup failed");
} finally {
  setLoading(false);
}

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#888"
        style={styles.input}
        onChangeText={(v) => handleChange("name", v)}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        style={styles.input}
        onChangeText={(v) => handleChange("email", v)}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        onChangeText={(v) => handleChange("password", v)}
      />
      <TextInput
        placeholder="Age"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) => handleChange("age", v)}
      />
      <TextInput
        placeholder="Height (cm)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) => handleChange("height", v)}
      />
      <TextInput
        placeholder="Weight (kg)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) => handleChange("weight", v)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={onSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating..." : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", padding: 20 },
  title: { color: "#39FF14", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#39FF14", borderRadius: 10, padding: 12, color: "#fff", marginBottom: 12 },
  button: { backgroundColor: "#39FF14", padding: 15, borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#000", fontWeight: "bold", textAlign: "center" },
  switchText: { color: "#39FF14", marginTop: 15, textAlign: "center" },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
