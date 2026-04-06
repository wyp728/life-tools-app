import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity, Alert, TextInput } from 'react-native';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://life-tools-api-v4.loca.lt'; // 使用环境变量或默认隧道地址

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const isFocused = useIsFocused();

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/notes`);
      if (res.data.success) {
        setNotes(res.data.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if(isFocused) fetchNotes();
  }, [isFocused]);

  const handleAdd = async () => {
    if (!title || !content) {
      if(Platform.OS === 'web') alert('请填写完整');
      else Alert.alert('提示', '请填写完整');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/notes`, { title, content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput style={[styles.input, styles.titleInput]} placeholder="备忘录标题..." value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="记点什么..." value={content} onChangeText={setContent} multiline />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addText}>保存备忘</Text>
        </TouchableOpacity>
      </View>
      <FlatList 
        data={notes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.date}>{new Date(item.updatedAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc', padding: 15 },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10, marginBottom: 10, fontSize: 16 },
  titleInput: { fontWeight: 'bold' },
  addBtn: { backgroundColor: '#f39c12', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#f39c12', elevation: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  content: { fontSize: 15, color: '#34495e', marginTop: 5 },
  date: { fontSize: 12, color: '#bdc3c7', marginTop: 10 }
});
