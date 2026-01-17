// تهيئة Firebase
let db;
let isOnline = false;

async function initFirebase() {
    try {
        // تهيئة Firebase
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        
        // اختبار الاتصال
        await db.collection('test').doc('connection').set({
            test: true,
            timestamp: new Date()
        });
        
        isOnline = true;
        updateSyncStatus(true, '✓ متصل بالسحابة');
        
        // تحميل البيانات من السحابة
        await loadFromCloud();
        
        // الاستماع للتغييرات في السحابة
        setupRealtimeUpdates();
        
    } catch (error) {
        console.log('❌ لا يوجد اتصال بالسحابة، باستخدام التخزين المحلي');
        isOnline = false;
        updateSyncStatus(false, '✗ غير متصل بالسحابة - الوضع المحلي');
    }
}

// تحديث حالة المزامنة
function updateSyncStatus(online, message) {
    const statusDiv = document.getElementById('syncStatus');
    if (statusDiv) {
        statusDiv.innerHTML = `<i class="fas fa-${online ? 'cloud' : 'wifi'}"></i> ${message}`;
        statusDiv.className = `sync-status ${online ? 'online' : 'offline'}`;
    }
    isOnline = online;
}

// حفظ البيانات في السحابة
async function saveToCloud(dataType, data) {
    if (!isOnline) return false;
    
    try {
        await db.collection('schoolData').doc(dataType).set({
            data: data,
            lastUpdated: new Date(),
            updatedBy: 'teacher'
        });
        console.log(`✅ تم حفظ ${dataType} في السحابة`);
        return true;
    } catch (error) {
        console.error(`❌ خطأ في حفظ ${dataType}:`, error);
        return false;
    }
}

// تحميل البيانات من السحابة
async function loadFromCloud() {
    if (!isOnline) return;
    
    try {
        // تحميل الطلاب
        const studentsDoc = await db.collection('schoolData').doc('students').get();
        if (studentsDoc.exists) {
            const students = studentsDoc.data().data || [];
            if (students.length > 0) {
                localStorage.setItem('students', JSON.stringify(students));
                console.log('✅ تم تحميل الطلاب من السحابة');
            }
        }
        
        // تحميل الاختبارات
        const testsDoc = await db.collection('schoolData').doc('tests').get();
        if (testsDoc.exists) {
            const tests = testsDoc.data().data || [];
            if (tests.length > 0) {
                localStorage.setItem('tests', JSON.stringify(tests));
                console.log('✅ تم تحميل الاختبارات من السحابة');
            }
        }
        
        // تحميل النتائج
        const resultsDoc = await db.collection('schoolData').doc('results').get();
        if (resultsDoc.exists) {
            const results = resultsDoc.data().data || [];
            if (results.length > 0) {
                localStorage.setItem('results', JSON.stringify(results));
                console.log('✅ تم تحميل النتائج من السحابة');
            }
        }
        
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
    }
}

// تحديث البيانات في الوقت الحقيقي
function setupRealtimeUpdates() {
    // الاستماع للتحديثات على الطلاب
    db.collection('schoolData').doc('students')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const students = doc.data().data || [];
                if (students.length > 0) {
                    localStorage.setItem('students', JSON.stringify(students));
                    console.log('🔄 تم تحديث قائمة الطلاب تلقائياً');
                    // إذا كان هناك دالة لتحديث العرض، استدعها هنا
                    if (typeof updateStudentsTable === 'function') {
                        updateStudentsTable();
                    }
                }
            }
        });
    
    // الاستماع للتحديثات على الاختبارات
    db.collection('schoolData').doc('tests')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const tests = doc.data().data || [];
                if (tests.length > 0) {
                    localStorage.setItem('tests', JSON.stringify(tests));
                    console.log('🔄 تم تحديث الاختبارات تلقائياً');
                }
            }
        });
}

// دالة المزامنة اليدوية
async function manualSync() {
    const statusDiv = document.getElementById('syncStatus');
    statusDiv.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> جاري المزامنة...';
    
    try {
        // حفظ البيانات المحلية في السحابة
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const tests = JSON.parse(localStorage.getItem('tests') || '[]');
        const results = JSON.parse(localStorage.getItem('results') || '[]');
        
        if (isOnline) {
            await saveToCloud('students', students);
            await saveToCloud('tests', tests);
            await saveToCloud('results', results);
            
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> ✓ تمت المزامنة بنجاح';
            statusDiv.className = 'sync-status online';
        } else {
            statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ✗ لا يوجد اتصال بالإنترنت';
            statusDiv.className = 'sync-status offline';
        }
    } catch (error) {
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> ✗ فشلت المزامنة';
        console.error('❌ خطأ في المزامنة:', error);
    }
}

// بدء التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initFirebase);
