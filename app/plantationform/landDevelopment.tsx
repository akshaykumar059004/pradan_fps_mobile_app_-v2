import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Checkbox,
  Text
} from "react-native-paper";
import { useFormStore } from "../../storage/useFormStore";
const { width, height } = Dimensions.get('window');
export default function LandDevelopment() {
  const router = useRouter();
  const { id, fromPreview,returnTo,returnsubmit,fromsubmit,fromland,fromplantation,frompond } = useLocalSearchParams<{ id?: string; fromPreview?: string }>();
   const { data, submittedForms, setData } = useFormStore();
  const [form, setForm] = useState(
    data.landDevelopment || {
      date:"",//cd
      sfNumber: "",//cd
      soilTypeCombined: [],//cd
      landBenefit: "",//cd
      latitude: "",//cd
      longitude: "",//cd
      proposalArea: "",//cd
      otherWorks: "",//cd
      pradanContribution: "",//cd
      farmerContribution: "",//cd
      totalEstimate: "",//cd
      workType2: "",//cd
      workType: "",//no
      workTypeText: "",//no
    }
  );
  useEffect(() => {
    const today = new Date();
    const formattedDate = ("0" + today.getDate()).slice(-2) + '/' + ("0" + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear();
    
      updateField("date", formattedDate);
    if (id && fromPreview === "true") {
      // Load the form by ID and update current working data
      const selected = submittedForms.find((form) => form.id === id);
      if (selected) {
        // Set every key in the form data
        Object.entries(selected).forEach(([key, value]) => {
          setData(key as keyof typeof data, value);
        });
      }
    }
  }, [id]);
  
  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const toggleCheckbox = (field: string, value: string) => {
    setForm((prev) => {
      const currentValue = typeof prev[field] === "string" ? prev[field] : "";
      const current = currentValue.split(",").filter(Boolean); // removes empty strings
  
      let updated;
      if (current.includes(value)) {
        updated = current.filter((item) => item !== value);
      } else {
        updated = [...current, value];
      }
  
      return {
        ...prev,
        [field]: updated.join(","),
      };
    });
  };
  const totalestimation =(feild : any,value : any) =>{
    const farmer = parseInt(feild) || 0;
    const pradan = parseInt(value) || 0;
    const totalestimate  = String(farmer + pradan);
    updateField("totalEstimate",totalestimate);
  }
  const renderCheckboxGroup = (
    field: string,
    options: string[],
    isSingle: boolean = false
  ) =>
    options.map((item) => (
      <Checkbox.Item
        key={item}
        label={item}
        status={
          isSingle
            ? form[field] === item
              ? "checked"
              : "unchecked"
            : form[field].includes(item)
            ? "checked"
            : "unchecked"
        }
        onPress={() =>
          isSingle ? updateField(field, item) : toggleCheckbox(field, item)
        }
      />
    ));

  const handleNext = () => {
    setData("landDevelopment", form);
    setTimeout(() => {
      if (fromPreview && returnTo) {
     
        router.push({ pathname: returnTo, params: { id ,returnsubmit:returnsubmit,fromsubmit:fromsubmit} });
      } else {
        if(fromland== "true"){
          router.push({pathname:"/prefd/bankDetails",params:{fromland:"true", frompond :"false",fromplantation:"false"}});
        }
        else if(frompond== "true"){
          router.push({pathname:"/prefd/bankDetails",params:{fromland:"false", frompond :"true",fromplantation:"false"}});
        }
        else if (fromplantation == "true"){
          router.push({pathname:"/prefd/bankDetails",params:{fromland:"false", frompond :"false",fromplantation:"true"}});
        }
      }
    }, 50); 
  };

  return (
      <KeyboardAwareScrollView style={styles.container}>  
       <ScrollView contentContainerStyle={styles.inner}>
      {/* <IconButton icon="arrow-left" size={24} onPress={() => router.back()} /> */}

         <Text style={styles.heading_land}>PLANTATION FORM</Text>
     <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={width * .06} color="#0B8B42" />
          </TouchableOpacity>
          <Text style={styles.heading}>Proposed Work by the Farmer</Text>
        </View>

      <Text style={styles.question}>31. S.F. No. of the land to be developed</Text>
      <TextInput
        value={form.sfNumber}
        onChangeText={(text) => updateField("sfNumber", text)}
        style={styles.input}
          placeholder="Enter S.F. Number"
          placeholderTextColor="#888"
        mode="outlined"
      />

      <Text style={styles.label}>35.a) Latitude and Longitude</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          mode="outlined"
           placeholderTextColor="#888"
          style={[styles.input, { flex: 1, marginRight: 5 }]}
          placeholder="Latitude"
          value={form.latitude}
          onChangeText={(text) => updateField("latitude", text)}
          keyboardType="numeric"
        />
        <TextInput
         placeholderTextColor="#888"
          mode="outlined"
          style={[styles.input, { flex: 1, marginLeft: 5 }]}
          placeholder="Longitude"
          value={form.longitude}
          onChangeText={(text) => updateField("longitude", text)}
          keyboardType="numeric"
        />
      </View>

    <Text style={styles.label}>36. Soil Type</Text>
            {renderCheckboxGroup("soilTypeCombined", ["Red Soil", "Black Cotton", "Sandy Loam", "Laterite"])}
 <Text style={styles.label}>38. Date of Inspection</Text>
                <TextInput
            value={form.date}
            style={styles.input}
            editable={false}
          />
      {/* <Text style={styles.question}>33. Land to benefit (ha)</Text>
      <TextInput
        value={form.landBenefit}
        onChangeText={(text) => updateField("landBenefit", text)}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
      /> */}

    

<Text style={styles.question}>38. Type of Plantation proposed:</Text>
     {renderCheckboxGroup("workType", [
       "Mango",
       "Guava",
       "Lemon",
       "Other",
     ])}
     
     {/* Show text input only if 'Other' is selected */}
     {form.workType?.split(",").includes("Other") && (
  <TextInput
    value={form.workTypeText}
    onChangeText={(text) => {
      updateField("workTypeText", text);
      if (typeof form.workType === "string") {
        const updatedWorkType = form.workType.split(",").map((item) => (item === "Other" ? text : item)).join(",");
        updateField("workType2", updatedWorkType);
      }
    }}
    
    style={styles.input}
    placeholder="Specify other work types"
  />
)}


      <Text style={styles.label}>40. Area benefited by proposed works (ha)</Text>
      <TextInput
        value={form.proposalArea}
           placeholder="Enter area"
          placeholderTextColor="#888"
        onChangeText={(text) => updateField("proposalArea", text)}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
      />

  <Text style={styles.label}>41. Any other works proposed</Text>
      <TextInput
      placeholder="Enter details"
          placeholderTextColor="#888"
        value={form.otherWorks}
        onChangeText={(text) => updateField("otherWorks", text)}
        style={styles.input}
        mode="outlined"
      />

     <Text style={styles.label}>42. PRADAN contribution (in Rs)</Text>
      <TextInput
        value={form.pradanContribution}
        onChangeText={(text) => updateField("pradanContribution", text)}
        style={styles.input}
         placeholder="Enter amount"
          placeholderTextColor="#888"
        keyboardType="numeric"
        mode="outlined"
      />

 <Text style={styles.label}>43. Farmer contribution (in Rs)</Text>
      <TextInput
       placeholder="Enter amount"
          placeholderTextColor="#888"
        value={form.farmerContribution}
        onChangeText={(text) => {updateField("farmerContribution", text)
          totalestimation( text, form.pradanContribution )
        }}
        
        style={styles.input}
        keyboardType="numeric"
      />

       <Text style={styles.label}>44. Total Estimate Amount (in Rs)</Text>
                  <TextInput
                   placeholder="0"
          placeholderTextColor="#888"
                  value={form.totalEstimate}
                    editable={false}
                    style={styles.input}
                    mode="outlined"
                  />
     <TouchableOpacity style={styles.nextBtn}  onPress={handleNext}>
          <Text style={styles.nextBtnText}>{fromPreview ? "Preview" : "NEXT"}</Text>
        </TouchableOpacity>
      {/* <Button mode="contained" onPress={handleNext} style={styles.button}>
      {fromPreview ? "SUBMIT" : "NEXT"}
      </Button> */}
    </ScrollView>
    </KeyboardAwareScrollView>
 
  );
}

