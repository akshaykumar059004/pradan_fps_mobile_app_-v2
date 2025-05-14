import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useDraftStore } from '../storage/DraftStore'; // ✅ import the draft store
import { useFormStore } from '../storage/useFormStore';

export default function DraftsScreen() {
  const router = useRouter();
  const { setData } = useFormStore();
  const { drafts, loadDrafts, clearDrafts } = useDraftStore(); // ✅ using Zustand values

  useEffect(() => {
    loadDrafts(); // ✅ load drafts from AsyncStorage into Zustand
  }, []);

  const openDraft = (item) => {
    setData("user_id",item.user_id);
    setData("basicDetails", item.basicDetails);
    setData("landOwnership", item.landOwnership);
    setData("landDevelopment", item.landDevelopment);
    setData("bankDetails", item.bankDetails);
    setData("id", item.id);
    setData("formType",item.formType)
    // setData("form_type", item.formType);
    // setData("formStatus", item.formStatus);
    // setData("fundStatus", item.fundStatus);

    const pathMap = {
      1: "/landform/Preview",
      2: "/pondform/Preview",
      3: "/plantationform/Preview",
    };
      console.log(item.formType + "  name  ");
    router.push({
      
      pathname: pathMap[item.formType],//
      params: { fromdraft: "true" },
    });
  };

  const uploadAllDrafts = async () => {
    try {
      await clearDrafts(); // ✅ use the Zustand method to clear drafts
      Alert.alert("Success", "All drafts uploaded to submitted forms");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to upload drafts");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Draft Forms</Text>

      <FlatList
        data={drafts}
        // keyExtractor={(item) => item.draft_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openDraft(item)}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: '#ccc',
              backgroundColor: '#f9f9f9',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {item.basicDetails?.name?.trim() || "Unnamed Draft"}
            </Text>
              <Text style={{ fontSize: 16 }}>
              {item.basicDetails?.draft_id?.trim() || " id"}
            </Text>
            {item.savedAt && (
              <Text style={{ color: 'gray', fontSize: 12 }}>
                Saved on: {new Date(item.savedAt).toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      {drafts.length > 0 && (
        <Button mode="contained" onPress={uploadAllDrafts} style={{ marginTop: 20 }}>
          Clear All Drafts
        </Button>
      )}
    </View>
  );
}
