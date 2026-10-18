import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { items as defaultItems, initialStudents } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const InventoryContext = createContext(null);

const STORAGE_KEY_ITEMS = 'iilm_iot_items_v4';
const STORAGE_KEY_REQUESTS = 'iilm_iot_requests_v4';

function mapDbItem(row) {
  return {
    id: row.id,
    sno: row.sno,
    name: row.name,
    folio: row.folio,
    billNo: row.bill_no,
    date: row.date,
    vendor: row.vendor,
    category: row.category,
    type: row.type,
    totalStock: Number(row.total_stock),
    availableStock: Number(row.available_stock),
    unitPrice: Number(row.unit_price) || 0,
    totalAmount: Number(row.total_amount) || 0,
    gst: Number(row.gst) || 18,
  };
}

function mapDbRequest(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentUrn: row.student_urn,
    studentName: row.student_name,
    studentCourse: row.student_course,
    studentSemester: row.student_semester,
    studentSection: row.student_section,
    studentEmail: row.student_email,
    itemId: row.item_id,
    quantity: Number(row.quantity) || 1,
    purpose: row.purpose,
    status: row.status,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    returnDate: row.return_date,
    returnedAt: row.returned_at,
    teacherNote: row.teacher_note || '',
  };
}

export function InventoryProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return defaultItems;
  });

  const [requests, setRequests] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // Fetch items from Supabase if connected
  const fetchCloudItems = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase.from('items').select('*').order('sno', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map(mapDbItem);
        setItems(mapped);
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Could not fetch cloud items, keeping local copy:', e);
    }
  }, []);

  // Fetch requests from Supabase if connected
  const fetchCloudRequests = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase.from('requests').select('*').order('requested_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map(mapDbRequest);
        setRequests(mapped);
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Could not fetch cloud requests, keeping local copy:', e);
    }
  }, []);

  // Real-time Cloud Subscriptions
  useEffect(() => {
    fetchCloudItems();
    fetchCloudRequests();

    if (!isSupabaseConfigured || !supabase) return;

    let channel = null;
    try {
      channel = supabase
        .channel('public:inventory_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
          fetchCloudRequests();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
          fetchCloudItems();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchCloudItems, fetchCloudRequests]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {}
  }, [requests]);

  const addRequest = async (data) => {
    const newReq = {
      id: 'req-' + Date.now(),
      studentId: data.studentId,
      studentName: data.studentName || 'Student',
      studentUrn: data.studentUrn || data.studentId || '2581008',
      studentCourse: data.studentCourse || 'B.Tech CSE',
      studentSemester: Number(data.studentSemester) || 5,
      studentSection: data.studentSection || 'A',
      studentEmail: data.studentEmail || '',
      itemId: data.itemId,
      quantity: Number(data.quantity) || 1,
      purpose: data.purpose || 'Laboratory Assignment',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      approvedAt: null,
      returnDate: null,
      returnedAt: null,
      teacherNote: '',
    };

    // Update local state immediately for instant UI responsiveness
    setRequests(prev => [newReq, ...prev]);

    // Push to Supabase Cloud if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').insert([{
          id: newReq.id,
          student_id: newReq.studentId,
          student_urn: newReq.studentUrn,
          student_name: newReq.studentName,
          student_course: newReq.studentCourse,
          student_semester: newReq.studentSemester,
          student_section: newReq.studentSection,
          student_email: newReq.studentEmail,
          item_id: newReq.itemId,
          quantity: newReq.quantity,
          purpose: newReq.purpose,
          status: newReq.status,
          requested_at: newReq.requestedAt,
        }]);
      } catch (err) {
        console.error('Failed to push request to Supabase:', err);
      }
    }

    return newReq;
  };

  const approveRequest = async (requestId, returnDate, teacherNote = '') => {
    let reqToApprove = null;
    const finalReturnDate = returnDate || new Date(Date.now() + 7 * 86400000).toISOString();
    const approvedAt = new Date().toISOString();

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        reqToApprove = r;
        return {
          ...r,
          status: 'approved',
          approvedAt,
          returnDate: finalReturnDate,
          teacherNote: teacherNote || '',
        };
      }
      return r;
    }));

    if (reqToApprove) {
      const updatedAvailable = Math.max(0, (items.find(i => i.id === reqToApprove.itemId)?.availableStock || reqToApprove.quantity) - reqToApprove.quantity);
      setItems(prev => prev.map(item => item.id === reqToApprove.itemId ? { ...item, availableStock: Math.max(0, item.availableStock - reqToApprove.quantity) } : item));

      // Push to Supabase Cloud
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('requests').update({
            status: 'approved',
            approved_at: approvedAt,
            return_date: finalReturnDate,
            teacher_note: teacherNote || '',
          }).eq('id', requestId);

          await supabase.from('items').update({
            available_stock: updatedAvailable,
          }).eq('id', reqToApprove.itemId);
        } catch (e) {
          console.error('Supabase approve error:', e);
        }
      }
    }
  };

  const rejectRequest = async (requestId, teacherNote = '') => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          teacherNote: teacherNote || 'Request rejected by lab teacher.',
        };
      }
      return r;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').update({
          status: 'rejected',
          teacher_note: teacherNote || 'Request rejected by lab teacher.',
        }).eq('id', requestId);
      } catch (e) {
        console.error('Supabase reject error:', e);
      }
    }
  };

  const markReturned = async (requestId) => {
    let reqToReturn = null;
    const returnedAt = new Date().toISOString();

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        reqToReturn = r;
        return { ...r, returnedAt };
      }
      return r;
    }));

    if (reqToReturn) {
      const currentItem = items.find(i => i.id === reqToReturn.itemId);
      const restored = currentItem ? Math.min(currentItem.totalStock, currentItem.availableStock + reqToReturn.quantity) : 1;
      setItems(prev => prev.map(item => item.id === reqToReturn.itemId ? { ...item, availableStock: Math.min(item.totalStock, item.availableStock + reqToReturn.quantity) } : item));

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('requests').update({ returned_at: returnedAt }).eq('id', requestId);
          await supabase.from('items').update({ available_stock: restored }).eq('id', reqToReturn.itemId);
        } catch (e) {
          console.error('Supabase return error:', e);
        }
      }
    }
  };

  const updateItem = async (itemId, updates) => {
    setItems(prev => prev.map(i => (i.id === itemId ? { ...i, ...updates } : i)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').update({
          name: updates.name,
          category: updates.category,
          total_stock: updates.totalStock,
          available_stock: updates.availableStock,
          vendor: updates.vendor,
          folio: updates.folio,
          bill_no: updates.billNo,
          date: updates.date,
        }).eq('id', itemId);
      } catch (e) {
        console.error('Supabase updateItem error:', e);
      }
    }
  };

  const addItem = async (item) => {
    const newItem = { id: 'item-' + Date.now(), ...item };
    setItems(prev => [...prev, newItem]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').insert([{
          id: newItem.id,
          sno: newItem.sno || 999,
          name: newItem.name,
          category: newItem.category,
          type: newItem.type || 'non-consumable',
          total_stock: newItem.totalStock,
          available_stock: newItem.availableStock,
          vendor: newItem.vendor || '',
          folio: newItem.folio || 0,
          bill_no: newItem.billNo || 0,
          date: newItem.date || '',
        }]);
      } catch (e) {
        console.error('Supabase addItem error:', e);
      }
    }
    return newItem;
  };

  const deleteItem = async (itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').delete().eq('id', itemId);
      } catch (e) {
        console.error('Supabase deleteItem error:', e);
      }
    }
  };

  const getStudentRequests = (studentId) => {
    return requests.filter(r => r.studentId === studentId || r.studentUrn === studentId);
  };

  const getItemById = (itemId) => items.find(i => i.id === itemId);

  const getStudentById = (studentId) => {
    try {
      const stored = JSON.parse(
        localStorage.getItem('iilm_iot_students_v3') ||
        localStorage.getItem('iilm_iot_students_v2') ||
        '[]'
      );
      const found = stored.find(s => s.id === studentId || s.urn === studentId || s.rollNo === studentId);
      if (found) return { ...found, rollNo: found.urn || found.rollNo };
    } catch (e) {}

    const pre = initialStudents.find(s => s.id === studentId || s.urn === studentId);
    if (pre) return { ...pre, rollNo: pre.urn };

    const req = requests.find(r => r.studentId === studentId || r.studentUrn === studentId);
    if (req && req.studentName) {
      return {
        id: studentId,
        urn: req.studentUrn,
        rollNo: req.studentUrn,
        name: req.studentName,
        course: req.studentCourse,
        semester: req.studentSemester,
        section: req.studentSection,
        email: req.studentEmail,
      };
    }

    return {
      id: studentId,
      name: 'Registered Student',
      urn: studentId,
      rollNo: studentId,
      course: 'B.Tech',
      semester: 1,
      section: 'A',
      email: `${studentId}@iilm.edu`,
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        requests,
        addRequest,
        approveRequest,
        rejectRequest,
        markReturned,
        updateItem,
        addItem,
        deleteItem,
        getStudentRequests,
        getItemById,
        getStudentById,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
