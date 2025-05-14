import axios from "axios";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, IconButton, Text } from "react-native-paper";
import { useDraftStore } from "../../storage/DraftStore";
import { useFormStore } from "../../storage/useFormStore";
const url = Constants.expoConfig.extra.API_URL;

export default function   Preview() {
  const router = useRouter();
  const { id,fromsubmit,returnsubmit,fromPreview} = useLocalSearchParams<{ id?: string , returnsubmit?: string,fromsubmit?: string, fromPreview?:string;}>();
  const { data, submittedForms, resetData,setData, submitForm,setNestedData,set2NestedData } = useFormStore();//draftForms,
  const {drafts,saveDraft} = useDraftStore();
const isSubmittedPreview = !!id;

const selectedForm = React.useMemo(() => {
  if (fromsubmit) {

   
    // console.log(JSON.stringify(data) + "inside");
    return data; // Always use updated data when fromsubmit
  }
  // if (isSubmittedPreview && id || draftForms && id) {
    if (isSubmittedPreview && id ) {
    return submittedForms.find((form) => String(form.id) === id);
  }
  return data;
}, [id, fromsubmit, submittedForms, data]);

const canEdit = () => {
  if (!isSubmittedPreview) return true; // it's a draft
  const status = selectedForm?.bankDetails?.formStatus;
  return  status ===1||status === 2|| status === 3;
};
  // console.log("Selected Form:", selectedForm);
  // console.log(id);
  if (!selectedForm) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", color: "red" }}>Form not found!</Text>
      </View>
    );
  }

  const [submitting, setSubmitting] = React.useState(false);
  const generateDraftId = () => {
  const now = new Date();
  return `draft-${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
    .getHours()
    .toString()
    .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}${now.getMilliseconds().toString().padStart(3, "0")}`;
};

