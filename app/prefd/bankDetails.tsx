import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { Buffer } from "buffer";
import Constants from "expo-constants";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system"; // Import FileSystem
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { IconButton, RadioButton } from "react-native-paper";
import { useFormStore } from "../../storage/useFormStore";
import { useUserStore } from "../../storage/userDatastore";

const { width, height } = Dimensions.get('window');
const url = Constants.expoConfig?.extra.API_URL;

export default function BankDetails() {
  const router = useRouter();
  const { id, fromPreview,returnTo,fromsubmit,returnsubmit,fromland,fromplantation,frompond } = useLocalSearchParams<{ id?: string; fromPreview?: string }>();
  const { data, submittedForms, setData } = useFormStore();
  const {user} = useUserStore();

  const [form, setForm] = useState(
    data.bankDetails || {
      accountHolderName: "",//cd
      accountNumber: "",//cd
      bankName: "",//cd
      branch: "",
      ifscCode: "",//cd
      farmerAgreed: "",//cd
      formStatus:"",
      submittedFiles: {
        patta: null,
        idCard: null,//cd
        fmb: null,
        farmerPhoto: null,//cd
        bankPassbook: null,//cd
        geoTag: null,//cd
      },
    }
  );
     useEffect(() => {
      // console.log( +" in bankdetails");
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

  const uploadDocument = async (file:any, field:any) => {
    const ext:string = file.name?.split('.').pop() || (file.type === "image" ? "jpg" : "pdf");

    const mimeMap:{[key: string]: string} = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };

    const mimeType = mimeMap[ext] || "application/octet-stream";

    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const secureName = [...randomBytes].map((b) => b.toString(16).padStart(2, '0')).join('') + `.${ext}`;
    console.log(secureName);

    const uploadURL = await axios.get(`${url}/api/files/getUploadurl`,{params: {fileName: secureName,}});
    console.log("Upload URL (Frontend):",uploadURL.data);
    //const formData = new FormData();  
    // formData.append("file", {
    //   uri: file.uri,
    //   name: file.name,
    //   type: "application/pdf",
    // });
    //formData.append("file", file);
    // console.log("Mime Type:",mimeType);
    const fileData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const buffer = Buffer.from(fileData, 'base64');
    console.log("Buffer:", buffer.BYTES_PER_ELEMENT);
    try {
      const response = await axios.put(uploadURL.data, buffer, {
        headers: {
          'Content-Type': mimeType,
        }
      });
   }
   catch (error) {
      console.error("Upload error:", error);
   }
   setForm((prev) => ({
    ...prev,
    submittedFiles: {
      ...prev.submittedFiles,
      [field]: {
        ...(prev.submittedFiles?.[field] || {}),
        name: secureName,
        name2: file.name, 
      },
    },
  }));
  
  //return secureName;
};

  const handleUpload = async (field: string, fileType = "pdf") => {
    try {
      if (field === "farmerPhoto") {
        // Only this one opens the camera
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          alert("Camera permission is required to take a photo.");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.7,
        });

        if (!result.canceled && result.assets?.[0]) {
          const file = result.assets[0];
          const localUri = file.uri;
          const localFileName = `${FileSystem.documentDirectory}${file.fileName || `${field}.jpg`}`;

          console.log(file);
          uploadDocument(file,field);
          //console.log("Uploaded filename:", uploaded_filename);

          // Move the file to the local storage directory
          await FileSystem.copyAsync({
            from: localUri,
            to: localFileName,
          });

          setForm((prev) => ({
            ...prev,
            submittedFiles: {
              ...prev.submittedFiles,
              [field]: {
                ...(prev.submittedFiles?.[field] || {}),
                uri: localFileName,
              },
            },
          }));
        }
      } else {
        // All others use Document Picker
        const result = await DocumentPicker.getDocumentAsync({
          type: fileType === "image" ? "image/*" : "application/pdf",
        });

        if (!result.canceled && result.assets?.[0]) {
          const file = result.assets[0];
          const localUri = file.uri;
          const localFileName = `${FileSystem.documentDirectory}${file.name}`;

          //console.log(file);
          uploadDocument(file,field);


          // Move the file to the local storage directory
          await FileSystem.copyAsync({
            from: localUri,
            to: localFileName,
          });

          setForm((prev) => ({
            ...prev,
            submittedFiles: {
              ...prev.submittedFiles,
              [field]: {
                 //pass the generated file name
                uri: localFileName,
              },
            },
          }));
        }
      }
    } catch (err) {
      console.log(`Upload error for ${field}:`, err);
    }
  };

  const handlePreview = () => {
    setData("bankDetails", form);
     if (fromPreview == "true" && returnTo ){
      console.log(returnTo);
      router.push({ pathname: returnTo, params: { id ,returnsubmit:returnsubmit,fromsubmit:fromsubmit} });
    } 
    
    if(fromland== "true"){
      router.push({pathname:"/landform/Preview",params:{fromland:"true", frompond :"false",fromplantation:"false"}});
    }
    else if(frompond== "true"){
      router.push({pathname:"/pondform/Preview",params:{fromland:"false", frompond :"true",fromplantation:"false"}});
    }
    else if (fromplantation == "true"){
      router.push({pathname:"/plantationform/Preview",params:{fromland:"false", frompond :"false",fromplantation:"true"}});
    }
  };

  return (
      <KeyboardAwareScrollView style={styles.container}>
    <ScrollView contentContainerStyle={styles.inner}>
      <Animatable.View animation="fadeInUp" duration={600}>
     

<Text style={styles.heading_land}>
  {fromland === "true"
    ? "LAND REDEVELOPMENT FORM"
    : frompond === "true"
    ? "POND REDEVELOPMENT FORM<"
    : fromplantation === "true"
    ? "PLANTATION REDEVELOPMENT FORM<"
    : "Form"}
</Text>
    <View style={styles.header}>
      <IconButton
        icon="arrow-left"
       size={width * .06} 
        style={styles.backButton}
        onPress={() => router.back()}
      />
      <Text style={styles.heading}>Bank Details</Text>
</View>
      <Text style={styles.label}>44. Name of Account Holder</Text>
      <TextInput
      placeholder="Enter name"
      placeholderTextColor="#888"
        value={form.accountHolderName}
        onChangeText={(text) => updateField("accountHolderName", text)}
        style={styles.input}
      />

      <Text style={styles.label}>45. Account Number</Text>
      <TextInput
       value={String(form.accountNumber)}
        placeholder="Enter account number"
            placeholderTextColor="#888"
        // value={form.accountNumber}
        onChangeText={(text) => {updateField("accountNumber", text)
          
        }}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.label}>46. Name of the Bank</Text>
      <TextInput
        value={form.bankName}
        placeholder="Enter bank name"
        placeholderTextColor="#888"
        onChangeText={(text) => updateField("bankName", text)}
        style={styles.input}
      />

       <Text style={styles.label}>47. Branch</Text>
      <TextInput
        value={form.branch}
          placeholder="Enter branch name"
            placeholderTextColor="#888"
        onChangeText={(text) => updateField("branch", text)}
        style={styles.input}
      />

      <Text style={styles.label}>48. IFSC</Text>
      <TextInput
        value={form.ifscCode}
        placeholder="Enter IFSC code"
            placeholderTextColor="#888"
        onChangeText={(text) => {
        const filteredText = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 11);
          updateField("ifscCode", filteredText)}}
        style={styles.input}
        autoCapitalize="characters"
      />

