const ar = {
  app: { name: 'سنديك جست', tagline: 'إدارة الممتلكات المشتركة', builtBy: 'بني بواسطة ILIASFANANE' },
  nav: {
    dashboard: 'لوحة القيادة', buildings: 'المباني', residents: 'السكان',
    payments: 'المدفوعات', charges: 'الرسوم', notifications: 'الإشعارات',
    admin: 'الإدارة', logout: 'تسجيل الخروج', lightMode: 'وضع فاتح', darkMode: 'وضع داكن',
  },
  common: {
    loading: 'جارٍ التحميل...', cancel: 'إلغاء', save: 'حفظ', delete: 'حذف',
    close: 'إغلاق', send: 'إرسال', confirm: 'تأكيد', search: 'بحث...',
    all: 'الكل', none: 'لا شيء', actions: 'إجراءات', status: 'الحالة', period: 'الفترة',
    amount: 'المبلغ', contact: 'اتصال', month: 'الشهر', year: 'السنة',
    buildings: 'مباني', residents: 'ساكن',
    noData: 'لا توجد بيانات', noBuilding: 'لا يوجد مبنى', noResident: 'لا يوجد ساكن',
    noPayment: 'لا يوجد دفع', noCharge: 'لا توجد رسوم', noNotification: 'لا يوجد إشعار',
    noManager: 'لا يوجد مدير',
  },
  months: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
    'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر',
  ],
  auth: {
    login: 'تسجيل الدخول', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    loggingIn: 'جارٍ تسجيل الدخول...', error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    adminHint: 'المسؤول: admin@syndic.fr / admin123',
  },
  dashboard: {
    title: 'لوحة القيادة', summary: 'ملخص مالي',
    residents: 'السكان', paid: 'تم الدفع', pending: 'قيد الانتظار', unpaid: 'غير مدفوع',
    collected: 'المجموع', charges: 'الرسوم', balance: 'الرصيد الصافي',
    monthlyTitle: 'الإيرادات الشهرية', buildingProgress: 'التقدم حسب المبنى',
  },
  buildings: {
    title: 'المباني', new: 'مبنى جديد', edit: 'تعديل', name: 'الاسم', address: 'العنوان',
    import: 'استيراد إكسل', importTitle: 'استيراد السكان',
    importFormat: 'التنسيق: الاسم الأول، اسم العائلة، الشقة، الهاتف، البريد الإلكتروني (الأعمدة A-E)',
    deleteConfirm: 'حذف هذا المبنى؟ سيتم حذف جميع السكان والمدفوعات والرسوم المرتبطة به.',
    manager: 'المدير',
  },
  residents: {
    title: 'السكان', new: 'ساكن جديد', edit: 'تعديل',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', apartment: 'الشقة', phone: 'الهاتف', email: 'البريد الإلكتروني',
    deleteConfirm: 'حذف هذا الساكن؟',
  },
  payments: {
    title: 'المدفوعات', declare: 'تصريح بالدفع', declareTitle: 'تصريح بالدفع',
    statusPaid: 'مدفوع', statusPending: 'قيد الانتظار', statusUnpaid: 'غير مدفوع',
    verify: 'تحقق', unverify: 'إلغاء التحقق', reset: 'إعادة تعيين',
    changeStatus: 'تغيير الحالة', noPayment: 'بدون دفع', markUnpaid: 'تحديد غير مدفوع',
    confirmation: 'تأكيد', logs: 'السجل',
    selectResident: 'اختر ساكنًا', selectMonths: 'اختر الأشهر',
    payNow: 'الدفع مباشرة (حالة مدفوع)', reason: 'السبب إجباري...',
    newStatus: 'الحالة الجديدة', filterAll: 'جميع الحالات',
  },
  charges: {
    title: 'الرسوم', new: 'رسوم جديدة', edit: 'تعديل',
    description: 'الوصف', deleteConfirm: 'حذف هذه الرسوم؟',
  },
  notifications: {
    title: 'الإشعارات', send: 'إرسال إشعار', sendTitle: 'إرسال إشعار',
    message: 'الرسالة', type: 'النوع', sentBy: 'أرسل بواسطة', date: 'التاريخ',
    selectAll: 'اختيار جميع السكان', yourMessage: 'رسالتك...',
    sent: 'تم الإرسال',
  },
  admin: {
    title: 'الإدارة', managers: 'المدراء', add: 'إضافة',
    export: 'تصدير إكسل', exportDesc: 'تنزيل التقرير الشهري للمدفوعات',
    download: 'تنزيل التقرير', deleteConfirm: 'حذف هذا المدير؟',
    passwordPlaceholder: 'كلمة المرور', passwordEditPlaceholder: 'كلمة مرور جديدة (اتركه فارغًا)',
    noBuilding: 'لا يوجد مبنى',
  },
};

export default ar;
