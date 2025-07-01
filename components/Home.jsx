import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const categories = [
  'Rent', 'Food', 'Bills', 'Transports', 'Education',
  'Health', 'Hangouts & Shopping', 'Subscriptions', 'Savings', 'Charity'
];

const generateId = () => Math.random().toString(36).substring(2, 9);

// Get the debugger host (e.g., '192.168.1.5:19000')
const debuggerHost = Constants.manifest?.debuggerHost?.split(':').shift();

// Use this for your backend URL
const BACKEND_URL = `http://${debuggerHost}:5000/ask_chatbot`;

export default function Home({ navigation }) {
  const [monthlyIncome] = useState(3000);
  const [expenses, setExpenses] = useState([]);
  const [deadlines, setDeadlines] = useState([
    { id: 'rent', name: 'Rent', status: 'missing', dueDate: '30-07-2025' },
  ]);

  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [addDeadlineModalVisible, setAddDeadlineModalVisible] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [chatbotModalVisible, setChatbotModalVisible] = useState(false);

  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newDeadlineName, setNewDeadlineName] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [streakDays] = useState(12);
  const [tokens] = useState(172);

  const [messages, setMessages] = useState([
    { id: generateId(), text: "Hi! I'm your financial assistant. How can I help?", sender: 'bot' },
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);
  const flatListRef = useRef(null);

  const totalExpensesToday = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const remainingBalance = monthlyIncome - totalExpensesToday;

  useEffect(() => {
    if (chatbotModalVisible && flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, chatbotModalVisible]);

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!selectedCategory) {
      Alert.alert('No Category Selected', 'Please select a category for your expense.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for the amount.');
      return;
    }
    if (amount > remainingBalance) {
      Alert.alert('Insufficient Funds', "You don't have enough remaining balance for this expense.");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      amount: amount,
      category: selectedCategory,
    };
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    if (selectedCategory === 'Rent') {
      setDeadlines(prevDeadlines =>
        prevDeadlines.map(d => d.name === 'Rent' ? { ...d, status: 'done' } : d)
      );
    }
    setAddExpenseModalVisible(false);
    setExpenseAmount('');
    setSelectedCategory(null);
  };

  const handleRemoveExpense = (idToRemove) => {
    Alert.alert(
      "Remove Expense?",
      "Are you sure you want to remove this expense from your log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            const expenseToRemove = expenses.find(item => item.id === idToRemove);
            if (expenseToRemove && expenseToRemove.category === 'Rent') {
              setDeadlines(prevDeadlines =>
                prevDeadlines.map(d =>
                  d.name === 'Rent' ? { ...d, status: 'missing' } : d
                )
              );
            }
            setExpenses(expenses.filter(item => item.id !== idToRemove));
            Alert.alert("Removed!", "Expense has been removed from your log.");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleAddDeadline = () => {
    if (!newDeadlineName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for the deadline.');
      return;
    }
    const day = newDeadlineDate.getDate().toString().padStart(2, '0');
    const month = (newDeadlineDate.getMonth() + 1).toString().padStart(2, '0');
    const year = newDeadlineDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const newDeadline = {
      id: Date.now().toString(),
      name: newDeadlineName,
      status: 'missing',
      dueDate: formattedDate,
    };
    setDeadlines(prevDeadlines => [...prevDeadlines, newDeadline]);
    setAddDeadlineModalVisible(false);
    setNewDeadlineName('');
    setNewDeadlineDate(new Date());
    Alert.alert('Success', 'New deadline has been added!');
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newDeadlineDate;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setNewDeadlineDate(currentDate);
  };

  const handleSendMessage = async () => {
    if (!chatbotInput.trim()) return;

    const userMessage = { id: generateId(), text: chatbotInput.trim(), sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setChatbotInput('');
    setIsChatbotTyping(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatbotInput.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { id: generateId(), text: data.response, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot backend:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: generateId(), text: 'Sorry, I could not connect to the advisor. Please try again later.', sender: 'bot' },
      ]);
    } finally {
      setIsChatbotTyping(false);
    }
  };

  const renderChatMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseItem}
      onPress={() => handleRemoveExpense(item.id)}
    >
      <Text style={styles.expenseCategory}>{item.category}</Text>
      <View style={styles.expenseAmountContainer}>
        <Text style={styles.expenseAmount}>DZD{item.amount.toFixed(2)}</Text>
        <Ionicons name="trash-outline" size={18} color="#FF6347" style={styles.removeIcon} />
      </View>
    </TouchableOpacity>
  );

  const renderDeadlineItem = ({ item }) => (
    <View style={styles.deadlineItem}>
      <View style={styles.deadlineLeft}>
        <Text style={styles.deadlineText}>{item.name}</Text>
        <Text style={styles.deadlineDate}>{item.dueDate}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        item.status === 'done' && styles.statusDone,
        item.status === 'late' && styles.statusLate,
        item.status === 'missing' && styles.statusMissing,
      ]}>
        <Text style={styles.deadlineStatus}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => setStreakModalVisible(true)}
          >
            <Ionicons name="flame" size={24} color="#FF4500" />
            <Text style={styles.headerText}>{streakDays}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => setTokenModalVisible(true)}
          >
            <Text style={styles.headerText}>{tokens}</Text>
            <Ionicons name="swap-vertical" size={24} color="#483D8B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, styles.dailyLogCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Log</Text>
              <TouchableOpacity onPress={() => setAddExpenseModalVisible(true)}>
                <Ionicons name="add-circle" size={32} color="#D93D8A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#888" />
                    {"  "}All clear for today. Add your first expense!
                  </Text>
                </View>
              }
              style={styles.expensesList}
            />
          </View>

          <View style={[styles.card, styles.deadlinesCard]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, styles.deadlinesTitle]}>Upcoming Deadlines</Text>
              <TouchableOpacity onPress={() => setAddDeadlineModalVisible(true)}>
                <Ionicons name="add-circle" size={32} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={deadlines}
              renderItem={renderDeadlineItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyDeadlinesText}>No deadlines added.</Text>
              }
            />
          </View>

          <View style={[styles.card, styles.remainingCard]}>
            <Text style={[styles.cardTitle, styles.remainingTitle]}>Budget Overview</Text>
            <View style={styles.remainingContent}>
              <Text style={styles.remainingLabel}>Remaining Balance :</Text>
              <Text style={styles.remainingAmount}>DZD{remainingBalance.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.chatbotButton}
          onPress={() => setChatbotModalVisible(true)}
        >
          <MaterialCommunityIcons name="robot-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="calendar" size={24} color="#d93d8a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Plan')}>
          <FontAwesome5 name="chart-pie" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Streak')}>
          <Ionicons name="flame" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <FontAwesome5 name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Add Expense Modal (Untouched) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addExpenseModalVisible}
        onRequestClose={() => setAddExpenseModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setAddExpenseModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Expense</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount (in DZD)"
                keyboardType="numeric"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
              />
              <Text style={styles.categoryTitle}>Select a Category:</Text>
              <ScrollView contentContainerStyle={styles.categoriesContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat && styles.selectedCategoryButton
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === cat && styles.selectedCategoryButtonText
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setAddExpenseModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={handleAddExpense}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Add Deadline Modal (Untouched) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addDeadlineModalVisible}
        onRequestClose={() => setAddDeadlineModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setAddDeadlineModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Deadline</Text>
              <TextInput
                style={styles.input}
                placeholder="Deadline Name (e.g., Electricity Bill)"
                value={newDeadlineName}
                onChangeText={setNewDeadlineName}
              />
              <Text style={styles.categoryTitle}>Due Date:</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateText}>{newDeadlineDate.toDateString()}</Text>
                <Ionicons name="calendar-outline" size={24} color="#483D8B" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={newDeadlineDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setAddDeadlineModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={handleAddDeadline}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Streak Info Modal (Untouched) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={streakModalVisible}
        onRequestClose={() => setStreakModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.fullScreenModalContainer}
          activeOpacity={1}
          onPressOut={() => setStreakModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.infoModalContent}>
              <Text style={styles.infoModalTitle}>Daily Streak</Text>
              <Ionicons name="flame" size={50} color="#FF4500" style={styles.infoModalIcon} />
              <Text style={styles.infoModalText}>
                You've logged in for {streakDays} successive days!
              </Text>
              <Text style={styles.infoModalDescription}>
                Keep your streak alive to unlock special rewards!
              </Text>
              <TouchableOpacity
                style={styles.infoModalButton}
                onPress={() => setStreakModalVisible(false)}
              >
                <Text style={styles.infoModalButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Token Info Modal (Untouched) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={tokenModalVisible}
        onRequestClose={() => setTokenModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.fullScreenModalContainer}
          activeOpacity={1}
          onPressOut={() => setTokenModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.infoModalContent}>
              <Text style={styles.infoModalTitle}>Your Token Wallet</Text>
              <Ionicons name="swap-vertical" size={50} color="#483D8B" style={styles.infoModalIcon} />
              <Text style={styles.infoModalText}>
                You currently have {tokens} tokens.
              </Text>
              <Text style={styles.infoModalDescription}>
                Tokens can be used in the store to buy amazing perks and features!
              </Text>
              <TouchableOpacity
                style={styles.infoModalButton}
                onPress={() => setTokenModalVisible(false)}
              >
                <Text style={styles.infoModalButtonText}>Awesome!</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>


      {/* NEW & MODERNIZED: Centered Chatbot Modal */}
      <Modal
        animationType="slide" // Slide up from bottom or fade
        transparent={true}
        visible={chatbotModalVisible}
        onRequestClose={() => setChatbotModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredModalBackdrop} // This will center it
        >
          <TouchableWithoutFeedback onPress={() => setChatbotModalVisible(false)}>
            <View style={styles.centeredModalBackdropOutside} />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback>
            <View style={styles.modernChatbotWindow}>
              <View style={styles.modernChatbotHeader}>
                <Text style={styles.modernChatbotTitle}>Financial Advisor</Text>
                <TouchableOpacity onPress={() => setChatbotModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={28} color="white" />
                </TouchableOpacity>
              </View>

              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatbotMessagesContainer}
                ListFooterComponent={isChatbotTyping ? <Text style={styles.chatbotTypingIndicator}>Advisor is typing...</Text> : null}
              />

              <View style={styles.modernChatbotInputContainer}>
                <TextInput
                  style={styles.modernChatbotTextInput}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#999"
                  value={chatbotInput}
                  onChangeText={setChatbotInput}
                  onSubmitEditing={handleSendMessage}
                  returnKeyType="send"
                  editable={!isChatbotTyping}
                />
                <TouchableOpacity
                  style={styles.modernChatbotSendButton}
                  onPress={handleSendMessage}
                  disabled={isChatbotTyping}
                >
                  <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 5,
    color: '#483D8B',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dailyLogCard: {
    minHeight: 180,
    borderLeftWidth: 5,
    borderColor: '#D93D8A',
  },
  deadlinesCard: {
    backgroundColor: '#483D8B',
    minHeight: 120,
  },
  remainingCard: {
    minHeight: 100,
    justifyContent: 'center',
    borderRightWidth: 5,
    borderColor: '#483D8B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#483D8B',
  },
  deadlinesTitle: {
    color: 'white',
  },
  remainingTitle: {
    color: '#483D8B',
    marginBottom: 10,
  },
  emptyListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  expensesList: {
    maxHeight: 250,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  expenseCategory: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  expenseAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#483D8B',
    marginRight: 10,
  },
  removeIcon: {
    opacity: 0.7,
  },
  deadlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  deadlineLeft: {
    flexDirection: 'column',
  },
  deadlineText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  deadlineDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  emptyDeadlinesText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  deadlineStatus: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statusDone: {
    backgroundColor: '#2E8B57',
  },
  statusLate: {
    backgroundColor: '#FF6347',
  },
  statusMissing: {
    backgroundColor: '#FF0000',
  },
  remainingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  remainingLabel: {
    fontSize: 18,
    color: '#666',
  },
  remainingAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    backgroundColor: '#D93D8A',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#483D8B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  // --- General Modal Styles (Untouched) ---
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  fullScreenModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#483D8B',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#F7F7F7',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#E6E6FA',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryButton: {
    backgroundColor: '#483D8B',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  categoryButtonText: {
    color: '#483D8B',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    borderRadius: 15,
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#A9A9A9',
  },
  addButton: {
    backgroundColor: '#D93D8A',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#F7F7F7',
  },
  dateText: {
    fontSize: 18,
    color: '#333',
  },
  infoModalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  infoModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#483D8B',
    textAlign: 'center',
  },
  infoModalIcon: {
    marginBottom: 20,
  },
  infoModalText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  infoModalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  infoModalButton: {
    backgroundColor: '#483D8B',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  infoModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- MODERNIZED & CENTERED Chatbot Modal Styles ---
  centeredModalBackdrop: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center',   // Center horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Standard dark overlay
  },
  centeredModalBackdropOutside: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  modernChatbotWindow: {
    width: screenWidth * 0.9, // A bit wider for a central modal
    height: screenHeight * 0.7, // Taller, like a traditional modal
    backgroundColor: 'white',
    borderRadius: 25, // More rounded corners
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 }, // More pronounced shadow
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
  },
  modernChatbotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#483D8B',
    paddingVertical: 18, // More vertical padding
    paddingHorizontal: 20, // More horizontal padding
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 3, // Slight shadow for header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernChatbotTitle: {
    color: 'white',
    fontSize: 20, // Slightly larger title
    fontWeight: '700', // Bolder title
  },
  chatbotMessagesContainer: {
    flexGrow: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  messageBubble: {
    paddingVertical: 12, // More padding inside bubbles
    paddingHorizontal: 15,
    borderRadius: 20, // Softer bubble corners
    maxWidth: '85%', // Slightly wider bubbles
    marginBottom: 10, // More space between messages
  },
  userBubble: {
    backgroundColor: '#D93D8A',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5, // A small accent corner
  },
  botBubble: {
    backgroundColor: '#ECECEC', // Lighter grey for bot
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5, // A small accent corner
  },
  userText: {
    color: 'white',
    fontSize: 16, // Slightly larger text
    lineHeight: 22,
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  chatbotTypingIndicator: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    fontStyle: 'italic',
    color: '#888',
    paddingBottom: 5,
    fontSize: 14,
  },
  modernChatbotInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0', // Softer border color
    paddingVertical: 15, // More vertical padding
    paddingHorizontal: 20, // More horizontal padding
    backgroundColor: 'white',
  },
  modernChatbotTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Softer border
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9', // Slight background color
  },
  modernChatbotSendButton: {
    backgroundColor: '#D93D8A',
    borderRadius: 28, // Perfectly round button
    width: 56, // Larger touch target
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D93D8A', // A subtle shadow matching the button color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});