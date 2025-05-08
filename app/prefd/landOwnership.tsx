import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { Button, Checkbox, IconButton, RadioButton } from "react-native-paper";
import { useFormStore } from "../../storage/useFormStore";

export default function LandOwnership() {
  const router = useRouter();
 const { id, fromPreview,returnTo,fromsubmit,returnsubmit,fromland,fromplantation,frompond } = useLocalSearchParams<{ id?: string; fromPreview?: string }>();
   const { data, submittedForms, setData } = useFormStore();
 
  const [form, setForm] = useState(
    data.landOwnership || {
      landOwnershipType: "Owner Cultivator",
      hasWell: "Yes",
      areaIrrigated: "12",
      irrigatedLand: {
        rainfed: "14",
        tankfed: "10",
        wellIrrigated: "12",
      },
      pattaNumber: "12/12",
      totalArea: "36",
      taluk:"hehehe",
      firka:"hehehe",
      revenueVillage: "hehehe",
      cropSeason: "Rabi",
      cropSeasonOther: "",
      livestock: {
        goat:"11",
        sheep:"1",
        milchAnimals:"1",
        draught_animals:"1",
        poultry:"10",
        others:"0",
      },
      irrigatedLandCombined:"",
      cropSeasonCombined: "",
      livestockCombined:"",
    }
  );
      useEffect(() => {
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
  
  const updateNestedField = (parent: string, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const toggleCheckbox = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value],
    }));
  };
  
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
    console.log(form.livestockCombined+" - "+form.irrigatedLandCombined+" - "+form.cropSeasonCombined);
    setData("landOwnership", form);
    if (fromPreview && returnTo) {
     
      router.push({ pathname: returnTo, params: { id,returnsubmit:returnsubmit,fromsubmit:fromsubmit} });
    } else {
      if(fromland == "true"){
        router.push({pathname:"/landform/landDevelopment",params:{fromland:"true", frompond :"false",fromplantation:"false"}});
      }
      else if(frompond== "true"){
        router.push({pathname:"/pondform/landDevelopment",params:{fromland:"false", frompond :"true",fromplantation:"false"}});
      }
      else{
        router.push({pathname:"/plantationform/landDevelopment",params:{fromland:"false", frompond :"false",fromplantation:"true"}});
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />

      <Text style={styles.title}>
  {fromland === "true"
    ? "Land Form"
    : frompond === "true"
    ? "Pond Form"
    : fromplantation === "true"
    ? "Plantation Form"
    : "Form"}
</Text>
      <Text style={styles.subtitle}>Land Ownership & Livestock</Text>

      <Text style={styles.question}>23. Land Ownership:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("landOwnershipType", value)}
  value={form.landOwnershipType}
>
  <RadioButton.Item label="Owner Cultivator" value="Owner Cultivator" />
  <RadioButton.Item label="Lease Holder" value="Lease Holder" />
</RadioButton.Group>


<Text style={styles.question}>24. Well for Irrigation:</Text>
<RadioButton.Group
  onValueChange={(value) => updateField("hasWell", value)}
  value={form.hasWell}
>
  <RadioButton.Item label="Yes" value="Yes" />
  <RadioButton.Item label="No" value="No" />
</RadioButton.Group>


      {form.hasWell === "Yes" && (
        <>
          <Text style={styles.question}>Area Irrigated (ha):</Text>
          <TextInput
            value={form.areaIrrigated}
            onChangeText={(text) => updateField("areaIrrigated", text)}
            style={styles.input}
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.question}>25. Irrigated Lands (ha):</Text>
      <Text>Rainfed:</Text>
      <TextInput
        value={form.irrigatedLand.rainfed}
        onChangeText={(text) =>{ 
          updateNestedField("irrigatedLand", "rainfed", text)
          const rainfed = form.irrigatedLand.rainfed || "0";
          const irrigatedLandcombined = `${rainfed},${form.irrigatedLand.tankfed},${form.irrigatedLand.wellIrrigated}`;
          
          updateField("irrigatedLandCombined", irrigatedLandcombined);
        }}
        style={styles.input}
        keyboardType="numeric"
      />
      <Text>Tankfed:</Text>
      <TextInput
        value={form.irrigatedLand.tankfed}
        onChangeText={(text) =>
          {updateNestedField("irrigatedLand", "tankfed", text)
            const tank = form.irrigatedLand.tankfed || "0";
            const irrigatedLandcombined = `${form.irrigatedLand.rainfed},${tank},${form.irrigatedLand.wellIrrigated}`;
            
            updateField("irrigatedLandCombined", irrigatedLandcombined);

          }}
        style={styles.input}
        keyboardType="numeric"
      />
      <Text>Well Irrigated:</Text>
      <TextInput
        value={form.irrigatedLand.wellIrrigated}
        onChangeText={(text) => {updateNestedField("irrigatedLand", "wellIrrigated", text)

          const well = form.irrigatedLand.wellIrrigated || "0";
          const irrigatedLandcombined = `${form.irrigatedLand.rainfed},${form.irrigatedLand.tankfed},${well}`;
          
          updateField("irrigatedLandCombined", irrigatedLandcombined);
        }}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.question}>26. Patta Number:</Text>
      <TextInput
        value={form.pattaNumber}
        onChangeText={(text) => updateField("pattaNumber", text)}
        style={styles.input}
      />

      <Text style={styles.question}>27. Total Area (ha):</Text>
      <TextInput
        value={form.totalArea}
        onChangeText={(text) => updateField("totalArea", text)}
        style={styles.input}
        keyboardType="numeric"
      />
      <Text style={styles.question}>27-28. Taluk:</Text>
      <TextInput
        value={form.taluk}
        onChangeText={(text) => updateField("taluk", text)}
        style={styles.input}
      />
<Text style={styles.question}>27-28. Firka:</Text>
      <TextInput
        value={form.firka}
        onChangeText={(text) => updateField("firka", text)}
        style={styles.input}
      />

      <Text style={styles.question}>28. Revenue Village:</Text>
      <TextInput
        value={form.revenueVillage}
        onChangeText={(text) => updateField("revenueVillage", text)}
        style={styles.input}
      />

<Text style={styles.question}>29. Crop Season (Choose all that apply):</Text>
{["Kharif", "Rabi", "Other"].map((season) => (
  <Checkbox.Item
    key={season}
    label={season}
    status={form.cropSeason?.includes(season) ? "checked" : "unchecked"}
    onPress={() => {
      const newSelection = form.cropSeason?.includes(season)
        ? form.cropSeason.filter((s: string) => s !== season)
        : [...(form.cropSeason || []), season];
      updateField("cropSeason", newSelection);
      updateField("cropSeasonCombined", newSelection.join(", "));
    }}
  />
))}

{form.cropSeason?.includes("Other") && (
  <TextInput
    placeholder="Enter Crop Season"
    value={form.cropSeasonOther}
    onChangeText={(text) => {
      updateField("cropSeasonOther", text);
      const updated = [...form.cropSeason.filter((s: string) => s !== "Other"), text];
      updateField("cropSeasonCombined", updated.join(", "));
    }}
    style={styles.input}
  />
)}


 <Text style={styles.question}>30. Livestock at Home:</Text>

<TextInput
  placeholder="Goat"
  value={form.livestock.goat}
  onChangeText={(text) => {updateNestedField("livestock","goat",text)
    
    const goat = form.livestock.goat ||"0";
    const livestockCombinedField = `${goat},${form.livestock.sheep},${form.livestock.milchAnimals},${form.livestock.draught_animals},${form.livestock.poultry},${form.livestock.others}`;
    updateField("livestockCombined",livestockCombinedField);

  }}
  keyboardType="numeric" 
  style={styles.input}
/>

<TextInput
  placeholder="Sheep"
  value={form.livestock.sheep}
  onChangeText={(text) => {updateNestedField("livestock","sheep",text)
    const sheep = form.livestock.sheep ||"0";
    const livestockCombinedField = `${form.livestock.goat},${sheep},${form.livestock.milchAnimals},${form.livestock.draught_animals},${form.livestock.poultry},${form.livestock.others}`;
    updateField("livestockCombined",livestockCombinedField);

  }}
  keyboardType="numeric"
  style={styles.input}
/>

<TextInput
  placeholder="Milch animals"
  value={form.livestock.milchAnimals}
  onChangeText={(text) => {updateNestedField("livestock","milchAnimals",text)
    const milchAnimals = form.livestock.milchAnimals ||"0";
    const livestockCombinedField = `${form.livestock.goat},${form.livestock.sheep},${milchAnimals},${form.livestock.draught_animals},${form.livestock.poultry},${form.livestock.others}`;
    updateField("livestockCombined",livestockCombinedField);

  }}
  keyboardType="numeric"
  style={styles.input}
/>

<TextInput
  placeholder="Draught Animals"
  value={form.livestock.draught_animals}
  onChangeText={(text) => {updateNestedField("livestock","draught_animals",text)
    const draught_animals= form.livestock.draught_animals ||"0";
    const livestockCombinedField = `${form.livestock.goat},${form.livestock.sheep},${form.livestock.milchAnimals},${draught_animals},${form.livestock.poultry},${form.livestock.others}`;
    updateField("livestockCombined",livestockCombinedField);
  }}
  keyboardType="numeric"
  style={styles.input}
/>

<TextInput
  placeholder="Poultry"
  value={form.livestock.poultry}
  onChangeText={(text) => {updateNestedField("livestock","poultry",text)
    const poultry= form.livestock.poultry ||"0";
    const livestockCombinedField = `${form.livestock.goat},${form.livestock.sheep},${form.livestock.milchAnimals},${form.livestock.draught_animals},${poultry},${form.livestock.others}`;
    updateField("livestockCombined",livestockCombinedField);
  }}
  keyboardType="numeric"
  style={styles.input}
/>

<TextInput
  placeholder="Others"
  value={form.livestock.others}
  onChangeText={(text) => {updateNestedField("livestock","others",text)
    const others= form.livestock.others ||"0";
    const livestockCombinedField = `${form.livestock.goat},${form.livestock.sheep},${form.livestock.milchAnimals},${form.livestock.draught_animals},${form.livestock.poultry},${others}`;
    updateField("livestockCombined",livestockCombinedField);
  }}
  keyboardType="numeric"
  style={styles.input}
/>
     <Button mode="contained" onPress={handleNext} style={styles.button}>
     {fromPreview ? "Preview" : "Next"}
     </Button>
    </ScrollView>
  ); 
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  question: { fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: { marginTop: 20 },
});
