import { View, Text } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

export const BalanceCard = ({ summary }) => {
  const balance = parseFloat(summary?.balance || 0).toFixed(2);
  const income = parseFloat(summary?.income || 0).toFixed(2);
  const expenses = Math.abs(parseFloat(summary?.expenses || 0)).toFixed(2);

  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Total Balance</Text>
      <Text style={styles.balanceAmount}>₹{balance}</Text>
      <View style={styles.balanceStats}>
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>Income</Text>
          <Text style={[styles.balanceStatAmount, { color: COLORS.income }]}>
            +₹{income}
          </Text>
        </View>
        <View style={[styles.balanceStatItem, styles.statDivider]} />
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>Expenses</Text>
          <Text style={[styles.balanceStatAmount, { color: COLORS.expense }]}>
            -₹{expenses}
          </Text>
        </View>
      </View>
    </View>
  );
};
