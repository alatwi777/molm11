const API = "https://script.google.com/macros/s/AKfycbw6GJLmABLnLN3UNU9uIe_BJAI1xUXsdY08d6-wDhhbzvR0uYV_G53BJSTsy6r5boE4/exec";

let questions = [];
let questionCounter = 1;

// إضافة سؤال
function addQuestion() {
    const type = document.getElementById("questionType").value;
    const title = document.getElementById("questionTitle").value.trim();
    const options = document.getElementById("questionOptions").value.trim();
    const correctAnswer = document.getElementById("correctAnswer").value.trim();
    const score = document.getElementById("questionScore").value.trim();

    if (!title || !score) {
        alert("الرجاء إدخال نص السؤال والدرجة");
        return;
    }

    if (type === "mcq" && (!options || !correctAnswer)) {
        alert("للأسئلة الاختيارية يجب إدخال الخيارات والإجابة الصحيحة");
        return;
    }

    const question = {
        questionId: questionCounter,
        type,
        title,
        options,
        correctAnswer,
        score
    };

    questions.push(question);
    questionCounter++;

    displayQuestions();
    updateSummary();

    document.getElementById("questionTitle").value = "";
    document.getElementById("questionOptions").value = "";
    document.getElementById("correctAnswer").value = "";
    document.getElementById("questionScore").value = "";
}

// عرض الأسئلة
function displayQuestions() {
    const list = document.getElementById("questionsList");
    list.innerHTML = "";

    questions.forEach(q => {
        list.innerHTML += `
            <div class="question-box">
                <strong>سؤال ${q.questionId} (${q.type}):</strong> ${q.title}<br>
                ${q.options ? `<strong>الخيارات:</strong> ${q.options}<br>` : ""}
                ${q.correctAnswer ? `<strong>الإجابة الصحيحة:</strong> ${q.correctAnswer}<br>` : ""}
                <strong>الدرجة:</strong> ${q.score}
            </div>
        `;
    });
}

// ملخص الأسئلة
function updateSummary() {
    const summaryBox = document.getElementById("summaryBox");
    const totalQuestions = questions.length;
    const totalScore = questions.reduce((sum, q) => sum + Number(q.score || 0), 0);
    const mcqCount = questions.filter(q => q.type === "mcq").length;
    const essayCount = questions.filter(q => q.type === "essay").length;
    const handwriteCount = questions.filter(q => q.type === "handwrite").length;

    summaryBox.innerHTML = `
        عدد الأسئلة: ${totalQuestions}<br>
        مجموع الدرجات: ${totalScore}<br>
        أسئلة اختيار من متعدد: ${mcqCount}<br>
        أسئلة مقالية: ${essayCount}<br>
        أسئلة بالقلم: ${handwriteCount}
    `;
}

// نشر الاختبار
async function publishExam() {
    const examName = document.getElementById("examName").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const year = document.getElementById("year").value.trim();
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!examName || !subject || !year || !startTime || !endTime) {
        alert("الرجاء تعبئة جميع بيانات الاختبار");
        return;
    }

    if (questions.length === 0) {
        alert("الرجاء إضافة سؤال واحد على الأقل");
        return;
    }

    // إرسال بيانات الاختبار
    const examResponse = await fetch(API, {
        method: "POST",
        body: JSON.stringify({
            action: "addExam",
            examName,
            subject,
            year,
            startTime,
            endTime
        })
    });

    const examResult = await examResponse.json();
    const examId = examResult.examId;

    // إرسال الأسئلة
    for (let q of questions) {
        await fetch(API, {
            method: "POST",
            body: JSON.stringify({
                action: "addQuestion",
                examId,
                questionId: q.questionId,
                type: q.type,
                title: q.title,
                options: q.options,
                correctAnswer: q.correctAnswer,
                score: q.score
            })
        });
    }

    alert("تم نشر الاختبار بنجاح!");
    questions = [];
    questionCounter = 1;
    displayQuestions();
    updateSummary();
}
