export type ReportKind = 'subject' | 'class' | 'incharge'
export type FieldSource = 'sessions' | 'months' | 'teachers' | 'classes' | 'subjects'

export type ReportField = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'date' | 'rating' | 'repeat'
  options?: string[]
  source?: FieldSource
  required?: boolean
  min?: number
  max?: number
  step?: number
  help?: string
  maxRows?: number
  fields?: ReportField[]
  condition?: { key: string; value?: string; includes?: string }
}

export type ReportSection = {
  title: string
  description?: string
  oncePerSession?: boolean
  fields: ReportField[]
}

export type ReportDefinition = {
  title: string
  subtitle: string
  grain: string
  sections: ReportSection[]
}

const gender = ['छात्र', 'छात्रा', 'अन्य']
const previousStatus = ['पूर्ण समाधान भयो', 'आंशिक सुधार', 'उस्तै छ', 'झन् बिग्रियो', 'गत महिना समस्या थिएन']
const problemOptions = ['विद्यार्थी अनुपस्थिति', 'पाठ्यपुस्तक अभाव', 'कमजोर आधारभूत सिप', 'ठूलो कक्षा आकार', 'शैक्षिक सामग्री अभाव', 'घण्टी/समय अपुग', 'भाषागत कठिनाइ', 'अनुशासन', 'गृहकार्य नगर्ने', 'अभिभावक सहयोग अभाव', 'भौतिक पूर्वाधार', 'कुनै समस्या छैन', 'अन्य']

const identification = (teacherLabel: string, includeSubject = false): ReportSection => ({
  title: 'क) परिचय',
  fields: [
    { key: 'session_year', label: 'शैक्षिक सत्र', type: 'select', source: 'sessions', required: true },
    { key: 'month_code', label: 'महिना', type: 'select', source: 'months', required: true },
    { key: 'teacher_code', label: 'शिक्षक ID', type: 'text', required: true, help: 'विद्यालयले उपलब्ध गराएको गोप्य शिक्षक ID लेख्नुहोस्।' },
    { key: 'teacher_id', label: teacherLabel, type: 'select', source: 'teachers', required: true },
    { key: 'class_id', label: 'कक्षा', type: 'select', source: 'classes', required: true, condition: includeSubject ? undefined : undefined },
    ...(includeSubject ? [{ key: 'subject_id', label: 'विषय', type: 'select' as const, source: 'subjects' as const, required: true }] : []),
  ],
})