useEffect(() => {  
  if(fromsubmit == "true" && fromPreview != "true"){
const occupationarray = data.basicDetails.occupationCombined.split(',');
if(data.basicDetails.specialCategoryNumber >0){
  setNestedData("basicDetails","specialCategory","Yes");
}
    set2NestedData("basicDetails","occupation","agriculture",occupationarray[0]);
    set2NestedData("basicDetails","occupation","business",occupationarray[1]);
    set2NestedData("basicDetails","occupation","other",occupationarray[2]);
// const Householdarray = data.basicDetails.hhcombined.split(',');
    setNestedData("basicDetails","adults",1);
    setNestedData("basicDetails","children",1);
    const Irrigationarray = data.landOwnership.irrigatedLandCombined.split(',');
    set2NestedData("landOwnership","irrigatedLand","rainfed",Irrigationarray[0]);
    set2NestedData("landOwnership","irrigatedLand","tankfed",Irrigationarray[1]);
    set2NestedData("landOwnership","irrigatedLand","wellIrrigated",Irrigationarray[2]);
    const livestockarray = data.landOwnership.livestockCombined.split(',');
    set2NestedData("landOwnership","livestock","goat",livestockarray[0]);
    set2NestedData("landOwnership","livestock","sheep",livestockarray[1]);
    set2NestedData("landOwnership","livestock","milchAnimals",livestockarray[2]);
    set2NestedData("landOwnership","livestock","draught_animals",livestockarray[3]);
    set2NestedData("landOwnership","livestock","poultry",livestockarray[4]);
    set2NestedData("landOwnership","livestock","others",livestockarray[5]);
    // setData("basicDetails",data.basicDetails);
    // setData("bankDetails",data.bankDetails)
    // setData("landDevelopment",data.landDevelopment);
    // setData("landOwnership",data.landOwnership);
  }
  const draftId = generateDraftId();
  setData("draft_id", draftId);
  setData("formType", 3);
}, []);
const handleSubmit = async () => {
  if (submitting) return;
  try {
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    await axios.post(`${url}/api/formData/postPlantationformData`, data);
    Alert.alert("Success", "Form Successfully Submitted!", [
      {
        text: "OK",
        onPress: () => {
          // Clear all form store data
          resetData();
          router.push("/dashboard");
        },
      },
    ]);
  } catch (error) {
    Alert.alert("Error", "Failed to submit the form. Please try again.\n" + error);
  } finally {
    resetData();
    setSubmitting(false);
  }
};
  
  const renderSection = (title: string, fields: any[], editRoute: string) => (
    <Card style={styles.card}>
      <Card.Title title={title} />
      <Card.Content>
        {fields.map((field, index) => (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            {Array.isArray(field.value) ? (
              field.value.map((item, idx) => {
                if (typeof item === "object" && item?.label && item?.uri) {
                  return (
                    <View key={idx} style={styles.fileRow}>
                      <Text style={styles.value}>{item.label}</Text>
                      <Button
                        mode="text"
                        onPress={() =>
                          router.push({pathname: "/pdfViewer",params: { uri: item.uri },})
                        }
                        compact
                      >
                        View
                      </Button>
                    </View>
                  );
                } else if (typeof item === "object") {
                  return (
                    <Text key={idx} style={styles.value}>
                      {JSON.stringify(item)}
                    </Text>
                  );
                } else {
                  return (
                    <Text key={idx} style={styles.value}>
                      {item}
                    </Text>
                  );
                }
              })
            ) : typeof field.value === "object" && field.value !== null ? (
              Object.entries(field.value).map(([key, val], idx) => (
                <Text key={idx} style={styles.value}>{`${key}: ${val}`}</Text>
              ))
            ) : (
              <Text style={styles.value}>{field.value}</Text>
            )}
            <Divider style={styles.divider} />
          </View>
        ))}
      </Card.Content>
      {canEdit() && (
  <Card style={styles.card}>
    <Card.Actions>
      <Button
        mode="outlined"
        onPress={() =>
          router.push({
            pathname: editRoute,
            params: {
              id: id,
              fromPreview: "true",
              returnTo: "/plantationform/Preview",
              fromsubmit: fromsubmit,
              returnsubmit: returnsubmit,
              fromedit:"true",
            },
          })
        }
      >
        Edit
      </Button>
    </Card.Actions>
  </Card>
)}

    </Card>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconButton
     icon="arrow-left"
     size={24}
     style={styles.backButton}
     onPress={() => {
    if (fromsubmit) {
      router.push(returnsubmit); // Go back to total submitted page
    } else {
      router.back(); // Go back normally
    }
  }}
/>
      <Text style={styles.title}>Plantation Form</Text>
      <View style={styles.farmerPhotoContainer}>
        {selectedForm?.bankDetails?.submittedFiles?.farmerPhoto?.uri ? (
          <Image
            source={{ uri: selectedForm.bankDetails.submittedFiles.farmerPhoto.uri }}
            style={styles.farmerPhoto}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.noPhotoText}>Add a farmer photo</Text>
        )}
      </View>
      {renderSection("Basic Details", [
         {label : "Date",value: selectedForm.landDevelopment?.date},
        {label : "ID",value: id},
        { label: "1. Name of Farmer", value: selectedForm.basicDetails?.name},
        { label: "1-2. Age", value: selectedForm.basicDetails?.age},
        { label: "2. Mobile Number", value: selectedForm.basicDetails?.mobile},
        { label: "3. District", value: selectedForm.basicDetails?.district},
        { label: "4. Block", value: selectedForm.basicDetails?.block},
        { label: "5. Panchayat", value: selectedForm.basicDetails?.panchayat},
        { label: "6. Hamlet", value: selectedForm.basicDetails?.hamlet},
        { label: "6. Identity Card", value: selectedForm.basicDetails?.idCardType},
        { label: "7. ID Card Number", value: selectedForm.basicDetails?.idCardNumber},
        { label: "8. Gender", value: selectedForm.basicDetails?.gender},
        { label: "9. Father / Spouse Name", value: selectedForm.basicDetails?.fatherSpouse },
        { label: "10. Type of Household", value: selectedForm.basicDetails?.householdType },
        // { label: "11. Household Members - Adults , childern", value: selectedForm.basicDetails?.hhcombined},
        { label: "11. Household Members - Adults", value: selectedForm.basicDetails?.adults },
        { label: "    Household Members - Children", value: selectedForm.basicDetails?.children },
        { label: "12. Occupation of Household Members (Agriculture , Business , Others)", value: selectedForm.basicDetails?.occupation},
        { label: "13. Special Category", value: selectedForm.basicDetails?.specialCategory ? "Yes" : "No" },
        { label: "    Special Category Number", value: selectedForm.basicDetails?.specialCategoryNumber },
        { label: "14. Caste", value: selectedForm.basicDetails?.caste },
        { label: "15. House Ownership", value: selectedForm.basicDetails?.houseOwnership },
        { label: "16. Type of House", value: selectedForm.basicDetails?.houseType },
        { label: "17. Drinking Water Source", value: selectedForm.basicDetails?.drinkingWaterCombined },
        { label: "18. Potability", value: selectedForm.basicDetails?.potabilityCombined },
        { label: "19. Domestic Water Source", value: selectedForm.basicDetails?.domesticWaterCombined },
        { label: "20. Toilet Availability", value: selectedForm.basicDetails?.toiletAvailability },
        { label: "21. Toilet Condition", value: selectedForm.basicDetails?.toiletCondition },
        { label: "22. Education of Householder", value: selectedForm.basicDetails?.education },
      ], "/prefd/basicDetails")}

      {renderSection("Land Ownership & Livestock", [
        { label: "23. Land Ownership", value: selectedForm.landOwnership?.landOwnershipType },
        { label: "24. Well for Irrigation", value: selectedForm.landOwnership?.hasWell },
        { label: "    Area Irrigated (ha)", value: selectedForm.landOwnership?.areaIrrigated },
        { label: "25. Irrigated Lands (ha) (rainfed , tankfed , wellIrrigated)", value: selectedForm.landOwnership?.irrigatedLand},
        { label: "26. Patta Number", value: selectedForm.landOwnership?.pattaNumber },
        { label: "27. Total Area (ha)", value: selectedForm.landOwnership?.totalArea },
        { label: "27-28. Taluk", value: selectedForm.landOwnership?.taluk },
        { label: "27-28. Firka", value: selectedForm.landOwnership?.firka},
        { label: "28. Revenue Village", value: selectedForm.landOwnership?.revenueVillage },
        { label: "29. Crop Season", value: selectedForm.landOwnership?.cropSeasonCombined },
        { label: "30. LiveStocks (goat , Sheep , Milch Animals ,  Draught Animals , Poultry , Others)", value: selectedForm.landOwnership?.livestock},
        // { label: " Goat", value: selectedForm.landOwnership?.livestock?.goat || "0" },
        // { label: "    Sheep", value: selectedForm.landOwnership?.livestock?.sheep || "0" },
        // { label: "    Milch Animals :", value: selectedForm.landOwnership?.livestock?.milchAnimals || "0" },
        // { label: "    Draught Animals :", value: selectedForm.landOwnership?.livestock?.draught_animals || "0" },
        // { label: "    Poultry :", value: selectedForm.landOwnership?.livestock?.poultry || "0" },
        // { label: "    Others :", value: selectedForm.landOwnership?.livestock?.others || "0" },
         ], "/prefd/landOwnership")}

      {renderSection("Land Development Details", [
        { label: "31. S.F. No.", value: selectedForm.landDevelopment?.sfNumber },
        { label: "31.a) Latitude", value: selectedForm.landDevelopment?.latitude },
        { label: "      Longitude", value: selectedForm.landDevelopment?.longitude },
        { label: "32. Soil Type", value: selectedForm.landDevelopment?.soilTypeCombined },
        { label: "33. Land to benefit (ha)", value: selectedForm.landDevelopment?.landBenefit },
        { label: "36. Date of Inspection", value: selectedForm.landDevelopment?.date},
        { label: "38. Type of plantation proposed", value: selectedForm.landDevelopment?.workType2 },
        // { label: "    Details about work types", value: selectedForm.landDevelopment?.workTypeText },
        { label: "39. Area benefited (ha)", value: selectedForm.landDevelopment?.proposalArea },
        { label: "40. Any other works proposed", value: selectedForm.landDevelopment?.otherWorks },
        { label: "41. PRADAN Contribution", value: selectedForm.landDevelopment?.pradanContribution },
        { label: "42. Farmer Contribution", value: selectedForm.landDevelopment?.farmerContribution },
        { label: "43. Total Estimate Amount", value: selectedForm.landDevelopment?.totalEstimate },
      ], "/plantationform/landDevelopment")}

      {renderSection("Bank Details", [
        { label: "44. Name of Account Holder", value: selectedForm.bankDetails?.accountHolderName },
        { label: "45. Account Number", value: selectedForm.bankDetails?.accountNumber},
        { label: "46. Name of the Bank", value: selectedForm.bankDetails?.bankName },
        { label: "47. Branch", value: selectedForm.bankDetails?.branch },
        { label: "48. IFSC", value: selectedForm.bankDetails?.ifscCode },
        { label: "49. Farmer has agreed for the work and his contribution", value: selectedForm.bankDetails?.farmerAgreed },
        {
          label: "50. Files submitted",
          value:
            selectedForm.bankDetails?.submittedFiles &&
            Object.values(selectedForm.bankDetails.submittedFiles).some(Boolean)
              ? Object.entries(selectedForm.bankDetails.submittedFiles)
                  .filter(([_, val]) => !!val)
                  .map(([key, val]) => ({
                    label: `${key}: ${val.name}`,
                    uri: val.uri,
                  }))
              : ["No files uploaded"],
        },
      ], "/prefd/bankDetails")}

{!isSubmittedPreview && (
  <>
    
    <Button
      mode="outlined"
      onPress={async () => {
        try {
          
          // setData("fundStatus",data.bankDetails?.fundStatus)
          await new Promise((res) => setTimeout(res, 50));
          useDraftStore.getState().saveDraft(data);
          Alert.alert("Saved", "Form saved as draft successfully!");
          router.push("/dashboard");
        } catch (err) {
          Alert.alert("Error", "Failed to save draft. Please try again.");
        }
      }}
      style={{ marginTop: 10 }}
      >
      Save as Draft
    </Button>
</> 
 ) 
} 
    <Button
      mode="contained"
      onPress={handleSubmit}
      style={[styles.submitButton, { marginTop: 10 }]}
>
      Submit
    </Button>


    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
  },
  farmerPhoto: {
    width: 170,
    height: 180,
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 2,
  },
  farmerPhotoContainer: {
    position: "absolute",
    top: 80,
    right: 30,
    width: 170,
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  
  noPhotoText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    marginLeft: 10,
  },
  divider: {
    marginVertical: 5,
  },
  submitButton: {
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
});