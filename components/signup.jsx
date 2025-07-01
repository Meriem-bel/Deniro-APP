import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

const categories = [
  'Rent', 'Food', 'Bills', 'Transports', 'Education',
  'Health', 'Hangouts & Shopping', 'Subscriptions', 'Savings', 'Charity'
];

const detailedBills = ['Water', 'Electricity', 'Gas', 'Internet', 'Phone'];

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [mode, setMode] = useState('tracking');
  const [trackingValues, setTrackingValues] = useState({});
  const [rankings, setRankings] = useState({});
  const [necessary, setNecessary] = useState({});
  const [bills, setBills] = useState({});
  const [rentDeadline, setRentDeadline] = useState('');

  const handleSubmit = () => {
    if (!email || !password || !monthlyIncome || !monthlyExpenses) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return;
    }

    const data = {
      email,
      password,
      monthlyIncome: parseFloat(monthlyIncome),
      monthlyExpenses: parseFloat(monthlyExpenses),
      mode,
      ...(mode === 'tracking'
        ? { trackingValues }
        : { rankings, necessary, bills, rentDeadline }),
    };

    console.log('User Data:', data);
    navigation.replace('Login');
  };

  const handleChangeCategoryValue = (category, value) => {
    setTrackingValues({ ...trackingValues, [category]: value });
  };

  const handleRankingChange = (category, rank) => {
    setRankings({ ...rankings, [category]: rank });
  };

  const handleToggleNecessary = (category) => {
    setNecessary({ ...necessary, [category]: !necessary[category] });
  };

  const handleBillChange = (type, value) => {
    setBills({ ...bills, [type]: value });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Monthly Income (DZD)"
        keyboardType="numeric"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
      />

      <TextInput
        style={styles.input}
        placeholder="Monthly Expenses (DZD)"
        keyboardType="numeric"
        value={monthlyExpenses}
        onChangeText={setMonthlyExpenses}
      />

      <Text style={styles.subtitle}>Do you want:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={mode}
          onValueChange={(itemValue) => setMode(itemValue)}
        >
          <Picker.Item label="Tracking" value="tracking" />
          <Picker.Item label="Guidance" value="guidance" />
        </Picker>
      </View>

      {mode === 'tracking' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your usual expenses:</Text>
          {categories.map((cat) => (
            <TextInput
              key={cat}
              style={styles.input}
              placeholder={`${cat} (DZD)`}
              keyboardType="numeric"
              value={trackingValues[cat] || ''}
              onChangeText={(value) => handleChangeCategoryValue(cat, value)}
            />
          ))}
        </View>
      )}

      {mode === 'guidance' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rank categories by priority (1 = most important):</Text>
          {categories.map((cat) => (
            <TextInput
              key={cat}
              style={styles.input}
              placeholder={`${cat} Priority Rank (1-10)`}
              keyboardType="numeric"
              value={rankings[cat] || ''}
              onChangeText={(value) => handleRankingChange(cat, value)}
            />
          ))}

          <Text style={styles.sectionTitle}>Mark necessary categories:</Text>
          {categories.map((cat) => (
            <View key={cat} style={styles.checkboxContainer}>
              <Checkbox
                value={!!necessary[cat]}
                onValueChange={() => handleToggleNecessary(cat)}
                color={necessary[cat] ? '#493d8a' : undefined}
              />
              <Text style={styles.checkboxLabel}>{cat}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Detailed Bills (DZD):</Text>
          {detailedBills.map((bill) => (
            <TextInput
              key={bill}
              style={styles.input}
              placeholder={`${bill} Bill`}
              keyboardType="numeric"
              value={bills[bill] || ''}
              onChangeText={(value) => handleBillChange(bill, value)}
            />
          ))}

          <Text style={styles.sectionTitle}>Rent Deadline (day of the month):</Text>
        <View style={styles.pickerContainer}>
        <Picker
            selectedValue={rentDeadline}
            onValueChange={(value) => setRentDeadline(value)}>
        <Picker.Item label="Select a day" value="" />
        {Array.from({ length: 30 }, (_, i) => (
        <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
    ))}
        </Picker>
        </View>
        </View>
      )}

      <Button title="Sign Up" onPress={() => navigation.replace('Home')} color="#493d8a" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#d93d8a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 16,
    overflow: 'hidden',
    height: 35, // smaller height
    justifyContent: 'center',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '600',
    color: '#493d8a',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
});

