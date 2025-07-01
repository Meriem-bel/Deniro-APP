import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// --- DUMMY DATA SIMULATING PYTHON SCRIPT OUTPUT ---
// This data structure mirrors the comprehensive report from the BudgetPlanner class
const sampleReport = {
  income: 100000,
  original_total: 95000,
  optimized_total: 85000,
  essential_savings: 15000, // 15% of income
  remaining_balance: 0, // After all expenses and savings are covered
  currency: 'DZD',
  
  // Adjusted categories are "Detours" or "Cost-Saving Shortcuts"
  adjustments: [
    {
      category: 'clothing',
      original: 6000,
      optimized: 2000,
      reduction_pct: 66.7,
      reason: "Large cut (saved 4,000 DZD)",
    },
    {
      category: 'internet',
      original: 4000,
      optimized: 1000,
      reduction_pct: 75.0,
      reason: "Large cut (saved 3,000 DZD)",
    },
    {
      category: 'education',
      original: 7000,
      optimized: 4000,
      reduction_pct: 42.9,
      reason: "Balanced reduction",
    },
  ],
  
  // Untouched categories are "Safe Havens" or "Non-Negotiable Tolls"
  untouched_categories: [
    { category: 'rent', amount: 30000, reason: "Protected as non-negotiable" },
    { category: 'utilities', amount: 8000, reason: "Protected as non-negotiable" },
    { category: 'food', amount: 25000, reason: "High priority (1-2)" },
    { category: 'health', amount: 5000, reason: "High priority (1-2)" },
    { category: 'transport', amount: 10000, reason: "High priority (1-2)" },
  ],
  
  // Notes are "Signposts" or "Traveler's Tips"
  notes: [
    "Warning: Clothing was cut by 66.7%. Verify if this is sustainable.",
    "Warning: Internet was cut by 75.0%. Verify if this is sustainable.",
    "✅ You're on track! Your budget is successfully balanced.",
  ],

  // New feature: Savings goals tracker
  savings_goals: {
    vehicle: { target: 100000, saved: 25000, monthly_contribution: 5000 },
    housing: { target: 500000, saved: 120000, monthly_contribution: 8000 },
    other: { target: 50000, saved: 15000, monthly_contribution: 2000 },
  }
};

const { width } = Dimensions.get('window');

const ProgressBar = ({ progress, color }) => {
  const progressWidth = `${Math.min(100, progress)}%`;
  return (
    <View style={progressStyles.progressBarContainer}>
      <View style={[progressStyles.progressBar, { width: progressWidth, backgroundColor: color }]} />
    </View>
  );
};