const subjectSections: ReportSection[] = [
  identification('शिक्षकको नाम', true),
  {
    title: 'ख) पाठ्यक्रम प्रगति',
    fields: [
      { key: 'student_boys', label: 'यस कक्षामा जम्मा छात्र', type: 'number', min: 0, required: true },
      { key: 'student_girls', label: 'यस कक्षामा जम्मा छात्रा', type: 'number', min: 0, required: true },
      { key: 'course_completed', label: 'यो महिनासम्म सकिएको कोर्ष (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'course_planned', label: 'यो महिनासम्म सकिनुपर्ने कोर्ष (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'scheduled_periods', label: 'तालिकाअनुसार हुनुपर्ने घण्टी', type: 'number', min: 0, required: true },
      { key: 'taught_periods', label: 'वास्तवमा पढाइएको घण्टी', type: 'number', min: 0, required: true },
      { key: 'missed_period_reasons', label: 'घण्टी छुट्नुको कारण', type: 'multiselect', options: ['सार्वजनिक बिदा', 'शिक्षक अनुपस्थिति', 'विद्यालय कार्यक्रम', 'परीक्षा सञ्चालन', 'अर्को कक्षामा खटिएको', 'विद्यार्थी अनुपस्थिति', 'बन्द/हड्ताल', 'छुटेको छैन', 'अन्य'] },
      { key: 'other_period_reason', label: 'अन्य कारण भए उल्लेख गर्नुहोस्', type: 'text', condition: { key: 'missed_period_reasons', includes: 'अन्य' } },
    ],
  },
  {
    title: 'ग) गृहकार्य र पृष्ठपोषण',
    fields: [
      { key: 'homework_assigned', label: 'यो महिनामा दिइएको गृहकार्य/अभ्यास सङ्ख्या', type: 'number', min: 0, required: true },
      { key: 'homework_returned', label: 'जाँचेर फिर्ता दिइएको सङ्ख्या', type: 'number', min: 0, required: true },
      { key: 'homework_submission_band', label: 'औसतमा कति प्रतिशत विद्यार्थीले गृहकार्य बुझाउँछन्?', type: 'select', options: ['०–२५%', '२६–५०%', '५१–७५%', '७६–१००%'], required: true },
    ],
  },
  {
    title: 'घ) मूल्याङ्कन',
    description: 'परीक्षा नभएको महिना “भएन” छानेपछि बाँकी प्रश्न स्वतः लुक्छन्।',
    fields: [
      { key: 'exam_held', label: 'यो महिनामा यस विषयको परीक्षा लिनुभयो?', type: 'select', options: ['भयो', 'भएन'], required: true },
      { key: 'exam_type', label: 'परीक्षाको प्रकार', type: 'select', options: ['साप्ताहिक', 'मासिक/एकाइ', 'त्रैमासिक', 'अर्धवार्षिक', 'वार्षिक', 'अन्य'], condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'exam_date', label: 'परीक्षा मिति', type: 'date', condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'full_marks', label: 'पूर्णाङ्क', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'pass_marks', label: 'उत्तीर्णाङ्क', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'exam_boys', label: 'परीक्षामा सम्मिलित छात्र', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'exam_girls', label: 'परीक्षामा सम्मिलित छात्रा', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'absent_students', label: 'अनुपस्थित विद्यार्थी', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' } },
      { key: 'passed_boys', label: 'उत्तीर्ण छात्र', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'passed_girls', label: 'उत्तीर्ण छात्रा', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
      { key: 'total_marks_sum', label: 'कुल प्राप्तांकको योग', type: 'number', min: 0, step: 0.01, condition: { key: 'exam_held', value: 'भयो' }, required: true, help: 'सबै सम्मिलित विद्यार्थीले प्राप्त गरेको अंक जोडेर लेख्नुहोस्।' },
      { key: 'below_pass_count', label: 'उत्तीर्णाङ्कभन्दा कम ल्याउने विद्यार्थी', type: 'number', min: 0, condition: { key: 'exam_held', value: 'भयो' }, required: true },
    ],
  },
  {
    title: 'ङ) शिक्षण अभ्यास',
    fields: [
      { key: 'teaching_materials', label: 'प्रयोग गरिएका शैक्षिक सामग्री', type: 'multiselect', options: ['पाठ्यपुस्तक', 'चार्ट/पोस्टर', 'वास्तविक वस्तु/नमूना', 'चित्र/फ्ल्यास कार्ड', 'प्रयोगशाला सामग्री', 'नक्सा/ग्लोब', 'मोबाइल/ल्यापटप/प्रोजेक्टर', 'अडियो/भिडियो', 'आफैंले बनाएको सामग्री', 'कुनै प्रयोग भएन', 'अन्य'] },
      { key: 'teaching_methods', label: 'प्रयोग गरिएका शिक्षण विधि', type: 'multiselect', options: ['व्याख्यान', 'प्रश्नोत्तर', 'समूह कार्य', 'जोडी कार्य', 'परियोजना कार्य', 'प्रयोग/प्रदर्शन', 'खेलमा आधारित', 'कथा/भूमिका अभिनय', 'क्षेत्र भ्रमण', 'व्यक्तिगत अभ्यास', 'अन्य'] },
      { key: 'material_availability', label: 'आवश्यक शैक्षिक सामग्रीको उपलब्धता', type: 'rating', required: true },
      { key: 'best_class_activity', label: 'यो महिनाको उत्कृष्ट कक्षा क्रियाकलाप', type: 'textarea' },
    ],
  },
  {
    title: 'च) समस्या र समाधान',
    fields: [
      { key: 'teaching_problems', label: 'यस विषयको शिक्षणमा देखिएका समस्या', type: 'multiselect', options: problemOptions },
      { key: 'main_problem', label: 'मुख्य समस्याको संक्षिप्त विवरण', type: 'textarea' },
      { key: 'self_solution', label: 'तपाईंले आफैं अपनाउनुभएको समाधान', type: 'textarea' },
      { key: 'previous_problem_status', label: 'गत महिना उल्लेख गरेको समस्या अहिले के अवस्थामा छ?', type: 'select', options: previousStatus },
      { key: 'headteacher_support', label: 'प्रधानाध्यापकबाट तपाईंलाई के सहयोग चाहिन्छ?', type: 'textarea' },
    ],
  },
  {
    title: 'छ) विद्यार्थी',
    fields: [
      { key: 'excellent_students', label: 'उत्कृष्ट विद्यार्थी', type: 'repeat', maxRows: 4, fields: [
        { key: 'name', label: 'नाम', type: 'text', required: true },
        { key: 'gender', label: 'लिङ्ग', type: 'select', options: gender, required: true },
        { key: 'basis', label: 'आधार', type: 'multiselect', options: ['नियमित उपस्थिति', 'गृहकार्य नियमितता', 'परीक्षा नतिजा', 'कक्षा सहभागिता', 'उल्लेख्य सुधार', 'अनुशासन'] },
      ] },
      { key: 'remedial_count', label: 'विशेष सहयोग चाहिने विद्यार्थी सङ्ख्या', type: 'number', min: 0 },
      { key: 'remedial_action', label: 'तिनका लागि यो महिना के गर्नुभयो?', type: 'text' },
    ],
  },
  {
    title: 'सत्रको लक्ष्य',
    description: 'यो खण्ड शैक्षिक सत्रको पहिलो महिनामा मात्र भर्नुहोस्।',
    oncePerSession: true,
    fields: [
      { key: 'baseline_average', label: 'गत सत्रको यस कक्षा-विषयको औसत प्राप्तांक (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'target_average', label: 'यस सत्रको लक्ष्य औसत प्राप्तांक (%)', type: 'number', min: 0, max: 100, required: true },
    ],
  },
]

const classSections: ReportSection[] = [
  identification('कक्षा शिक्षकको नाम'),
  {
    title: 'ख) विद्यार्थी सङ्ख्या परिवर्तन',
    fields: [
      { key: 'start_boys', label: 'महिनाको सुरुमा छात्र', type: 'number', min: 0, required: true },
      { key: 'start_girls', label: 'महिनाको सुरुमा छात्रा', type: 'number', min: 0, required: true },
      { key: 'new_boys', label: 'यो महिना नयाँ भर्ना छात्र', type: 'number', min: 0, required: true },
      { key: 'new_girls', label: 'यो महिना नयाँ भर्ना छात्रा', type: 'number', min: 0, required: true },
      { key: 'left_boys', label: 'यो महिना छाडेका/स्थानान्तरण छात्र', type: 'number', min: 0, required: true },
      { key: 'left_girls', label: 'यो महिना छाडेका/स्थानान्तरण छात्रा', type: 'number', min: 0, required: true },
      { key: 'dropout_students', label: 'छाड्नेको विवरण', type: 'repeat', fields: [
        { key: 'name', label: 'नाम', type: 'text', required: true }, { key: 'gender', label: 'लिङ्ग', type: 'select', options: gender, required: true },
        { key: 'reason', label: 'कारण', type: 'select', options: ['बसाइँसराइ', 'आर्थिक अवस्था', 'घरायसी काम', 'विवाह', 'स्वास्थ्य', 'अर्को विद्यालयमा भर्ना', 'वैदेशिक रोजगार', 'थाहा भएन', 'अन्य'], required: true },
      ] },
    ],
  },
  {
    title: 'ग) उपस्थिति',
    fields: [
      { key: 'school_days', label: 'यो महिना विद्यालय सञ्चालन भएको कुल दिन', type: 'number', min: 0, required: true },
      { key: 'present_boys', label: 'कुल उपस्थित विद्यार्थी-दिन — छात्र', type: 'number', min: 0, required: true, help: 'दैनिक उपस्थित छात्र सङ्ख्याको महिनाभरिको योग।' },
      { key: 'present_girls', label: 'कुल उपस्थित विद्यार्थी-दिन — छात्रा', type: 'number', min: 0, required: true },
      { key: 'under_75_count', label: '७५% भन्दा कम उपस्थिति भएका विद्यार्थी सङ्ख्या', type: 'number', min: 0, required: true },
    ],
  },
  {
    title: 'घ) नियमित अनुपस्थित विद्यार्थी',
    fields: [
      { key: 'chronic_absentees', label: 'नियमित अनुपस्थित विद्यार्थी', type: 'repeat', fields: [
        { key: 'roll', label: 'रोल नं.', type: 'number', min: 1, required: true }, { key: 'name', label: 'नाम', type: 'text', required: true },
        { key: 'gender', label: 'लिङ्ग', type: 'select', options: gender, required: true }, { key: 'present_days', label: 'यो महिना उपस्थित दिन', type: 'number', min: 0, required: true },
        { key: 'reason', label: 'अनुपस्थितिको कारण', type: 'select', options: ['बिरामी', 'घरायसी काम', 'आर्थिक', 'बसाइँसराइ', 'पढाइमा रुचि नभएको', 'अभिभावक असहयोग', 'दूरी/यातायात', 'विवाह', 'थाहा भएन', 'अन्य'], required: true },
        { key: 'actions', label: 'यो महिना के कार्य गर्नुभयो?', type: 'multiselect', options: ['अभिभावकलाई फोन', 'घर भ्रमण', 'विद्यार्थीसँग व्यक्तिगत कुराकानी', 'प्रअ/सयोजकलाई जानकारी', 'कुनै कार्य भएन'] },
        { key: 'result', label: 'नतिजा', type: 'select', options: ['विद्यालय फर्कियो', 'आंशिक सुधार', 'सुधार भएन', 'सम्पर्क हुन सकेन'], required: true },
      ] },
    ],
  },
  {
    title: 'ङ) विद्यार्थी कल्याण',
    fields: [
      { key: 'complaint_areas', label: 'विद्यार्थीका गुनासाका क्षेत्र', type: 'multiselect', options: ['शिक्षण/पढाइ', 'शिक्षकको व्यवहार', 'साथीको व्यवहार/होच्याउने', 'शौचालय/खानेपानी', 'दिवा खाजा', 'पाठ्यपुस्तक/कापी', 'समय तालिका', 'कक्षाकोठा/फर्निचर', 'गुनासो आएन', 'अन्य'] },
      { key: 'complaint_action', label: 'मुख्य गुनासाको विवरण र तपाईंले गर्नुभएको कार्य', type: 'textarea' },
      { key: 'incident_happened', label: 'यो महिना अनुशासन/सुरक्षासम्बन्धी घटना भयो?', type: 'select', options: ['भएन', 'भयो'], required: true },
      { key: 'incident_count', label: 'घटनाको सङ्ख्या', type: 'number', min: 0, condition: { key: 'incident_happened', value: 'भयो' }, required: true },
      { key: 'incident_detail', label: 'घटनाको विवरण र गरिएको कारबाही', type: 'textarea', condition: { key: 'incident_happened', value: 'भयो' }, required: true },
    ],
  },
  {
    title: 'च) भौतिक अवस्था',
    description: '१ = एकदमै अपुग/खराब, ५ = पर्याप्त/राम्रो',
    fields: [
      { key: 'classroom_condition', label: 'कक्षाकोठाको अवस्था', type: 'rating', required: true },
      { key: 'furniture_adequacy', label: 'फर्निचरको पर्याप्तता', type: 'rating', required: true },
      { key: 'textbook_availability', label: 'पाठ्यपुस्तक उपलब्धता', type: 'rating', required: true },
      { key: 'water_toilet', label: 'खानेपानी र शौचालय', type: 'rating', required: true },
      { key: 'cleanliness', label: 'सरसफाइ', type: 'rating', required: true },
    ],
  },
  {
    title: 'छ) अभिभावक सम्पर्क',
    fields: [
      { key: 'parent_meeting', label: 'यो महिना अभिभावक भेला बस्यो?', type: 'select', options: ['बस्यो', 'बसेन'], required: true },
      { key: 'parent_meeting_date', label: 'भेलाको मिति', type: 'date', condition: { key: 'parent_meeting', value: 'बस्यो' }, required: true },
      { key: 'parent_attendance', label: 'उपस्थित अभिभावक सङ्ख्या', type: 'number', min: 0, condition: { key: 'parent_meeting', value: 'बस्यो' }, required: true },
      { key: 'parent_discussion', label: 'मुख्य छलफल', type: 'text', condition: { key: 'parent_meeting', value: 'बस्यो' }, required: true },
      { key: 'parents_contacted', label: 'व्यक्तिगत रूपमा सम्पर्क गरिएका अभिभावक सङ्ख्या', type: 'number', min: 0, required: true },
    ],
  },
  {
    title: 'ज) समस्या र समाधान',
    fields: [
      { key: 'management_problems', label: 'कक्षा व्यवस्थापनमा देखिएका समस्या', type: 'multiselect', options: problemOptions },
      { key: 'problem_detail', label: 'विवरण', type: 'textarea' }, { key: 'solution', label: 'तपाईंले अपनाएको समाधान', type: 'textarea' },
      { key: 'previous_problem_status', label: 'गत महिनाको समस्याको अवस्था', type: 'select', options: previousStatus },
      { key: 'headteacher_support', label: 'प्रधानाध्यापकबाट चाहिएको सहयोग', type: 'textarea' },
    ],
  },
  {
    title: 'झ) उत्कृष्टता',
    fields: [
      { key: 'excellent_students', label: 'यो महिनाको उत्कृष्ट विद्यार्थी', type: 'repeat', maxRows: 5, fields: [
        { key: 'name', label: 'नाम', type: 'text', required: true }, { key: 'gender', label: 'लिङ्ग', type: 'select', options: gender, required: true },
        { key: 'basis', label: 'आधार', type: 'multiselect', options: ['उपस्थिति', 'अनुशासन', 'परीक्षा', 'अतिरिक्त क्रियाकलाप', 'उल्लेख्य सुधार'] },
      ] },
      { key: 'model_practice', label: 'तपाईंको कक्षामा भएको अनुकरणीय/आदर्श अभ्यास', type: 'textarea' },
    ],
  },
  {
    title: 'सत्रको लक्ष्य', oncePerSession: true,
    description: 'यो खण्ड शैक्षिक सत्रको पहिलो महिनामा मात्र भर्नुहोस्।',
    fields: [
      { key: 'baseline_average', label: 'गत सत्रको कक्षागत औसत प्राप्तांक (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'target_average', label: 'यस सत्रको लक्ष्य (%)', type: 'number', min: 0, max: 100, required: true },
    ],
  },
]

const inchargeIdentification: ReportSection = {
  title: 'क) परिचय', fields: [
    { key: 'session_year', label: 'शैक्षिक सत्र', type: 'select', source: 'sessions', required: true },
    { key: 'month_code', label: 'महिना', type: 'select', source: 'months', required: true },
    { key: 'teacher_code', label: 'सयोजक शिक्षक ID', type: 'text', required: true },
    { key: 'teacher_id', label: 'सयोजकको नाम', type: 'select', source: 'teachers', required: true },
    { key: 'level', label: 'तह', type: 'select', options: ['आधारभूत', 'माध्यमिक'], required: true },
  ],
}

const inchargeSections: ReportSection[] = [
  inchargeIdentification,
  {
    title: 'ख) प्रतिवेदन अनुगमन',
    description: 'प्राप्त हुनुपर्ने प्रतिवेदन सङ्ख्या class_subject बाट स्वतः गणना हुन्छ।',
    fields: [
      { key: 'on_time_reports', label: 'समयमै प्राप्त भएका', type: 'number', min: 0, required: true },
      { key: 'non_submitters', label: 'प्रतिवेदन नबुझाउने शिक्षक', type: 'multiselect', source: 'teachers' },
    ],
  },
  {
    title: 'ग) कक्षा अवलोकन',
    description: 'मासिक मानक: कम्तीमा ८ अवलोकन।',
    fields: [
      { key: 'observation_count', label: 'यो महिना कति कक्षा अवलोकन गर्नुभयो?', type: 'number', min: 0, required: true },
      { key: 'observations', label: 'अवलोकन विवरण', type: 'repeat', fields: [
        { key: 'date', label: 'मिति', type: 'date', required: true }, { key: 'teacher_id', label: 'शिक्षक', type: 'select', source: 'teachers', required: true },
        { key: 'class_id', label: 'कक्षा', type: 'select', source: 'classes', required: true }, { key: 'subject_id', label: 'विषय', type: 'select', source: 'subjects', required: true },
        { key: 'lesson_preparation', label: 'पाठयोजना/तयारी', type: 'rating', required: true }, { key: 'student_participation', label: 'विद्यार्थी सक्रिय सहभागिता', type: 'rating', required: true },
        { key: 'materials_use', label: 'शैक्षिक सामग्रीको प्रयोग', type: 'rating', required: true }, { key: 'class_management', label: 'कक्षा व्यवस्थापन', type: 'rating', required: true },
        { key: 'question_assessment', label: 'प्रश्न सोध्ने र मूल्याङ्कन', type: 'rating', required: true },
        { key: 'strength', label: 'सबल पक्ष', type: 'text' }, { key: 'improvement', label: 'सुधार गर्नुपर्ने पक्ष', type: 'text' },
        { key: 'feedback', label: 'दिइएको पृष्ठपोषण', type: 'text' },
        { key: 'previous_followup', label: 'गत अवलोकनको सुझाव कार्यान्वयन भयो?', type: 'select', options: ['भयो', 'आंशिक', 'भएन', 'पहिलो अवलोकन'], required: true },
      ] },
    ],
  },
  {
    title: 'घ) शिक्षक उपस्थिति र घण्टी व्यवस्थापन',
    fields: [
      { key: 'teacher_absent_days', label: 'यस तहमा शिक्षक अनुपस्थित भएको कुल दिन', type: 'number', min: 0, required: true },
      { key: 'vacant_periods', label: 'खाली भएको कुल घण्टी', type: 'number', min: 0, required: true },
      { key: 'substituted_periods', label: 'वैकल्पिक व्यवस्था मिलाइएको घण्टी', type: 'number', min: 0, required: true },
      { key: 'absence_details', label: 'अनुपस्थिति विवरण', type: 'repeat', fields: [
        { key: 'teacher_id', label: 'शिक्षक', type: 'select', source: 'teachers', required: true }, { key: 'days', label: 'अनुपस्थित दिन', type: 'number', min: 0, required: true },
        { key: 'reason', label: 'कारण', type: 'select', options: ['बिदा', 'तालिम', 'काज', 'बिरामी', 'अन्य'], required: true },
      ] },
    ],
  },
  {
    title: 'ङ) शिक्षक सहयोग र उत्कृष्टता',
    fields: [
      { key: 'support_teachers', label: 'सहयोग/तालिम आवश्यक शिक्षक', type: 'repeat', fields: [
        { key: 'teacher_id', label: 'नाम', type: 'select', source: 'teachers', required: true },
        { key: 'needs', label: 'आवश्यक सहयोग', type: 'multiselect', options: ['विषयगत ज्ञान', 'शिक्षण विधि', 'कक्षा व्यवस्थापन', 'मूल्याङ्कन सिप', 'ICT सिप', 'समय व्यवस्थापन', 'अभिभावक सम्पर्क'] },
        { key: 'proposed_action', label: 'प्रस्तावित कार्य', type: 'text' },
      ] },
      { key: 'excellent_teachers', label: 'उत्कृष्ट कार्य गर्ने शिक्षक', type: 'repeat', maxRows: 2, fields: [
        { key: 'teacher_id', label: 'नाम', type: 'select', source: 'teachers', required: true },
        { key: 'basis', label: 'आधार', type: 'multiselect', options: ['विद्यार्थी नतिजा सुधार', 'नियमित गृहकार्य जाँच', 'नवीन शिक्षण विधि', 'आफैंले बनाएको सामग्री', 'कक्षा नछुटाउने', 'अभिभावक सम्पर्क', 'अतिरिक्त कक्षा'] },
        { key: 'evidence', label: 'प्रमाण/विवरण', type: 'textarea' },
      ] },
      { key: 'excellent_materials', label: 'उत्कृष्ट शैक्षिक सामग्री', type: 'repeat', fields: [
        { key: 'teacher_id', label: 'शिक्षक', type: 'select', source: 'teachers', required: true }, { key: 'name', label: 'सामग्रीको नाम', type: 'text', required: true },
        { key: 'subject_id', label: 'विषय', type: 'select', source: 'subjects', required: true },
      ] },
    ],
  },
  {
    title: 'च) तहगत क्रियाकलाप',
    fields: [
      { key: 'activities', label: 'अतिरिक्त क्रियाकलाप', type: 'repeat', fields: [
        { key: 'name', label: 'नाम', type: 'text', required: true }, { key: 'date', label: 'मिति', type: 'date', required: true },
        { key: 'type', label: 'प्रकार', type: 'select', options: ['खेलकुद', 'वादविवाद/वक्तृत्व', 'हाजिरजवाफ', 'सांस्कृतिक', 'सरसफाइ', 'विज्ञान/गणित प्रदर्शनी', 'भ्रमण', 'अतिथि प्रवचन', 'अन्य'], required: true },
        { key: 'boys', label: 'सहभागी छात्र', type: 'number', min: 0 }, { key: 'girls', label: 'सहभागी छात्रा', type: 'number', min: 0 },
        { key: 'prize', label: 'पुरस्कार वितरण', type: 'select', options: ['भयो', 'भएन'] },
      ] },
      { key: 'meetings', label: 'बैठक', type: 'repeat', fields: [
        { key: 'date', label: 'मिति', type: 'date', required: true }, { key: 'type', label: 'प्रकार', type: 'select', options: ['तहगत शिक्षक बैठक', 'विषय समिति', 'अभिभावक', 'व्यवस्थापन समिति', 'अन्य'], required: true },
        { key: 'attendance', label: 'उपस्थित सङ्ख्या', type: 'number', min: 0 }, { key: 'decisions', label: 'मुख्य निर्णय', type: 'textarea' },
        { key: 'responsible_teacher_id', label: 'जिम्मेवारी तोकिएको व्यक्ति', type: 'select', source: 'teachers' }, { key: 'implementation_date', label: 'कार्यान्वयन मिति', type: 'date' },
      ] },
      { key: 'previous_decisions_status', label: 'गत बैठकका निर्णय कार्यान्वयन अवस्था', type: 'select', options: ['सबै', 'अधिकांश', 'केही', 'कुनै पनि होइन'] },
    ],
  },
  {
    title: 'छ) तहगत विश्लेषण र निर्णय',
    fields: [
      { key: 'level_problems', label: 'यस तहका मुख्य ३ समस्या', type: 'multiselect', options: problemOptions },
      { key: 'problem_detail', label: 'समस्याको विवरण', type: 'textarea' }, { key: 'solved_problems', label: 'गत महिनाका समस्यामध्ये समाधान भएका', type: 'textarea' },
      { key: 'action_plan', label: 'तहस्तरमा तपाईंले लिनुभएको निर्णय/कार्ययोजना', type: 'textarea' },
      { key: 'headteacher_decision', label: 'प्रधानाध्यापकको निर्णय चाहिने विषय', type: 'textarea' },
      { key: 'next_priorities', label: 'यस तहका लागि अर्को महिनाको प्राथमिकता (३ बुँदा)', type: 'textarea' },
    ],
  },
  {
    title: 'ज) स्वतः गणना तथ्याङ्क जाँच',
    description: 'उपस्थिति, कोर्ष, नतिजा, गृहकार्य, dropout र chronic absentee तथ्याङ्क dashboard बाट स्वतः आउँछन्।',
    fields: [{ key: 'data_quality_note', label: 'शङ्कास्पद वा गलत देखिएको तथ्याङ्क भए उल्लेख गर्नुहोस्', type: 'textarea' }],
  },
]

export const reportDefinitions: Record<ReportKind, ReportDefinition> = {
  subject: { title: 'विषय शिक्षक मासिक प्रतिवेदन', subtitle: 'फारम १ · विषय शिक्षक', grain: 'प्रति महिना प्रत्येक कक्षा × विषयका लागि एउटा प्रतिवेदन', sections: subjectSections },
  class: { title: 'कक्षा शिक्षक मासिक प्रतिवेदन', subtitle: 'फारम २ · कक्षा शिक्षक', grain: 'प्रति महिना प्रत्येक कक्षाका लागि एउटा प्रतिवेदन', sections: classSections },
  incharge: { title: 'तह सयोजक मासिक प्रतिवेदन', subtitle: 'फारम ३ · तह सयोजक', grain: 'प्रति महिना प्रत्येक तहका लागि एउटा प्रतिवेदन', sections: inchargeSections },
}