const styles = StyleSheet.create({
  // container: {
  //   padding: 20,
  //   paddingBottom: 40,
  // },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  question: {
     fontSize: width * 0.035,
    marginVertical: height * 0.01,
    color: '#333',
    fontWeight: 'bold',
  },
  // input: {
  //   marginBottom: 10,
  // },
  divider: {
    marginVertical: 10,
  },
  button: {
    marginTop: 30,
  },
   container: {
    flex: 1,
    backgroundColor: '#F1F7ED',
  },
  inner: {
    paddingTop: height * 0.025,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.025,
  },
  heading_land: {
    fontSize: width * 0.055, // ~22 on 400px screen
    fontWeight: 'bold',
    color: '#0B8B42',
    marginBottom: height * 0.012,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  backButton: {
    zIndex: 10,
  },
  heading: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#0B8B42',
    marginLeft: width * 0.025,
  },
  label: {
    fontSize: width * 0.035,
    marginVertical: height * 0.01,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
     height: height * 0.06,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: width * 0.025,
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.000,
    backgroundColor: '#E8F5E9',
    color: '#333',
    fontSize: width * 0.035,
    marginBottom: height * 0.015,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: height * 0.015,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: width * 0.04,
    marginBottom: height * 0.01,
  },
  radioText: {
    marginLeft: width * 0.015,
    fontSize: width * 0.035,
    color: '#333',
  },
  nextBtn: {
    backgroundColor: '#134e13',
    paddingVertical: height * 0.018,
    borderRadius: width * 0.025,
    alignItems: 'center',
    marginTop: height * 0.025,
    marginBottom: height * 0.025,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});
