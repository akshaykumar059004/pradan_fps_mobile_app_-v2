import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Checkbox, RadioButton } from "react-native-paper";
import { useFormStore } from "../../storage/useFormStore";
import { useUserStore } from "../../storage/userDatastore";
  const { width, height } = Dimensions.get('window'); 
export default function BasicDetails() {
  const router = useRouter();
  const { id, fromPreview, returnTo, returnsubmit, fromsubmit,fromland,fromplantation,frompond } = useLocalSearchParams<{
    id?: string;
    fromPreview?: string;
    returnTo?: string;
    returnsubmit?: string;
    fromsubmit?: string;
    fromland?: string;
    frompond?: string;
    fromplantation?: string;
  }>();
  const { data, submittedForms, setData,resetData } = useFormStore();
const {user} = useUserStore();
  const [form, setForm] = useState(
    data.basicDetails || {
      name: "",//cd
      age: "",
      mobile: "",
      district: "",
      hamlet: "",
      panchayat: "",
      block: "",
      idCardType: "Aadhar",//cd
      idCardNumber: "",//cd
      othercard:"", //no
      gender: "",
      fatherSpouse: "",//cd
      householdType: "",//cd
      adults: "",//no
      children: "",//no
      occupation: { agriculture: "", business: "", other: "" },//no
      specialCategory: "",//no
      specialCategoryNumber: "0",//cd
      caste: "",
      houseOwnership: "",//cd
      houseType: "",//cd
      drinkingWater: [],//no
      potability: [],//no
      domesticWater: [],//no
      toiletAvailability: "",//cd
      toiletCondition: "",//cd
      education: "",//cd
      hhcombined:"",//cd
      occupationCombined:"",//cd
      drinkingWaterCombined:[],//cd
      potabilityCombined:[],//cd
      domesticWaterCombined:[],//cd    
      }
  );
  
  useEffect(() => {
    if(fromPreview == "true"){
        updateField("idCardType","Aadhar");
    }
  setData("user_id", user.id);
  if ((id && fromPreview === "true") || (id && fromsubmit === "true")) {
    const selected = submittedForms.find((form) => form.id === id);
    if (selected) {
      Object.entries(selected).forEach(([key, value]) => {
        setData(key as keyof typeof data, value);
      });
    }
  }
}, [id]);



  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const updateNestedField = (parent: string, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],[field]: value,
      },
    }));
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

  const hand =() =>{
    updateField("specialCategoryNumber",0);
    if(form.idCardType === "Other"){
      updateField("idCardType",form.othercard);
    }
  }

  // in which id the basics updated while from submitted text
  const handleNext = () => {
    updateField("idCardType",form.othercard);
    setData("basicDetails", form);

    if (fromPreview == "true" && returnTo ){
      console.log(returnTo);
      router.push({ pathname: returnTo, params: { id ,returnsubmit:returnsubmit,fromsubmit:fromsubmit ,fromPreview:fromPreview} });
    } 
    // for  from submit check here
    else if (fromsubmit && returnsubmit){
      router.push({ pathname: returnTo, params: { id ,returnsubmit:returnsubmit,fromsubmit:fromsubmit} });
    }
    else {
        if(fromland == "true"){
          
          router.push({pathname:"/prefd/landOwnership",params:{fromland:"true", frompond :"false",fromplantation:"false"}});
        }
        else if(frompond=="true"){
          router.push({pathname:"/prefd/landOwnership",params:{fromland:"false", frompond :"true",fromplantation:"false"}});
        }
        else if(fromplantation == "true"){
          router.push({pathname:"/prefd/landOwnership",params:{fromland:"false", frompond :"false",fromplantation:"true"}});
        }
    }
  };

  const renderCheckboxGroup = (
    // styles={styles.checkboxGroup},
    field: string,
    options: string[],
    isSingle: boolean = false
  ) =>
    
    options.map((item) => (
      
      <Checkbox.Item
        key={item}
        // style={styles.checkboxOption}
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


  return (
    <KeyboardAwareScrollView style={styles.container}>
    <ScrollView contentContainerStyle={styles.inner}>
 <Animatable.View animation="fadeInUp" duration={600}> 
  <Text style={styles.heading_land}>
  {fromland === "true"
    ? "LAND REDEVELOPMENT FORM"
    : frompond === "true"
    ? "POND REDEVELOPMENT FORM"
    : fromplantation === "true"
    ? "PLANTATION REDEVELOPMENT FORM"
    : "Form"}
</Text>
    <View style={styles.headingContainer}>
                           {/* <IconButton icon="arrow-left" size={24} onPress={() => router.back()} /> */}
                         <TouchableOpacity onPress={() => router.back()}>
                          <Ionicons name="arrow-back" size={width * .06} color="#0B8B42" />
                        </TouchableOpacity>
                        <Text style={styles.heading}>Basic Details</Text>
                      </View>
      


      {/* Inputs */}
      <Text style={styles.label}>1. Name of Farmer</Text>
      <TextInput
      placeholder="Enter name" placeholderTextColor="#888"
        value={form.name}
        onChangeText={(text) => {
          const filteredText = text.replace(/[^A-Za-z\s]/g, '');
          updateField("name", filteredText);
        }}
        style={styles.input}
      />
    <Text style={styles.label}>2. Age</Text>
<TextInput
placeholder="Enter Age" placeholderTextColor="#888"
  value={form.age}
  onChangeText={(text) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    updateField("age", filteredText);
  }}
  style={[
    styles.input,
    form.age !== '' && parseInt(form.age) > 150 && {
      borderColor: 'red',
      borderWidth: 1,
    },
  ]}
  keyboardType="numeric"
/>
{form.age !== '' && parseInt(form.age) > 150 && (
  <Text style={{ color: 'red', fontSize: 12 }}>Age cannot exceed 150</Text>
)}

            <Text style={styles.label}>3. Mobile Number</Text>
     <TextInput
      value={form.mobile}
      placeholder="Enter mobile" placeholderTextColor="#888"
      onChangeText={(text) => {
      const filteredText = text.replace(/[^0-9]/g, '').slice(0, 10);
      updateField("mobile", filteredText);
      }}
      style={[
      styles.input,
      form.mobile.length > 0 && form.mobile.length !== 10 && { borderColor: 'red', borderWidth: 1 }
      ]}
      keyboardType="numeric"
/>

{form.mobile.length > 0 && form.mobile.length !== 10 && (
  <Text style={{ color: 'red', fontSize: 12 }}>Mobile number must be exactly 10 digits</Text>
)}

      <Text style={styles.label}>4. District</Text>
      <TextInput
      placeholder="Enter District" placeholderTextColor="#888"
        value={form.district}
        onChangeText={(text) => {
          const filteredText = text.replace(/[^A-Za-z\s]/g, '');
          updateField("district", filteredText);
        }}
        style={styles.input}
      />
       <Text style={styles.label}>5. Block</Text>
      <TextInput
       placeholder="Enter Block" placeholderTextColor="#888"
        value={form.block}
        onChangeText={(text) => {
          const filteredText = text.replace(/[^A-Za-z\s]/g, '');
          updateField("block", filteredText);
        }}
        style={styles.input}
      />
     <Text style={styles.label}>6. Panchayat</Text>
      <TextInput
        value={form.panchayat}
         placeholder="Enter Panchayat" placeholderTextColor="#888"
        onChangeText={(text) => {
          const filteredText = text.replace(/[^A-Za-z\s]/g, '');
          updateField("panchayat", filteredText);
        }}
        style={styles.input}
      />
      <Text style={styles.label}>7.Hamlet </Text>
      <TextInput
      placeholder="Enter Hamlet" placeholderTextColor="#888"
        value={form.hamlet}
        onChangeText={(text) => {
          const filteredText = text.replace(/[^A-Za-z\s]/g, '');
          updateField("hamlet", filteredText);
        }}
        style={styles.input}
      />
{/* <Text style={styles.question}>8. Identity Card:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("idCardType", value)}
  value={form.idCardType}
>
  <RadioButton.Item label="Aadhar" value="Aadhar" />
  <RadioButton.Item label="EPIC" value="EPIC" />
  <RadioButton.Item label="Driving License" value="Driving License" />
  <RadioButton.Item label="Other" value="Other" />
</RadioButton.Group>
{form.idCardType === "Other" && (
  <TextInput
    value={form.othercard}
    onChangeText={(text) => updateField("othercard", text)}
    style={styles.input}
    placeholder="Specify Identity Card"
  />
)} */}

<Text style={styles.question}>8. Aadhar Card Number:</Text>
<TextInput
  value={form.idCardNumber}
  placeholder="Enter ID No." placeholderTextColor="#888"
  onChangeText={(text) => {
    let filteredText = text;

    if (form.idCardType === "Aadhar") {
      
      filteredText = text.replace(/[^0-9]/g, '').slice(0, 12);
    } else if (form.idCardType === "EPIC" || form.idCardType === "Driving License") {
      filteredText = text.replace(/[^a-zA-Z0-9]/g, '');
    } 
    hand();
    updateField("idCardNumber", filteredText);
  }}
  style={styles.input}
  placeholder={
    form.idCardType === "Aadhar"
      ? "Enter 12-digit Aadhar number"
      : form.idCardType === "EPIC" || form.idCardType === "Driving License"
      ? "Enter ID card number"
      : "Enter ID card number"
  }
/>


<Text style={styles.question}>9. Gender:</Text>
{/* <View  style={styles.radioGroup}> */}
  <RadioButton.Group
  onValueChange={(value) => updateField("gender", value)}
  value={form.gender}
>
  <RadioButton.Item    label="Male" value="Male" />
  <RadioButton.Item    label="Female" value="Female" />
  <RadioButton.Item   label="Transgender" value="Transgender" />
</RadioButton.Group>
{/* </View> */}


      <Text style={styles.question}>10. Father / Spouse Name:</Text>
      <TextInput
        value={form.fatherSpouse}
        onChangeText={(text) => updateField("fatherSpouse", text)}
         placeholder="Enter Name"
        style={styles.input}
      />

<Text style={styles.question}>11. Type of Household:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("householdType", value)}
  value={form.householdType}
>
  <RadioButton.Item label="Nuclear" value="Nuclear" />
  <RadioButton.Item label="Joint" value="Joint" />
</RadioButton.Group>

            <Text style={styles.label}>12. Household Members</Text>
<View style={styles.row}>
  <View style={styles.inputHalfWrapper}>
    <Text style={styles.subLabel}>Adults</Text>
    <TextInput style={styles.inputHalf} 
     value={String(form.adults)}
    onChangeText={(text) => {
    // Allow only numbers, less than 50
    let filteredText = text.replace(/[^0-9]/g, '');
    if (parseInt(filteredText) > 50) filteredText = '50';
    
    // Update both fields and store them in a single variable
    const updatedAdults = filteredText;
    const updatedChildren = form.children; // or get children value here
    
    // Combine both values and update a single field
    const hhcombined = `${updatedAdults},${updatedChildren}`;
    updateField("hhcombined", hhcombined); // Save combined value in a single field
    updateField("adults", updatedAdults); // Optionally, keep adults separate
  }}
    keyboardType="numeric" placeholder="0" placeholderTextColor="#888" />
  </View>
  <View style={styles.inputHalfWrapper}>
    <Text style={styles.subLabel}>Children</Text>
    <TextInput style={styles.inputHalf} 
    value={String(form.children)}
     onChangeText={(text) => {
    let filteredText = text.replace(/[^0-9]/g, '');
    if (parseInt(filteredText) > 50) filteredText = '50';
    
    // Update both fields and store them in a single variable
    const updatedChildren = filteredText;
    const updatedAdults = form.adults; // or get adults value here
    
    // Combine both values and update a single field
    const hhcombined = `${updatedAdults},${updatedChildren}`;
    // Save combined value in a single field
    updateField("children", updatedChildren); // Optionally, keep children separate
     updateField("hhcombined", hhcombined);
  }}
    keyboardType="numeric" placeholder="0" placeholderTextColor="#888" />
  </View>
</View>
{/* 
<Text style={styles.label}>13. Household Members:</Text>
<View style={styles.row}></View>
<Text style={styles.subLabel}>Adults</Text>
<TextInput
 style={styles.inputHalf} 
  value={String(form.adults)}
  
  onChangeText={(text) => {
    // Allow only numbers, less than 50
    let filteredText = text.replace(/[^0-9]/g, '');
    if (parseInt(filteredText) > 50) filteredText = '50';
    
    // Update both fields and store them in a single variable
    const updatedAdults = filteredText;
    const updatedChildren = form.children; // or get children value here
    
    // Combine both values and update a single field
    const hhcombined = `${updatedAdults},${updatedChildren}`;
    updateField("hhcombined", hhcombined); // Save combined value in a single field
    updateField("adults", updatedAdults); // Optionally, keep adults separate
  }}
  
  placeholder="Adults"
  keyboardType="numeric"
/>
<Text style={styles.subLabel}>Children</Text>
<TextInput
  value={String(form.children)}
  onChangeText={(text) => {
    let filteredText = text.replace(/[^0-9]/g, '');
    if (parseInt(filteredText) > 50) filteredText = '50';
    
    // Update both fields and store them in a single variable
    const updatedChildren = filteredText;
    const updatedAdults = form.adults; // or get adults value here
    
    // Combine both values and update a single field
    const hhcombined = `${updatedAdults},${updatedChildren}`;
    // Save combined value in a single field
    updateField("children", updatedChildren); // Optionally, keep children separate
     updateField("hhcombined", hhcombined);
  }}
  style={styles.input}
  placeholder="Children"
  keyboardType="numeric"
/> */}


<Text style={styles.question}>13. Occupation of Household Members (No. of persons):</Text>
<View style={styles.irrigationRow}>
  <View style={styles.inputIrrigationWrapper}>
    <Text style={styles.subLabel}>Agriculture</Text>
<TextInput
  value={String(form.occupation.agriculture)}
  onChangeText={(text) => {
    updateNestedField("occupation","agriculture",text);
    const updatedAgriculture = text;
    const updatedBusiness = form.occupation.business;
    const updatedOther = form.occupation.other;
    const occupationCombined = `${updatedAgriculture},${updatedBusiness},${updatedOther}`;
    updateField("occupationCombined" , occupationCombined);
  }}
  style={[
    styles.input,
    form.occupation.agriculture !== '' && parseInt(form.occupation.agriculture) > 50 && {
      borderColor: 'red',
      borderWidth: 1,
    },
  ]}
  placeholderTextColor="#888"
  placeholder="0"
  keyboardType="numeric"
/>
</View>
 <View style={styles.inputIrrigationWrapper}>
    <Text style={styles.subLabel}>Business</Text>
<TextInput
  value={String(form.occupation.business)}
  onChangeText={(text) => {
    updateNestedField("occupation","business",text);
    const updatedBusiness = text;
    const updatedAgriculture = form.occupation.agriculture;
    const updatedOther = form.occupation.other;

    const occupationCombined = `${updatedAgriculture},${updatedBusiness},${updatedOther}`;
    updateField("occupationCombined" , occupationCombined);
  }}
  style={[
    styles.input,
    form.occupation.business !== '' && parseInt(form.occupation.business) > 50 && {
      borderColor: 'red',
      borderWidth: 1,
    },
  ]}
  placeholderTextColor="#888"
  placeholder="0"
  keyboardType="numeric"
/>
</View>
 <View style={styles.inputIrrigationWrapper}>
    <Text style={styles.subLabel}>Others</Text>
<TextInput
  value={String(form.occupation.other)}
  onChangeText={(text) => {
    updateNestedField("occupation","other",text);
    const updatedOther = text;
    const updatedAgriculture = form.occupation.agriculture;
    const updatedBusiness = form.occupation.business;

    const occupationCombined = `${updatedAgriculture},${updatedBusiness},${updatedOther}`;
    updateField("occupationCombined" , occupationCombined);
  }}
  placeholderTextColor="#888"
  style={[
    styles.input,
    form.occupation.other !== '' && parseInt(form.occupation.other) > 50 && {
      borderColor: 'red',
      borderWidth: 1,
    },
  ]}
  placeholder="0"
  keyboardType="numeric"
/>
</View>
</View>
<Text style={styles.question}>14. Special Category:</Text>
<Checkbox.Item
  label="Disabled"
  status={form.specialCategory ? "checked" : "unchecked"}
  onPress={() => updateField("specialCategory", !form.specialCategory)}
/>
{form.specialCategory && (
  <>
    <TextInput
      value={form.specialCategoryNumber}
      onChangeText={(text) => {
        let filteredText = text.replace(/[^0-9]/g, '');
        updateField("specialCategoryNumber", filteredText);
      }}
      style={[
        styles.input,
        form.specialCategoryNumber !== '' && parseInt(form.specialCategoryNumber) > 50 && {
          borderColor: 'red',
          borderWidth: 1,
        },
      ]}
      placeholder="Number of Disabled Persons"
      keyboardType="numeric"
    />
    
    {form.specialCategoryNumber !== '' && parseInt(form.specialCategoryNumber) > 50 && (
      <Text style={{ color: 'red', fontSize: 12 }}>
        Number of disabled persons cannot exceed 50
      </Text>
    )}
  </>
)}


<Text style={styles.question}>15. Caste:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("caste", value)}
  value={form.caste}
