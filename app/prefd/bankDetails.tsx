import axios from "axios";
import { Buffer } from "buffer";
import Constants from "expo-constants";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system"; // Import FileSystem
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { Button, IconButton, RadioButton } from "react-native-paper";
import { useFormStore } from "../../storage/useFormStore";
import { useUserStore } from "../../storage/userDatastore";



const url = Constants.expoConfig?.extra.API_URL;

export default function BankDetails() {
  const router = useRouter();
  const { id, fromPreview,fromsubmit,returnsubmit,fromland,fromplantation,frompond } = useLocalSearchParams<{ id?: string; fromPreview?: string }>();
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

    const uploadURL = await axios.get(`${url}/api/files/getUploadurl`,{params: {
      fileName: secureName,
    }});
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
          // uploadDocument(file,field);
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
    
    if(fromland== "true"){
      router.push({pathname:"/landform/Preview",params:{fromland:"true", frompond :"false",fromplantation:"false"}});
    }
    else if(frompond== "true"){
      router.push({pathname:"/pondform/Preview",params:{fromland:"false", frompond :"true",fromplantation:"false"}});
    }
    else{
      router.push({pathname:"/plantationform/Preview",params:{fromland:"false", frompond :"false",fromplantation:"true"}});
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconButton
        icon="arrow-left"
        size={24}
        style={styles.backButton}
        onPress={() => router.back()}
      />

<Text style={styles.title}>
  {fromland === "true"
    ? "Land Form"
    : frompond === "true"
    ? "Pond Form"
    : fromplantation === "true"
    ? "Plantation Form"
    : "Form"}
</Text>
      <Text style={styles.subtitle}>Bank Details</Text>

      <Text style={styles.question}>44. Name of Account Holder:</Text>
      <TextInput
        value={form.accountHolderName}
        onChangeText={(text) => updateField("accountHolderName", text)}
        style={styles.input}
      />

      <Text style={styles.question}>45. Account Number:</Text>
      <TextInput
        value={form.accountNumber}
        onChangeText={(text) => updateField("accountNumber", text)}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.question}>46. Name of the Bank:</Text>
      <TextInput
        value={form.bankName}
        onChangeText={(text) => updateField("bankName", text)}
        style={styles.input}
      />

      <Text style={styles.question}>47. Branch:</Text>
      <TextInput
        value={form.branch}
        onChangeText={(text) => updateField("branch", text)}
        style={styles.input}
      />

      <Text style={styles.question}>48. IFSC:</Text>
      <TextInput
        value={form.ifscCode}
        onChangeText={(text) => updateField("ifscCode", text)}
        style={styles.input}
        autoCapitalize="characters"
      />

      <Text style={styles.question}>49. Farmer has agreed for the work and his contribution:</Text>
      <RadioButton.Group
        onValueChange={(value) => updateField("farmerAgreed", value)}
        value={form.farmerAgreed}
      >
        <RadioButton.Item label="Yes" value="Yes" />
        <RadioButton.Item label="No" value="No" />
      </RadioButton.Group>

      <Text style={styles.question}>50. Upload Documents:</Text>
      {[
        { label: "Patta", key: "patta", type: "pdf" },
        { label: "ID Card", key: "idCard", type: "pdf" },
        { label: "FMB", key: "fmb", type: "pdf" },
        { label: "Photo of Farmer", key: "farmerPhoto", type: "image" },
        { label: "Bank Passbook", key: "bankPassbook", type: "pdf" },
        { label: "Geo Tag", key: "geoTag", type: "image" },
      ].map((file) => (
        <React.Fragment key={file.key}>
          <Button
            mode="outlined"
            onPress={() => handleUpload(file.key, file.type)}
            style={styles.uploadButton}
          >
            Upload {file.label}
          </Button>
          {form.submittedFiles[file.key]?.name && (
            <Text style={styles.uploadedFile}>
              Uploaded: {form.submittedFiles[file.key].name}
            </Text>
          )}
        </React.Fragment>
      ))}
      
      <Button
        mode="contained"
        onPress={handlePreview}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {fromPreview ? "Preview" : "Next"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
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
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
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
  }
});