export default function Plan({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const {
    income,
    optimized_total,
    essential_savings,
    remaining_balance,
    adjustments,
    untouched_categories,
    notes,
    savings_goals,
    currency,
  } = sampleReport;

  // Calculate daily spending and projection note
  const dailyOptimizedSpending = (optimized_total + essential_savings) / 30;
  const isOverBudget = remaining_balance < 0;
  const projectionNote = isOverBudget
    ? `At this rate, you will run out of money in approximately ${Math.round(Math.abs(income / optimized_total * 30))} days.`
    : `Excellent! You have a surplus of ${remaining_balance.toLocaleString()} ${currency} after all expenses and savings.`;

  // Define the content for each swipeable flashcard
  const flashcardData = [
    {
      id: 'start',
      title: 'Your Current Position',
      subtitle: 'Starting the month with a plan.',
      icon: <Ionicons name="location" size={40} color="#483D8B" />,
      content: (
        <>
          <View style={styles.infoRow}>
            <Ionicons name="wallet" size={20} color="#483D8B" />
            <Text style={styles.infoText}>Monthly Income:</Text>
            <Text style={styles.infoValue}>{income.toLocaleString()} {currency}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="trending-up" size={20} color="#D93D8A" />
            <Text style={styles.infoText}>Initial Expenses:</Text>
            <Text style={styles.infoValue}>{sampleReport.original_total.toLocaleString()} {currency}</Text>
          </View>
        </>
      ),
    },
    {
      id: 'optimized',
      title: 'The Optimized Route',
      subtitle: 'Your new spending blueprint.',
      icon: <Ionicons name="rocket" size={40} color="#28A745" />,
      content: (
        <>
          <View style={styles.infoRow}>
            <Ionicons name="trending-down" size={20} color="#28A745" />
            <Text style={styles.infoText}>Optimized Total:</Text>
            <Text style={styles.infoValue}>{optimized_total.toLocaleString()} {currency}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="save" size={20} color="#483D8B" />
            <Text style={styles.infoText}>Essential Savings:</Text>
            <Text style={styles.infoValue}>{essential_savings.toLocaleString()} {currency}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color={isOverBudget ? '#DC3545' : '#28A745'} />
            <Text style={styles.infoText}>Final Balance:</Text>
            <Text style={[styles.infoValue, { color: isOverBudget ? '#DC3545' : '#28A745' }]}>
              {remaining_balance.toLocaleString()} {currency}
            </Text>
          </View>
        </>
      ),
    },
    {
      id: 'daily',
      title: 'Daily Spending Compass',
      subtitle: 'Stay on course with your daily target.',
      icon: <Ionicons name="compass" size={40} color="#FFD700" />,
      content: (
        <>
          <View style={styles.dailySpendingContainer}>
            <Ionicons name="wallet-outline" size={30} color="#483D8B" />
            <View style={styles.dailySpendingText}>
              <Text style={styles.dailySpendingAmount}>{dailyOptimizedSpending.toLocaleString()} {currency}</Text>
              <Text style={styles.dailySpendingLabel}>PER DAY</Text>
            </View>
          </View>
          <Text style={styles.projectionNote}>{projectionNote}</Text>
        </>
      ),
    },
    {
      id: 'adjustments',
      title: 'Cost-Saving Detours',
      subtitle: 'Where the algorithm made necessary cuts.',
      icon: <Ionicons name="cut" size={40} color="#D93D8A" />,
      content: adjustments.map((adj, index) => (
        <View key={index} style={styles.adjustmentItem}>
          <Text style={styles.adjustmentCategory}>{adj.category.charAt(0).toUpperCase() + adj.category.slice(1)}</Text>
          <Text style={styles.adjustmentDetails}>
            <Text style={styles.originalAmount}>{adj.original.toLocaleString()}</Text> → <Text style={styles.optimizedAmount}>{adj.optimized.toLocaleString()}</Text> {currency}
          </Text>
          <Text style={styles.adjustmentReason}>{adj.reason}</Text>
        </View>
      )),
    },
    {
      id: 'protected',
      title: 'Protected Landmarks',
      subtitle: 'These expenses were left untouched.',
      icon: <Ionicons name="shield-checkmark" size={40} color="#483D8B" />,
      content: untouched_categories.map((item, index) => (
        <View key={index} style={styles.protectedItem}>
          <Text style={styles.protectedCategory}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</Text>
          <Text style={styles.protectedDetails}>{item.amount.toLocaleString()} {currency} <Text style={styles.protectedReason}>({item.reason})</Text></Text>
        </View>
      )),
    },
    {
      id: 'savings',
      title: 'Savings Goal Checkpoint',
      subtitle: 'Track your progress towards your dreams.',
      icon: <Ionicons name="trophy" size={40} color="#D93D8A" />,
      content: Object.entries(savings_goals).map(([key, goal], index) => {
        const progressPct = (goal.saved / goal.target) * 100;
        return (
          <View key={index} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.goalProgressText}>
                {goal.saved.toLocaleString()} / {goal.target.toLocaleString()} {currency}
              </Text>
            </View>
            <ProgressBar progress={progressPct} color="#D93D8A" />
            <Text style={styles.goalContribution}>
              Monthly Contribution: {goal.monthly_contribution.toLocaleString()} {currency}
            </Text>
          </View>
        );
      }),
    },
    {
      id: 'notes',
      title: "Traveler's Tips",
      subtitle: 'Important advice for your journey.',
      icon: <Ionicons name="bulb" size={40} color="#FFD700" />,
      content: notes.map((note, index) => (
        <View key={index} style={styles.noteItem}>
          <Ionicons name="chevron-forward-circle" size={18} color="#483D8B" style={{ marginRight: 8 }} />
          <Text style={styles.noteText}>{note}</Text>
        </View>
      )),
    },
  ];

  const totalCards = flashcardData.length;
  const progressPercentage = Math.round(((currentIndex + 1) / totalCards) * 100);

  // Handle scroll event to update the current card index
  const handleScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.floor(offset / slideSize);
    setCurrentIndex(index);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button and progress */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={28} color="#483D8B" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.headerTitle}>Plan Progress</Text>
            <Text style={styles.progressText}>{progressPercentage}% Read</Text>
          </View>
          <View style={{ width: 28 }} /> {/* Placeholder for alignment */}
        </View>
        
        {/* The swipeable flashcard area */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.scrollViewContent}
        >
          {flashcardData.map((card, index) => (
            <View key={card.id} style={styles.flashcardContainer}>
              <View style={styles.flashcard}>
                <View style={styles.cardIcon}>{card.icon}</View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                <ScrollView contentContainerStyle={styles.cardContentScrollView}>
                  {card.content}
                </ScrollView>
              </View>
            </View>
          ))}
        </ScrollView>
        
        {/* Indicator dots */}
        <View style={styles.paginationDots}>
          {flashcardData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? '#FD67B0' : '#E0E0E0' },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="calendar" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Already on Plan')}>
          <FontAwesome5 name="chart-pie" size={24} color="#FD67B0" /> {/* Highlight active icon */}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Streak')}>
          <Ionicons name="flame" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <FontAwesome5 name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light gray background
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 5,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 120, // Space for nav bar and dots
  },
  flashcardContainer: {
    width: width, // Each card takes the full screen width
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcard: {
    width: width * 0.9, // Card width is 90% of screen width
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    minHeight: '75%', // Ensure cards are a decent size
  },
  cardIcon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#483D8B',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardContentScrollView: {
    flexGrow: 1,
  },
  // Reused styles from roadmap
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  dailySpendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dailySpendingText: {
    marginLeft: 15,
    alignItems: 'center',
  },
  dailySpendingAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  dailySpendingLabel: {
    fontSize: 14,
    color: 'gray',
    marginTop: -5,
  },
  projectionNote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    color: 'gray',
    lineHeight: 20,
  },
  adjustmentItem: {
    backgroundColor: '#FFF0F5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderColor: '#D93D8A',
  },
  adjustmentCategory: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  adjustmentDetails: {
    fontSize: 15,
    marginTop: 5,
  },
  originalAmount: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  optimizedAmount: {
    fontWeight: 'bold',
    color: '#D93D8A',
  },
  adjustmentReason: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  protectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderColor: '#483D8B',
  },
  protectedCategory: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  protectedDetails: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  protectedReason: {
    fontStyle: 'italic',
    color: 'gray',
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  goalProgressText: {
    fontSize: 16,
    color: '#666',
  },
  goalContribution: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8F8FF',
    borderRadius: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 90, // Position above the nav bar
    width: '100%',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 5,
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
});

const progressStyles = StyleSheet.create({
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
});