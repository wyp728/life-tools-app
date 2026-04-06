import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, Modal, TextInput, Alert } from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://life-tools-api-v4.loca.lt'; // 使用环境变量或默认隧道地址

export default function WordsScreen() {
  const [words, setWords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEn, setNewEn] = useState('');
  const [newCn, setNewCn] = useState('');
  const isFocused = useIsFocused();

  const fetchWords = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/words`);
      if (res.data.success) {
        setWords(res.data.data);
      }
    } catch (e) {
      console.log('Error fetching words:', e.message);
    }
  };

  useEffect(() => {
    if (isFocused) fetchWords();
  }, [isFocused]);

  const playTTS = (text) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, { language: 'en-US', pitch: 1.0, rate: 0.9 });
  };

  const handleAddWord = async () => {
    if (!newEn || !newCn) {
      Alert.alert('提示', '请完整输入中英文');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/words`, { english: newEn, chinese: newCn, audioUrl: '' });
      setNewEn('');
      setNewCn('');
      setModalVisible(false);
      fetchWords();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = (id) => {
    const performDelete = async () => {
      try {
        await axios.delete(`${API_BASE}/api/words/${id}`);
        fetchWords();
      } catch (e) {
        console.log(e);
      }
    };
    if (Platform.OS === 'web') {
      if(confirm('确定删除吗？')) performDelete();
    } else {
      Alert.alert('确认', '确定要删除这个单词吗？', [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: performDelete, style: 'destructive' }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addText}>新增点读单词</Text>
      </TouchableOpacity>

      <FlatList 
        data={words}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.en}>{item.english}</Text>
              <Text style={styles.cn}>{item.chinese}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.playBtn} onPress={() => playTTS(item.english)}>
                <Text style={styles.playText}>🗣 朗读</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>暂无数据，点击上方新增</Text>}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增点读词汇</Text>
            <TextInput style={styles.input} placeholder="英文单词" value={newEn} onChangeText={setNewEn} />
            <TextInput style={styles.input} placeholder="中文含义" value={newCn} onChangeText={setNewCn} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAddWord}>
                <Text style={{color:'#fff'}}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 15 },
  addBtn: { flexDirection: 'row', backgroundColor: '#9b59b6', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, elevation: 2 },
  addText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  en: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  cn: { color: '#7f8c8d', marginTop: 4, fontSize: 15 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  playBtn: { backgroundColor: '#f3e5f5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 15 },
  playText: { color: '#9b59b6', fontWeight: 'bold' },
  delBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#bdc3c7' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.45, padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f2f6' },
  confirmBtn: { backgroundColor: '#9b59b6' }
});