>
  <RadioButton.Item label="OC" value="OC" />
  <RadioButton.Item label="OBC" value="OBC" />
  <RadioButton.Item label="SC" value="SC" />
  <RadioButton.Item label="ST" value="ST" />
</RadioButton.Group>


<Text style={styles.question}>16. House Ownership:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("houseOwnership", value)}
  value={form.houseOwnership}
>
  <RadioButton.Item label="Rented" value="Rented" />
  <RadioButton.Item label="Owned" value="Owned" />
</RadioButton.Group>

<Text style={styles.question}>17. Type of House:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("houseType", value)}
  value={form.houseType}
>
  <RadioButton.Item label="Pucca" value="pucca" />
  <RadioButton.Item label="Kutcha" value="kutcha" />
</RadioButton.Group>

      <Text style={styles.question}>18. Drinking Water Source:</Text>
      {renderCheckboxGroup("drinkingWaterCombined", ["Ponds", "Well & Borewells", "Trucks"])}

      <Text style={styles.question}>19. Potability:</Text>
      {renderCheckboxGroup("potabilityCombined", ["Ponds", "Tanks", "Well & Borewells"])}

      <Text style={styles.question}>20. Domestic Water Source:</Text>
      {renderCheckboxGroup("domesticWaterCombined", ["Ponds", "Tanks", "Well & Borewells"])}

      <Text style={styles.question}>21. Toilet Availability:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("toiletAvailability", value)}
  value={form.toiletAvailability}
