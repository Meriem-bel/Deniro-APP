import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput, // Import TextInput for editable fields
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Dummy About Component (Modal Popup)
function About({ navigation }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => navigation.goBack()}
    >
      <View style={dummyStyles.centeredView}>
        <View style={dummyStyles.modalView}>
          <Text style={dummyStyles.modalText}>About App</Text>
          <Text style={dummyStyles.modalSubText}>Version 1.0.0</Text>
          <Text style={dummyStyles.modalSubText}>Developed with love.</Text>
          <TouchableOpacity
            style={dummyStyles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={dummyStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Dummy Notifications Component (Modal Popup)
function Notifications({ navigation }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => navigation.goBack()}
    >
      <View style={dummyStyles.centeredView}>
        <View style={dummyStyles.modalView}>
          <Text style={dummyStyles.modalText}>Notifications</Text>
          <Text style={dummyStyles.modalSubText}>You have no new notifications.</Text>
          <TouchableOpacity
            style={dummyStyles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={dummyStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Dummy Settings Component (Modal Popup)
function Settings({ navigation }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => navigation.goBack()}
    >
      <View style={dummyStyles.centeredView}>
        <View style={dummyStyles.modalView}>
          <Text style={dummyStyles.modalText}>Settings</Text>
          <Text style={dummyStyles.modalSubText}>Settings options will be here.</Text>
          <TouchableOpacity
            style={dummyStyles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={dummyStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


const Stack = createNativeStackNavigator();

function ProfileContent({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editableEmail, setEditableEmail] = useState('exemple@gmail.com');
  const [editablePassword, setEditablePassword] = useState('••••••••');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleEditSave = () => {
    if (isEditing) {
      // Here you would typically save the data to a backend or state management
      Alert.alert('Profile Saved!', `Email: ${editableEmail}\nPassword: ${editablePassword}`);
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // In a real app, you would clear user session/token here
    navigation.navigate('Login'); // Navigate to Login screen (assuming it exists in your main navigation)
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle-outline" size={60} color="#483D8B" />
            <Text style={styles.profileTitle}>My Profile</Text>
            <TouchableOpacity onPress={handleEditSave}>
              <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#483D8B" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <View style={styles.infoInputContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.infoInputText}
                  value={editableEmail}
                  onChangeText={setEditableEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoInputText}>{editableEmail}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="lock-closed" size={20} color="#483D8B" />
              <Text style={styles.infoLabel}>Password</Text>
            </View>
            <View style={styles.infoInputContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.infoInputText}
                  value={editablePassword}
                  onChangeText={setEditablePassword}
                  secureTextEntry={!showPassword} // Toggle secureTextEntry
                />
              ) : (
                <Text style={styles.infoInputText}>
                  {showPassword ? editablePassword : '••••••••'}
                </Text>
              )}
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordEye}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications" size={24} color="#483D8B" />
          <Text style={styles.navButtonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={24} color="#483D8B" />
          <Text style={styles.navButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('About')}>
          <Ionicons name="information-circle" size={24} color="#483D8B" />
          <Text style={styles.navButtonText}>About App</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={cancelLogout}
      >
        <View style={dummyStyles.centeredView}>
          <View style={dummyStyles.modalView}>
            <Text style={dummyStyles.modalText}>Are you sure you want to log out?</Text>
            <View style={dummyStyles.modalButtonContainer}>
              <TouchableOpacity
                style={[dummyStyles.modalButton, dummyStyles.modalButtonYes]}
                onPress={confirmLogout}
              >
                <Text style={dummyStyles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dummyStyles.modalButton, dummyStyles.modalButtonNo]}
                onPress={cancelLogout}
              >
                <Text style={dummyStyles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="calendar" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Plan')}>
          <FontAwesome5 name="chart-pie" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Streak')}>
          <Ionicons name="flame" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Already on Profile')}>
          <FontAwesome5 name="user" size={24} color="#FD67B0" /> {/* Highlight active icon */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function Profile({ navigation }) {
  return (
    <Stack.Navigator initialRouteName="MainProfile" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainProfile" component={ProfileContent} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="About" component={About} />
      {/* Assuming 'Login' route is defined elsewhere in your application's main navigation */}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light gray background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the bottom navigation bar
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#483D8B',
    flex: 1, // Allow title to take available space
    marginLeft: 10,
  },
  editButton: {
    color: '#FD67B0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#483D8B',
    marginLeft: 10,
  },
  infoInputContainer: {
    backgroundColor: '#FCEEF5', // Light pink background for input fields
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoInputText: {
    fontSize: 16,
    color: '#483D8B',
    flex: 1,
  },
  passwordEye: {
    paddingLeft: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 18,
    color: '#483D8B',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FD67B0',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
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
  },
});

const dummyStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#483D8B',
  },
  modalSubText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#FD67B0',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    elevation: 2,
  },
  modalButtonYes: {
    backgroundColor: '#483D8B',
  },
  modalButtonNo: {
    backgroundColor: '#FD67B0',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});