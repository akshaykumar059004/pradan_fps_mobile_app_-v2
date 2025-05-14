import { useActionSheet } from "@expo/react-native-action-sheet";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { DashbdStore } from "../../storage/DashbdStore";

``
const url = Constants.expoConfig.extra.API_URL;
const statusStyles = {
   11: { backgroundColor: '#C8E6C9', textColor: '#2E7D32' },
  9: { backgroundColor: '#C8E6C9', textColor: '#2E7D32' },
  7: { backgroundColor: '#FFF9C4', textColor: '#F9A825' },
  8: { backgroundColor: '#BBDEFB', textColor: '#1976D2' },
   10: { backgroundColor: '#EDE7F6', textColor: '#6A1B9A' },
};

const TotalSubmit = () => {
    const formTypeMap = {
  1: "LAND",
  2: "POND",
  3: "PLANTATION"
};

  const router = useRouter();
  // const { submittedForms, loadSubmittedForms, deleteFormByIndex } = useFormStore();
  const { showActionSheetWithOptions } = useActionSheet();
const {dashbdforms,loaddashbdForms} = DashbdStore();
  const [searchText, setSearchText] = useState("");
  const [formType, setFormType] = useState("ALL");
  const [panchayat, setPanchayat] = useState("");
  const [block, setBlock] = useState("");
  const [hamlet, setHamlet] = useState("");
  const [gender, setGender] = useState("ALL");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  useEffect(() => {
    loaddashbdForms();
  }, []);

  const filteredForms = dashbdforms.filter((item) => {
    const matchesType = formType === "ALL" || String(item.form_type) === formType;
    const matchesName = item.farmer_name?.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = item.status ===7 || item.status ===8 || item.status ===9 || item.status ===10 || item.status ===11;
    const matchesPanchayat = item.panchayat?.toLowerCase().includes(panchayat.toLowerCase());
    const matchesBlock = item.block?.toLowerCase().includes(block.toLowerCase());
    const matchesHamlet = item.hamlet?.toLowerCase().includes(hamlet.toLowerCase());
    const matchesGender = gender === "ALL" || item.gender === gender;

    // Date range filtering logic
    const formatDate = (dateString) => {
      const [day, month, year] = dateString.split('/');
      return new Date(year, month - 1, day); // Create a Date object with year, month (0-indexed), and day
    };
  
    const itemDate = formatDate(item.created_at); // Convert the item's date to Date object
    const matchesStart = !startDate || itemDate >= new Date(startDate);
    const matchesEnd = !endDate || itemDate <= new Date(endDate);
  
    return matchesStatus&&matchesType && matchesBlock && matchesHamlet&& matchesName && matchesPanchayat && matchesGender&& matchesStart && matchesEnd;
    
  });
  const handleCardPress = async (item) => {
    let previewPath = "";
  
     if (item.form_type === 1) previewPath = "/landform/Preview";
    else if (item.form_type === 2) previewPath = "/pondform/Preview";
    else if (item.form_type === 3) previewPath = "/plantationform/Preview";
    else return alert("Unknown form type.");
  
    try {
      const response = await axios.get(`${url}/api/dashboard/getpreviewspecificformData`,{params:{form_id:item.id}});
      const fetchedData = response.data;
      console.log(fetchedData +" "+item.id);
    router.push({ pathname: previewPath, params: { id: item.id, fromsubmit: "true", returnsubmit: "/postfd/totalsubmit" } });
  
    } catch (error) {
      console.error("Error fetching form details:", error);
      // Alert.alert("Error", "Failed to fetch form details.");
    }
  };

  // const handleCardPress = (item) => {
    
  //   let previewPath = "";
  //  if (item.form_type === 1) previewPath = "/landform/Preview";
  //   else if (item.form_type === 2) previewPath = "/pondform/Preview";
  //   else if (item.form_type === 3) previewPath = "/plantationform/Preview";
  //   else return alert("Unknown form type.");

  //   router.push({ pathname: previewPath, params: { id: item.id, fromsubmit: "true", returnsubmit: "/postfd/totalsubmit" } });
  // };

  // Function to handle the date selection
  const handleConfirmStartDate = (date) => {
    setStartDate(date);
    setStartDatePickerVisible(false);
  };

  const handleConfirmEndDate = (date) => {
    setEndDate(date);
    setEndDatePickerVisible(false);
  };

  const resetFilters = () => {
    setSearchText("");
    setFormType("ALL");
    setPanchayat("");
    setBlock("");
    setHamlet("");
    setGender("ALL");
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.icon}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.title}>POST TotalForm Submissions</Text>
        <TouchableOpacity onPress={() =>{ setShowFilters(!showFilters) 
        // console.log(JSON.stringify(dashbdforms) +"total submit 111");
        }} style={styles.icon}>
          <MaterialIcons name="filter-list" size={24} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={16} color="#1B5E20" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by farmer name"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Filter Options (Toggleable) */}
      {showFilters && (
        <View style={styles.filtersBox}>
          <TextInput placeholder="Panchayat" value={panchayat} onChangeText={setPanchayat} style={styles.searchInput} />
          <TextInput placeholder="Block" value={block} onChangeText={setBlock} style={styles.searchInput} />
          <TextInput placeholder="Hamlet" value={hamlet} onChangeText={setHamlet} style={styles.searchInput} />

          <Text style={styles.filterLabel}>Form Type</Text>
          <Picker selectedValue={formType} onValueChange={(val) => setFormType(val)}>
  <Picker.Item label="ALL" value="ALL" />
  <Picker.Item label="LAND" value="1" />
  <Picker.Item label="POND" value="2" />
  <Picker.Item label="PLANTATION" value="3" />
</Picker>


          <Text style={styles.filterLabel}>Gender</Text>
          <Picker selectedValue={gender} onValueChange={setGender}>
            <Picker.Item label="ALL" value="ALL" />
            <Picker.Item label="MALE" value="Male" />
            <Picker.Item label="FEMALE" value="Female" />
            <Picker.Item label="TRANSGENDER" value="Transgender" />
          </Picker>

          <TouchableOpacity onPress={() => setStartDatePickerVisible(true)} style={styles.dateButton}>
         <Text>{startDate ? `Start Date: ${startDate.toLocaleDateString()}` : "Start Date"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEndDatePickerVisible(true)} style={styles.dateButton}>
            <Text>{endDate ? `End Date: ${endDate.toLocaleDateString()}` : "End Date"}</Text>
          </TouchableOpacity> 

          {/* Display the selected date range */}
          {startDate && endDate && (
            <Text style={styles.dateRangeText}>
              Showing data from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            </Text>
          )}

          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Time Picker Modal for Start Date */}
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmStartDate}
        onCancel={() => setStartDatePickerVisible(false)}
      />

      {/* Date Time Picker Modal for End Date */}
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmEndDate}
        onCancel={() => setEndDatePickerVisible(false)}
      />

      {/* No Data */}
      {filteredForms.length === 0 ? (
        <Text style={styles.noDataText}>No forms submitted yet.</Text>
      ) : (
        filteredForms.map((item, index) => {
          const statusStyle = statusStyles[item.status] || {
            backgroundColor: "#E0E0E0",
            textColor: "#424242",
          };

          return (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handleCardPress(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.farmer_name|| "N/A"}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
  {item.status === 7
    ? 'Pending'
    : item.status === 11
    ? 'Verified'
    : item.status === 8
    ? 'Review'
    : item.status === 9
    ? 'Approved'
    : item.status === 10
    ? 'Waiting for Veification'
    : 'Unknown'}
</Text>

                </View>
              </View>
              
              
             <Text style={styles.label}>Form: <Text style={styles.value}>{formTypeMap[item.form_type] }</Text></Text>
              <Text style={styles.label}>Date: <Text style={styles.value}>{item.created_at}</Text></Text>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  icon: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: "#333",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  filtersBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F0F4C3",
    marginBottom: 14,
  },
  filterLabel: {
    fontWeight: "bold",
    marginTop: 6,
    color: "#1B5E20",
  },
  noDataText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  bioContainer: {
    marginTop: 12,
  },
  bioTitle: {
    fontSize: 14,
    color: "#555",
  },
  bioContent: {
    fontSize: 14,
    color: "#333",
  },
  deleteButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#E57373",
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  resetButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#81C784",
    borderRadius: 6,
    alignItems: "center",
  },
  dateButton: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  dateRangeText: {
    fontSize: 14,
    color: "#388E3C",
    marginTop: 8,
  },
});

export default TotalSubmit;