>
  <RadioButton.Item label="Yes" value="Yes" />
  <RadioButton.Item label="No" value="No" />
</RadioButton.Group>
      
<Text style={styles.question}>22. Toilet Condition:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("toiletCondition", value)}
  value={form.toiletCondition}
>
  <RadioButton.Item label="Yes" value="yes" />
  <RadioButton.Item label="No" value="no" />
</RadioButton.Group>
      <Text style={styles.question}>23. Education of Householder:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("education", value)}
  value={form.education}
>
  <RadioButton.Item label="Illiterate" value="Illiterate" />
  <RadioButton.Item label="Primary" value="Primary" />
  <RadioButton.Item label="Secondary" value="Secondary" />
  <RadioButton.Item label="University" value="University" />
</RadioButton.Group>

  <TouchableOpacity style={styles.nextBtn}
                          onPress={() => handleNext()}>

              <Text style={styles.nextBtnText}> {fromPreview ? "Preview" : "Next"}</Text>
              
            </TouchableOpacity>
{/* <Button mode="contained" onPress={handleNext} style={styles.nextBtn}>
  {fromPreview ? "Preview" : "Next"}
</Button> */}
</Animatable.View>
    </ScrollView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F1F7ED',
    },
    inner: {
      padding: width * 0.05, // 5% of screen width
      paddingBottom: height * 0.03,
    },
    heading_land: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: '#0B8B42',
      marginBottom: height * 0.02,
      textAlign: 'center',
    },
    headingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: height * 0.02,
    },
    heading: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      color: '#0B8B42',
      marginBottom: height * 0.005,
    },
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
      fontWeight: '600',
  },
   checkboxGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    checkboxOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: width * 0.04,
      marginBottom: height * 0.01,
    },
  label: {
      fontSize: width * 0.035,
      marginVertical: height * 0.01,
      color: '#333',
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: width * 0.025,
    },
  input: {
      borderWidth: 1,
      borderColor: '#A5D6A7',
      borderRadius: width * 0.025,
      paddingHorizontal: width * 0.035,
      paddingVertical: height * 0.015,
      backgroundColor: '#E8F5E9',
      color: '#333',
      fontSize: width * 0.035,
    },
  button: {
    marginTop: 30,
  },
    //  container: {
    //   flex: 1,
    //   backgroundColor: '#F1F7ED',
    // },
    // inner: {
    //   padding: width * 0.05, // 5% of screen width
    //   paddingBottom: height * 0.03,
    // },
    // heading_land: {
    //   fontSize: width * 0.06,
    //   fontWeight: 'bold',
    //   color: '#0B8B42',
    //   marginBottom: height * 0.02,
    //   textAlign: 'center',
    // },
    // headingContainer: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   marginBottom: height * 0.02,
    // },
    // heading: {
    //   fontSize: width * 0.05,
    //   fontWeight: 'bold',
    //   color: '#0B8B42',
    //   marginBottom: height * 0.005,
    // },
    // label: {
    //   fontSize: width * 0.035,
    //   marginVertical: height * 0.01,
    //   color: '#333',
    //   fontWeight: '600',
    // },
    // input: {
    //   borderWidth: 1,
    //   borderColor: '#A5D6A7',
    //   borderRadius: width * 0.025,
    //   paddingHorizontal: width * 0.035,
    //   paddingVertical: height * 0.015,
    //   backgroundColor: '#E8F5E9',
    //   color: '#333',
    //   fontSize: width * 0.035,
    // },
    inputHalf: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#A5D6A7',
      borderRadius: width * 0.025,
      paddingHorizontal: width * 0.035,
      paddingVertical: height * 0.015,
      backgroundColor: '#E8F5E9',
      color: '#333',
      fontSize: width * 0.035,
      marginRight: width * 0.025,
    },
    // row: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   gap: width * 0.025,
    // },
    radioGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: height * 0.01,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: width * 0.04,
      marginBottom: height * 0.01,
    },
    radioText: {
      marginLeft: width * 0.02,
      fontSize: width * 0.035,
      color: '#333',
    },
    // checkboxGroup: {
    //   flexDirection: 'row',
    //   flexWrap: 'wrap',
    // },
    // checkboxOption: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   marginRight: width * 0.04,
    //   marginBottom: height * 0.01,
    // },
    nextBtn: {
      backgroundColor: '#134e13',
      paddingVertical: height * 0.018,
      borderRadius: width * 0.025,
      alignItems: 'center',
      marginTop: height * 0.03,
    },
    nextBtnText: {
      color: '#fff',
      fontSize: width * 0.04,
      fontWeight: '600',
    },
    dropdown: {
      borderColor: '#A5D6A7',
      borderRadius: width * 0.025,
      marginBottom: height * 0.015,
      backgroundColor: '#E8F5E9',
    },
    dropdownContainer: {
      borderColor: '#A5D6A7',
      backgroundColor: '#E8F5E9',
      borderRadius: width * 0.025,
    },
    irrigationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: height * 0.015,
    },
    irrigationInput: {
      flex: 1,
      marginRight: width * 0.02,
    },
    subLabel: {
      fontSize: width * 0.033,  // ~13px on typical 390px width
      color: '#555',
      marginBottom: height * 0.005,
      fontWeight: '500',
    },
    
    inputHalfWrapper: {
      flex: 1,
      marginRight: width * 0.02,
    },
    
    inputIrrigationWrapper: {
      flex: 1,
      marginHorizontal: width * 0.01,
    },
    
});