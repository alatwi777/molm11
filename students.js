// إدارة الطلاب
let students = JSON.parse(localStorage.getItem('students')) || [];

// عرض جدول الطلاب
function displayStudents() {
    const studentsTable = document.getElementById('studentsTable');
    if (!studentsTable) return;
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>الصف</th>
                    <th>رقم الهوية</th>
                    <th>رقم الجلوس</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (students.length === 0) {
        html += `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    <i class="fas fa-users-slash"></i> لا يوجد طلاب مسجلين
                </td>
            </tr>
        `;
    } else {
        students.forEach((student, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${student.name}</td>
                    <td>${student.class}</td>
                    <td>${student.id}</td>
                    <td>${student.seatNumber}</td>
                    <td>
                        <button onclick="editStudent(${index})" class="btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteStudent(${index})" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
            </tbody>
        </table>
        <div class="summary">
            <p><i class="fas fa-users"></i> إجمالي الطلاب: ${students.length}</p>
        </div>
    `;
    
    studentsTable.innerHTML = html;
}

// إضافة طالب جديد
function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const seatNumber = document.getElementById('seatNumber').value.trim();
    
    if (!name || !studentClass || !studentId || !seatNumber) {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    const newStudent = {
        name,
        class: studentClass,
        id: studentId,
        seatNumber,
        createdAt: new Date().toISOString()
    };
    
    students.push(newStudent);
    saveStudents();
    
    // مسح الحقول
    document.getElementById('studentName').value = '';
    document.getElementById('studentClass').value = '';
    document.getElementById('studentId').value = '';
    document.getElementById('seatNumber').value = '';
    
    alert('✅ تم إضافة الطالب بنجاح');
}

// حفظ الطلاب
async function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
    
    // محاولة الحفظ في السحابة
    if (typeof saveToCloud === 'function') {
        await saveToCloud('students', students);
    }
}

// حذف طالب
async function deleteStudent(index) {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        students.splice(index, 1);
        await saveStudents();
        displayStudents();
        alert('✅ تم حذف الطالب بنجاح');
    }
}

// تحرير طالب
function editStudent(index) {
    const student = students[index];
    
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentClass').value = student.class;
    document.getElementById('studentId').value = student.id;
    document.getElementById('seatNumber').value = student.seatNumber;
    
    // تغيير زر الإضافة إلى تحديث
    const addBtn = document.querySelector('#studentForm button');
    addBtn.innerHTML = '<i class="fas fa-sync"></i> تحديث الطالب';
    addBtn.onclick = function() { updateStudent(index); };
}

// تحديث طالب
async function updateStudent(index) {
    const name = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const seatNumber = document.getElementById('seatNumber').value.trim();
    
    if (!name || !studentClass || !studentId || !seatNumber) {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    students[index] = {
        ...students[index],
        name,
        class: studentClass,
        id: studentId,
        seatNumber,
        updatedAt: new Date().toISOString()
    };
    
    await saveStudents();
    
    // إعادة تعيين النموذج
    document.getElementById('studentName').value = '';
    document.getElementById('studentClass').value = '';
    document.getElementById('studentId').value = '';
    document.getElementById('seatNumber').value = '';
    
    const addBtn = document.querySelector('#studentForm button');
    addBtn.innerHTML = '<i class="fas fa-user-plus"></i> إضافة طالب';
    addBtn.onclick = addStudent;
    
    displayStudents();
    alert('✅ تم تحديث بيانات الطالب بنجاح');
}

// تصدير الطلاب إلى Excel
function exportStudentsToExcel() {
    if (students.length === 0) {
        alert('❌ لا يوجد طلاب لتصديرهم');
        return;
    }
    
    let csv = 'الاسم,الصف,رقم الهوية,رقم الجلوس\n';
    
    students.forEach(student => {
        csv += `${student.name},${student.class},${student.id},${student.seatNumber}\n`;
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'الطلاب_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
}

// تهيئة العرض عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    displayStudents();
    
    // إضافة حدث للزر
    const addBtn = document.querySelector('#studentForm button');
    if (addBtn) {
        addBtn.onclick = addStudent;
    }
    
    // زر التصدير
    const exportBtn = document.querySelector('#exportStudentsBtn');
    if (exportBtn) {
        exportBtn.onclick = exportStudentsToExcel;
    }
});