<Text style={styles.label}>49. Farmer has agreed for the work, and his contribution</Text>
      <RadioButton.Group
        onValueChange={(value) => updateField("farmerAgreed", value)}
        value={form.farmerAgreed}
      >
        <RadioButton.Item label="Yes" value="Yes" />
        <RadioButton.Item label="No" value="No" />
      </RadioButton.Group>

    {!fromPreview && (
  <>
    <Text style={styles.label}>50. Upload Documents:</Text>
       <View style={styles.uploadGroup}>
    {[
      { label: "Patta", key: "patta", type: "pdf" },
      { label: "ID Card", key: "idCard", type: "pdf" },
      { label: "FMB", key: "fmb", type: "pdf" },
      { label: "Photo of Farmer", key: "farmerPhoto", type: "image" },
      { label: "Bank Passbook", key: "bankPassbook", type: "pdf" },
      { label: "Geo Tag", key: "geoTag", type: "image" },
    ].map((file) => (
<React.Fragment key={file.key}>
  <TouchableOpacity
    onPress={() => handleUpload(file.key, file.type)}
    style={styles.uploadBox}
  >
    <Ionicons
      name={file.label ? 'document-attach' : 'cloud-upload-outline'}
      size={width * 0.05}
      color="#0B8B42"
    />
    <Text style={styles.uploadLabel}>{file.label}</Text>

    {form.submittedFiles[file.key]?.name && (
      <Text style={styles.uploadStatus}>
        Uploaded: {form.submittedFiles[file.key].name2}
      </Text>
    )}
  </TouchableOpacity>
</React.Fragment>


    ))}
    </View>
  </>
)}
       <TouchableOpacity style={styles.nextBtn} onPress={() =>handlePreview() }>
                  <Text style={styles.nextBtnText}>{fromPreview ? "Preview" : "Next"}</Text>
                </TouchableOpacity>
      {/* <Button
        mode="contained"
        onPress={handlePreview}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {fromPreview ? "Preview" : "Next"}
      </Button> */}
      </Animatable.View>
    </ScrollView>
    
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   padding: 20,
  //   paddingBottom: 40,
  // },
  // backButton: {
  //   alignSelf: "flex-start",
  //   marginBottom: 10,
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
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   padding: 10,
  //   marginBottom: 10,
  //   borderRadius: 5,
  // },
  uploadButton: {
    marginTop: 8,
    marginBottom: 4,
  },
  uploadedFile: {
    fontStyle: "italic",
    marginBottom: 10,
    color: "green",
  },
  button: {
    marginTop: 30,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
   container: {
    flex: 1,
    backgroundColor: '#F1F7ED',
  },
  inner: {
    padding: width * 0.05,
    paddingBottom: height * 0.025,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  backButton: {
    marginRight: width * 0.025,
  },
  heading: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#0B8B42',
  },
  label: {
    fontSize: width * 0.035,
    marginVertical: height * 0.01,
    color: '#333',
    fontWeight: '600',
  },
  heading_land: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#0B8B42',
    marginBottom: height * 0.025,
    textAlign: 'center',
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
    marginBottom: height * 0.015,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: height * 0.015,
  },
  radioOption: {
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
  uploadGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  uploadBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: width * 0.025,
    padding: width * 0.03,
    marginBottom: height * 0.02,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
  },
  uploadLabel: {
    fontSize: width * 0.035,
    fontWeight: '600',
    marginTop: height * 0.01,
    color: '#333',
  },
uploadStatus: {
  fontSize: width * 0.03,
  color: '#777',
  marginTop: height * 0.005,
  textAlign: 'center',
  width: width * 0.4,     // Limit width to half screen
  alignSelf: 'center',
  flexWrap: 'wrap',
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