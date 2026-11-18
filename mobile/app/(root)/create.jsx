import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { API_URL } from "../../constants/api";
import { styles } from "../../assets/styles/create.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = [
  { id: "food", name: "Food & Drinks", icon: "fast-food" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "transportation", name: "Transportation", icon: "car" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "bills", name: "Bills", icon: "receipt" },
  { id: "income", name: "Income", icon: "cash" },
  { id: "other", name: "Other", icon: "ellipsis-horizontal" },
];

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigateBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleCreate = async () => {
    setError("");

    // validations
    if (!title.trim()) {
      const msg = "Please enter a transaction title";
      setError(msg);
      if (Platform.OS !== "web") Alert.alert("Error", msg);
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      const msg = "Please enter a valid positive amount";
      setError(msg);
      if (Platform.OS !== "web") Alert.alert("Error", msg);
      return;
    }

    if (!selectedCategory) {
      const msg = "Please select a category";
      setError(msg);
      if (Platform.OS !== "web") Alert.alert("Error", msg);
      return;
    }

    if (!user?.id) {
      const msg = "User authentication is still loading. Please try again.";
      setError(msg);
      if (Platform.OS !== "web") Alert.alert("Error", msg);
      return;
    }

    setIsLoading(true);
    try {
      // Format the amount (negative for expenses, positive for income)
      const formattedAmount = isExpense
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          title: title.trim(),
          amount: formattedAmount,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to create transaction");
      }

      if (Platform.OS !== "web") {
        Alert.alert("Success", "Transaction created successfully");
      }
      navigateBack();
    } catch (err) {
      const errMsg = err.message || "Failed to create transaction";
      setError(errMsg);
      if (Platform.OS !== "web") {
        Alert.alert("Error", errMsg);
      }
      console.error("Error creating transaction:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, Platform.OS === "web" && { maxWidth: 640, width: "100%", alignSelf: "center" }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, Platform.OS === "web" && { cursor: "pointer" }]}
          onPress={navigateBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <TouchableOpacity
          style={[
            styles.saveButtonContainer,
            isLoading && styles.saveButtonDisabled,
            Platform.OS === "web" && { cursor: isLoading ? "not-allowed" : "pointer" },
          ]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {error ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FEE2E2",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                gap: 8,
              }}
            >
              <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
              <Text style={{ flex: 1, color: COLORS.expense, fontSize: 14 }}>{error}</Text>
              <TouchableOpacity
                onPress={() => setError("")}
                style={Platform.OS === "web" && { cursor: "pointer" }}
              >
                <Ionicons name="close" size={20} color={COLORS.expense} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.typeSelector}>
            {/* EXPENSE SELECTOR */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                isExpense && styles.typeButtonActive,
                Platform.OS === "web" && { cursor: "pointer" },
              ]}
              onPress={() => setIsExpense(true)}
            >
              <Ionicons
                name="arrow-down-circle"
                size={22}
                color={isExpense ? COLORS.white : COLORS.expense}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeButtonText, isExpense && styles.typeButtonTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>

            {/* INCOME SELECTOR */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                !isExpense && styles.typeButtonActive,
                Platform.OS === "web" && { cursor: "pointer" },
              ]}
              onPress={() => setIsExpense(false)}
            >
              <Ionicons
                name="arrow-up-circle"
                size={22}
                color={!isExpense ? COLORS.white : COLORS.income}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* AMOUNT CONTAINER */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.textLight}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* INPUT CONTAINER */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="create-outline"
              size={22}
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Transaction Title"
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* TITLE */}
          <Text style={styles.sectionTitle}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.text} /> Category
          </Text>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonActive,
                    Platform.OS === "web" && { cursor: "pointer" },
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={isSelected ? COLORS.white : COLORS.text}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      isSelected && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CreateScreen;
