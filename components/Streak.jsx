import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Alert, // Keep Alert for now, but we'll style it's appearance through design cues
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Animated, // Import Animated for the hover effect
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Streak({ navigation }) {
  // State for streak data
  const [streakDays, setStreakDays] = useState(12);
  const [tokens, setTokens] = useState(172); // Initial token amount
  const [isPremium, setIsPremium] = useState(false);

  // Modal states
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);

  // Current week data (Sunday to Saturday)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Mock data - in real app this would come from your backend
  const weeklyStreak = [true, true, true, true, true, true, false]; // Friday is current day
  const currentDay = 'Friday';

  // Define the offers for the Hanout
  const hanoutOffers = [
    {
      id: 'djezzy_flexy_60gb',
      name: 'Djezzy Flexy 60GB',
      price: 150,
      image: require('./Pics/djezzy.png'),
      description: 'Get 60GB of mobile data from Djezzy.',
    },
    {
      id: 'food_delivery',
      name: 'Food Delivery Voucher (DZD 1000)',
      price: 80,
      image: require('./Pics/foodbeeper.jpg'),
      description: 'A DZD 1000 voucher for your favorite food delivery service.',
    },
    {
      id: '1_month_netflix',
      name: '1-Month Netflix Subscription',
      price: 200,
      image: require('./Pics/netflix.png'),
      description: 'Enjoy a full month of Netflix, on us!',
    },
    {
      id: '1_month_spotify',
      name: '1-Month Spotify Premium',
      price: 120,
      image: require('./Pics/spotify.png'),
      description: 'Unlimited music for a month with Spotify Premium.',
    },
  ];

  // Animated value for hover effect
  const animatedValues = {};
  hanoutOffers.forEach(offer => {
    animatedValues[offer.id] = useState(new Animated.Value(1))[0];
  });

  const handlePressIn = (offerId) => {
    Animated.spring(animatedValues[offerId], {
      toValue: 0.95, // Scale down slightly
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (offerId) => {
    Animated.spring(animatedValues[offerId], {
      toValue: 1, // Scale back to normal
      friction: 3, // Control the springiness
      useNativeDriver: true,
    }).start();
  };

  const handleStoreNavigation = () => {
    setStoreModalVisible(true);
  };

  const handlePremiumUpgrade = () => {
    setPremiumModalVisible(true);
  };

  // Function to handle purchasing an offer
  const handlePurchaseOffer = (offer) => {
    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to spend ${offer.price} tokens for ${offer.name}?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Purchase cancelled"),
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => {
            if (tokens >= offer.price) {
              setTokens(prevTokens => prevTokens - offer.price);
              Alert.alert('Purchase Successful!', `You have purchased ${offer.name}. Your remaining tokens: ${tokens - offer.price}. A confirmation will be sent shortly.`);
              // Here you would typically also call an API to fulfill the order
            } else {
              Alert.alert('Insufficient Tokens', `You need ${offer.price - tokens} more tokens for ${offer.name}. Keep up your streak to earn more!`);
            }
          },
          style: "default"
        }
      ],
      {
        // Custom styling for the alert box itself (though options are limited by native Alert)
        // These keys are not directly style props but influence appearance if supported by the OS
        cancelable: true,
        userInterfaceStyle: 'light', // 'dark' or 'light'
      }
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#483D8B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Streak</Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={handlePremiumUpgrade}
          >
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.premiumButtonText}>Premium</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Weekly Streak Visualization Card */}
          <View style={[styles.card, styles.weeklyStreakCard]}>
            <Text style={styles.cardSectionTitle}>Weekly Progress</Text>
            <View style={styles.weeklyStreakContainer}>
              {weekDays.map((day, index) => (
                <View key={day} style={styles.dayContainer}>
                  <View style={[
                    styles.dayCircle,
                    weeklyStreak[index] ? styles.completedDay : styles.incompleteDay
                  ]}>
                    {weeklyStreak[index] && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Current Streak Status Card */}
          <View style={[styles.card, styles.currentStreakCard]}>
            <View style={styles.statusHeader}>
              <Ionicons name="flame" size={30} color="#FF4500" />
              <Text style={styles.currentStreakText}>
                You're on a <Text style={styles.streakDaysHighlight}>{streakDays} day</Text> streak!
              </Text>
            </View>
            <Text style={styles.currentDayInfo}>Today is {currentDay}. Keep it going!</Text>
          </View>

          {/* Streak Analytics Placeholder Card */}
          <View style={[styles.card, styles.analyticsPlaceholderCard]}>
            <Text style={styles.cardSectionTitle}>Streak Analytics</Text>
            <View style={styles.placeholderBox}>
              <Ionicons name="analytics" size={50} color="#C0C0C0" />
              <Text style={styles.placeholderText}>Detailed Streak Analytics Coming Soon</Text>
              <Text style={styles.placeholderSubtext}>
                Track your progress, identify patterns, and get insights to boost your consistency.
              </Text>
            </View>
          </View>

          {/* Token Wallet Card */}
          <View style={[styles.card, styles.tokenWalletCard]}>
            <View style={styles.tokenHeader}>
              <View style={styles.tokenLeft}>
                <Ionicons name="wallet-outline" size={28} color="#483D8B" />
                <Text style={styles.tokenTitle}>Token Balance</Text>
              </View>
              <Text style={styles.tokenAmount}>{tokens}</Text>
            </View>
            <Text style={styles.tokenDescription}>
              Earn tokens by maintaining your streak and completing challenges. Use them in Hanout!
            </Text>
          </View>

          {/* Hanout (Store) Access Card */}
          <TouchableOpacity
            style={[styles.card, styles.hanoutCard]}
            onPress={handleStoreNavigation}
          >
            <View style={styles.hanoutContent}>
              <View style={styles.hanoutLeft}>
                <MaterialCommunityIcons name="storefront" size={38} color="#D93D8A" />
                <View style={styles.hanoutTextContainer}>
                  <Text style={styles.hanoutTitle}>Visit Hanout</Text>
                  <Text style={styles.hanoutSubtitle}>Spend your hard-earned tokens on amazing perks.</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#D93D8A" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bottom Navigation Bar (Untouched as per instruction) */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => Alert.alert('Navigate to Home')}>
          <MaterialCommunityIcons name="calendar" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Plan')}>
          <FontAwesome5 name="chart-pie" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Streak')}>
          <Ionicons name="flame" size={24} color="#d93d8a" /> {/* Highlight active icon */}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <FontAwesome5 name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Premium Features Modal (Untouched) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={premiumModalVisible}
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.premiumModalContent}>
            <View style={modalStyles.premiumHeader}>
              <Ionicons name="star" size={45} color="#FFD700" />
              <Text style={modalStyles.premiumModalTitle}>Upgrade to Premium</Text>
            </View>

            <ScrollView style={modalStyles.featuresContainer}>
              <View style={modalStyles.featureItem}>
                <Ionicons name="analytics" size={28} color="#483D8B" />
                <View style={modalStyles.featureTextContainer}>
                  <Text style={modalStyles.featureTitle}>Advanced Analytics</Text>
                  <Text style={modalStyles.featureDescription}>
                    Get detailed insights into your spending patterns and streak performance.
                  </Text>
                </View>
              </View>

              <View style={modalStyles.featureItem}>
                <Ionicons name="notifications" size={28} color="#483D8B" />
                <View style={modalStyles.featureTextContainer}>
                  <Text style={modalStyles.featureTitle}>Smart Reminders</Text>
                  <Text style={modalStyles.featureDescription}>
                    Personalized notifications to help maintain your streak.
                  </Text>
                </View>
              </View>

              <View style={modalStyles.featureItem}>
                <MaterialCommunityIcons name="currency-usd" size={28} color="#483D8B" />
                <View style={modalStyles.featureTextContainer}>
                  <Text style={modalStyles.featureTitle}>Bonus Tokens</Text>
                  <Text style={modalStyles.featureDescription}>
                    Earn 2x tokens for every successful day in your streak.
                  </Text>
                </View>
              </View>

              <View style={modalStyles.featureItem}>
                <Ionicons name="shield-checkmark" size={28} color="#483D8B" />
                <View style={modalStyles.featureTextContainer}>
                  <Text style={modalStyles.featureTitle}>Streak Protection</Text>
                  <Text style={modalStyles.featureDescription}>
                    Get 3 streak freezes per month to protect your progress.
                  </Text>
                </View>
              </View>

              <View style={modalStyles.featureItem}>
                <MaterialCommunityIcons name="palette" size={28} color="#483D8B" />
                <View style={modalStyles.featureTextContainer}>
                  <Text style={modalStyles.featureTitle}>Premium Themes</Text>
                  <Text style={modalStyles.featureDescription}>
                    Access exclusive app themes and customization options.
                  </Text>
                </View>
              </View>

              <View style={modalStyles.featureItem}>
                <Ionicons name="chatbubbles" size={28} color="#483D8B" />
                <View style={modalStyles.featureTextContainer}>
                  <Text style={modalStyles.featureTitle}>Priority Support</Text>
                  <Text style={modalStyles.featureDescription}>
                    Get priority access to customer support and new features.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={modalStyles.premiumActions}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={() => setPremiumModalVisible(false)}
              >
                <Text style={modalStyles.buttonText}>Maybe Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.upgradeButton]}
                onPress={() => {
                  setIsPremium(true); // Dummy upgrade
                  setPremiumModalVisible(false);
                  Alert.alert('Upgrade Successful!', 'You are now a Premium member!');
                }}
              >
                <Ionicons name="star" size={18} color="white" style={modalStyles.buttonIcon} />
                <Text style={modalStyles.buttonText}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW & MODERNIZED: Centered Hanout (Store) Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={storeModalVisible}
        onRequestClose={() => setStoreModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.centeredView}
          activeOpacity={1}
          onPressOut={() => setStoreModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={hanoutModalStyles.hanoutModalContent}>
              <View style={hanoutModalStyles.hanoutModalHeader}>
                <Text style={hanoutModalStyles.hanoutModalTitle}>Hanout</Text>
                <TouchableOpacity onPress={() => setStoreModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={28} color="white" />
                </TouchableOpacity>
              </View>

              <View style={hanoutModalStyles.currentTokensContainer}>
                <Ionicons name="wallet" size={20} color="#483D8B" />
                <Text style={hanoutModalStyles.currentTokensText}>Your Tokens: </Text>
                <Text style={hanoutModalStyles.currentTokensAmount}>{tokens}</Text>
              </View>

              <ScrollView
                contentContainerStyle={hanoutModalStyles.offersScrollView}
                showsVerticalScrollIndicator={false}
              >
                {hanoutOffers.map((offer) => (
                  <Animated.View
                    key={offer.id}
                    style={[
                      hanoutModalStyles.offerCard,
                      { transform: [{ scale: animatedValues[offer.id] }] }
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={1} // Prevents the default TouchableOpacity opacity change
                      onPressIn={() => handlePressIn(offer.id)}
                      onPressOut={() => handlePressOut(offer.id)}
                      onPress={() => handlePurchaseOffer(offer)}
                      style={hanoutModalStyles.offerCardInnerTouchable}
                    >
                      <View style={hanoutModalStyles.offerImageContainer}>
                        <Image source={offer.image} style={hanoutModalStyles.offerImage} resizeMode="contain" />
                      </View>
                      <View style={hanoutModalStyles.offerDetails}>
                        <Text style={hanoutModalStyles.offerName}>{offer.name}</Text>
                        <Text style={hanoutModalStyles.offerDescription}>{offer.description}</Text>
                        <View style={hanoutModalStyles.offerPriceContainer}>
                          <Text style={hanoutModalStyles.offerPrice}>{offer.price}</Text>
                          {/* Replaced dollar sign with token icon */}
                          <Ionicons name="swap-vertical" size={20} color="#483D8B" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Consistent light gray background
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
  headerTitle: {
    fontSize: 28, // Larger title for prominence
    fontWeight: 'bold',
    color: '#483D8B',
    flex: 1,
    textAlign: 'center',
    marginLeft: 10, // Adjust for back button
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC', // Light gold background
    paddingHorizontal: 12,
    paddingVertical: 8, // Slightly larger padding
    borderRadius: 20, // More rounded
    borderWidth: 1,
    borderColor: '#FFD700', // Gold border
    shadowColor: '#000', // Subtle shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  premiumButtonText: {
    color: '#B8860B', // Darker gold text
    fontWeight: '600',
    fontSize: 14, // Slightly larger font
    marginLeft: 6, // More space from icon
  },
  scrollContent: {
    paddingBottom: 100, // Ensure space for the bottom nav bar
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
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#483D8B',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Weekly Streak Visualization Card
  weeklyStreakCard: {
    backgroundColor: '#483D8B', // Keep dark background for contrast
    paddingVertical: 30, // More vertical padding
  },
  weeklyStreakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute evenly
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 40, // Slightly larger circles
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedDay: {
    backgroundColor: '#D93D8A', // Pink from palette
  },
  incompleteDay: {
    backgroundColor: 'rgba(255,255,255,0.3)', // Lighter, transparent white for incomplete
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  dayLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  // Current Streak Status Card
  currentStreakCard: {
    backgroundColor: '#FFF0F5', // Light pink background
    borderLeftWidth: 5, // Accent border
    borderColor: '#D93D8A',
    paddingVertical: 25,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the flame and text
    marginBottom: 10,
  },
  currentStreakText: {
    fontSize: 22, // Larger font
    fontWeight: 'bold',
    color: '#483D8B',
    marginLeft: 10,
  },
  streakDaysHighlight: {
    color: '#FF4500', // Orange-red for flame highlight
  },
  currentDayInfo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Streak Analytics Placeholder Card
  analyticsPlaceholderCard: {
    backgroundColor: '#E6E6FA', // Light lavender
    minHeight: 220, // Ensure it's tall enough
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C0C0C0', // Light gray border
    borderStyle: 'dashed', // Dashed border for "coming soon" feel
  },
  placeholderBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#483D8B',
    marginBottom: 10,
    marginTop: 15,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Token Wallet Card
  tokenWalletCard: {
    backgroundColor: '#F0F8FF', // Alice Blue
    borderLeftWidth: 5,
    borderColor: '#483D8B', // Dark blue border
    paddingVertical: 25,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#483D8B',
    marginLeft: 10,
  },
  tokenAmount: {
    fontSize: 30, // Larger token amount
    fontWeight: 'bold',
    color: '#483D8B',
  },
  tokenUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  tokenDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  // Hanout (Store) Access Card
  hanoutCard: {
    backgroundColor: '#FFF0F5', // Light pink
    borderWidth: 2, // Slightly thicker border
    borderColor: '#D93D8A', // Pink border
    paddingVertical: 25,
  },
  hanoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hanoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hanoutTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  hanoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D93D8A', // Pink title
  },
  hanoutSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
});

// Reusing modal styles from previous components for consistency
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  },
  premiumModalContent: {
    backgroundColor: 'white',
    borderRadius: 25, // More rounded
    padding: 30, // More padding
    width: '90%',
    maxHeight: '90%', // Allow more height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 25, // More space
  },
  premiumModalTitle: {
    fontSize: 26, // Larger title
    fontWeight: 'bold',
    color: '#483D8B',
    marginTop: 15,
  },
  featuresContainer: {
    maxHeight: '60%', // Control scrollable area height
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top for multi-line descriptions
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18, // Larger feature title
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  premiumActions: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Use space-around for buttons
    marginTop: 30, // More space
  },
  button: {
    borderRadius: 15, // More rounded buttons
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 5, // Small margin between buttons
  },
  cancelButton: {
    backgroundColor: '#A9A9A9', // Gray for cancel
  },
  upgradeButton: {
    backgroundColor: '#FFD700', // Gold for upgrade
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17, // Larger button text
  },
  buttonIcon: {
    marginRight: 8, // More space from text
  },
  // Store Modal (Old placeholder) - will be replaced by hanoutModalStyles
  storeModalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  storeModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#483D8B',
    textAlign: 'center',
  },
  storeModalIcon: {
    marginBottom: 25,
  },
  storeModalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
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
    fontSize: 18,
  },
});

// --- NEW STYLES FOR HANOUT MODAL ---
const hanoutModalStyles = StyleSheet.create({
  hanoutModalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
    overflow: 'hidden',
  },
  hanoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#483D8B',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hanoutModalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  currentTokensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currentTokensText: {
    fontSize: 16,
    color: '#483D8B',
    fontWeight: '600',
    marginLeft: 5,
  },
  currentTokensAmount: {
    fontSize: 18,
    color: '#D93D8A',
    fontWeight: 'bold',
  },
  offersScrollView: {
    padding: 15,
  },
  offerCard: {
    marginBottom: 12, // Space between cards
    // The actual card styling is on the Animated.View, which is wrapped by TouchableOpacity
  },
  offerCardInnerTouchable: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  offerImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    padding: 5,
  },
  offerImage: {
    width: '90%',
    height: '90%',
  },
  offerDetails: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  offerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#483D8B',
    marginBottom: 5,
  },
  offerDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  offerPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D93D8A',
    marginRight: 5,
  },
});