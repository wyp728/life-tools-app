import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://3176af5c899d7c.lhr.life'; // 使用高可用免验证隧道

export default function LedgerScreen() {
  const [ledgers, setLedgers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [remark, setRemark] = useState('');

  const isFocused = useIsFocused();

  const fetchLedgers = async (dateStr) => {
    try {
      const res = await axios.get(`${API_BASE}/api/ledgers`, {
        params: { date: dateStr }
      });
      if (res.data.success) {
        setLedgers(res.data.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isFocused) fetchLedgers(selectedDate);
  }, [isFocused, selectedDate]);

  const handleAddLedger = async () => {
    if (!amount || !category) {
      Alert.alert('提示', '请填写金额和名称');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/ledgers`, {
        amount,
        category,
        remark,
        date: date.toISOString(),
      });
      setAmount('');
      setCategory('');
      setRemark('');
      setDate(new Date());
      setModalVisible(false);
      fetchLedgers(selectedDate);
    } catch (e) {
      console.log(e);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const handleDelete = async (id) => {
    const performDelete = async () => {
      try {
        await axios.delete(`${API_BASE}/api/ledgers/${id}`);
        fetchLedgers(selectedDate);
      } catch (e) {
        console.log(e);
      }
    };
    if (Platform.OS === 'web') {
      if(confirm('确定删除吗？')) performDelete();
    } else {
      Alert.alert('确认', '确定删除这条记录吗？', [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: performDelete, style: 'destructive' }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: '#2ecc71' }
        }}
        theme={{
          selectedDayBackgroundColor: '#2ecc71',
          todayTextColor: '#2ecc71',
          arrowColor: '#2ecc71',
        }}
        style={styles.calendar}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{selectedDate} 的记账</Text>
        <TouchableOpacity style={styles.addIconBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={32} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={ledgers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cat}>{item.category}</Text>
              {item.remark ? <Text style={styles.remark}>{item.remark}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>{item.amount.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#e74c3c" style={{marginTop: 5}} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>当天没有任何记录</Text>}
      />

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增一笔记账</Text>
            
            <Text style={styles.label}>名称</Text>
            <TextInput style={styles.input} placeholder="例: 午餐 / 购物" value={category} onChangeText={setCategory} />
            
            <Text style={styles.label}>金额</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            
            <Text style={styles.label}>日期</Text>
            <TouchableOpacity onPress={showDatePicker} style={styles.dateSelector}>
              <Text>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>备注 (可选)</Text>
            <TextInput style={styles.input} placeholder="添加备注..." value={remark} onChangeText={setRemark} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAddLedger}>
                <Text style={{color: '#fff'}}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={date}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf8f8' },
  calendar: { marginBottom: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 10 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, marginHorizontal: 15, borderRadius: 15, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5 },
  cat: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  remark: { fontSize: 13, color: '#999', marginTop: 3 },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#e74c3c' },
  empty: { textAlign: 'center', marginTop: 40, color: '#bdc3c7' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  dateSelector: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 15, justifyContent: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.45, padding: 15, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f5f5f5' },
  confirmBtn: { backgroundColor: '#2ecc71' }
});
