// تعريف نموذج البيانات للعميل
class Customer {
  constructor(id, name, phone, notes = '') {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.notes = notes;
    this.measurements = {};
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

// تطبيق الترزي الرئيسي
class TailorApp {
  constructor() {
    this.customers = [];
    this.currentTab = 'customers'; // customers, addCustomer, editCustomer
    this.selectedCustomerId = null;
    this.measurementTypes = [
      { id: 'chest', name: 'الصدر' },
      { id: 'waist', name: 'الخصر' },
      { id: 'hips', name: 'الورك' },
      { id: 'shoulder', name: 'الكتف' },
      { id: 'sleeve', name: 'طول الكم' },
      { id: 'inseam', name: 'طول الساق الداخلي' },
      { id: 'neck', name: 'الرقبة' },
      { id: 'length', name: 'الطول الكلي' },
      { id: 'thigh', name: 'الفخذ' },
      { id: 'calf', name: 'بطة الساق' },
      { id: 'ankle', name: 'الكاحل' },
      { id: 'bicep', name: 'العضد' },
      { id: 'wrist', name: 'المعصم' },
    ];
    
    // تحميل البيانات من التخزين المحلي
    this.loadData();
    
    // تهيئة التطبيق
    this.init();
  }
  
  // تهيئة التطبيق وإضافة مستمعي الأحداث
  init() {
    const appElement = document.getElementById('app');
    this.render(appElement);
    
    // إضافة مستمعي الأحداث بعد تحديث DOM
    this.addEventListeners();
  }
  
  // تحميل البيانات من التخزين المحلي
  loadData() {
    const savedCustomers = localStorage.getItem('tailorAppCustomers');
    if (savedCustomers) {
      this.customers = JSON.parse(savedCustomers);
    }
  }
  
  // حفظ البيانات في التخزين المحلي
  saveData() {
    localStorage.setItem('tailorAppCustomers', JSON.stringify(this.customers));
  }
  
  // إضافة عميل جديد
  addCustomer(name, phone, notes = '') {
    const id = Date.now().toString();
    const customer = new Customer(id, name, phone, notes);
    this.customers.push(customer);
    this.saveData();
    return customer;
  }
  
  // تحديث بيانات عميل
  updateCustomer(id, data) {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    if (customerIndex !== -1) {
      this.customers[customerIndex] = {
        ...this.customers[customerIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      return this.customers[customerIndex];
    }
    return null;
  }
  
  // حذف عميل
  deleteCustomer(id) {
    this.customers = this.customers.filter(c => c.id !== id);
    this.saveData();
  }
  
  // الحصول على عميل بواسطة المعرف
  getCustomerById(id) {
    return this.customers.find(c => c.id === id) || null;
  }
  
  // إضافة أو تحديث قياس لعميل
  setMeasurement(customerId, measurementId, value) {
    const customer = this.getCustomerById(customerId);
    if (customer) {
      customer.measurements[measurementId] = value;
      customer.updatedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }
  
  // البحث عن عملاء
  searchCustomers(query) {
    if (!query) return this.customers;
    
    const lowerQuery = query.toLowerCase();
    return this.customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(lowerQuery)
    );
  }
  
  // تغيير التبويب الحالي
  setTab(tab, customerId = null) {
    this.currentTab = tab;
    this.selectedCustomerId = customerId;
    this.render(document.getElementById('app'));
    this.addEventListeners();
  }
  
  // إضافة مستمعي الأحداث
  addEventListeners() {
    // مستمعي أحداث التبويبات
    const tabElements = document.querySelectorAll('.tab');
    tabElements.forEach(tab => {
      tab.addEventListener('click', () => {
        this.setTab(tab.dataset.tab);
      });
    });
    
    // مستمع حدث البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const customerList = document.querySelector('.customer-list');
        customerList.innerHTML = this.renderCustomerList(this.searchCustomers(query));
        this.addCustomerCardListeners();
      });
    }
    
    // مستمعي أحداث نموذج إضافة عميل
    const addCustomerForm = document.getElementById('addCustomerForm');
    if (addCustomerForm) {
      addCustomerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;
        const notes = document.getElementById('customerNotes').value;
        
        if (name && phone) {
          this.addCustomer(name, phone, notes);
          this.setTab('customers');
        }
      });
    }
    
    // مستمعي أحداث نموذج تحرير عميل
    const editCustomerForm = document.getElementById('editCustomerForm');
    if (editCustomerForm) {
      editCustomerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('editCustomerName').value;
        const phone = document.getElementById('editCustomerPhone').value;
        const notes = document.getElementById('editCustomerNotes').value;
        
        if (name && phone && this.selectedCustomerId) {
          this.updateCustomer(this.selectedCustomerId, { name, phone, notes });
          this.setTab('viewCustomer', this.selectedCustomerId);
        }
      });
    }
    
    // مستمعي أحداث نموذج القياسات
    const measurementForm = document.getElementById('measurementForm');
    if (measurementForm) {
      measurementForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        this.measurementTypes.forEach(type => {
          const input = document.getElementById(`measurement-${type.id}`);
          if (input && input.value) {
            this.setMeasurement(this.selectedCustomerId, type.id, input.value);
          }
        });
        
        this.setTab('viewCustomer', this.selectedCustomerId);
      });
    }
    
    // إضافة مستمعي أحداث لبطاقات العملاء
    this.addCustomerCardListeners();
  }
  
  // إضافة مستمعي أحداث لبطاقات العملاء
  addCustomerCardListeners() {
    const viewButtons = document.querySelectorAll('.view-customer-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.setTab('viewCustomer', button.dataset.id);
      });
    });
    
    const editButtons = document.querySelectorAll('.edit-customer-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.setTab('editCustomer', button.dataset.id);
      });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-customer-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
          this.deleteCustomer(button.dataset.id);
          this.setTab('customers');
        }
      });
    });
    
    const measurementButtons = document.querySelectorAll('.edit-measurements-btn');
    measurementButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.setTab('editMeasurements', button.dataset.id);
      });
    });
  }
  
  // عرض قائمة العملاء
  renderCustomerList(customers = this.customers) {
    if (customers.length === 0) {
      return '<div class="card">لا يوجد عملاء. قم بإضافة عميل جديد.</div>';
    }
    
    return customers.map(customer => `
      <div class="customer-card">
        <h3>${customer.name}</h3>
        <p><strong>رقم الهاتف:</strong> ${customer.phone}</p>
        ${customer.notes ? `<p><strong>ملاحظات:</strong> ${customer.notes}</p>` : ''}
        <p><strong>عدد القياسات:</strong> ${Object.keys(customer.measurements).length}</p>
        <div class="actions">
          <button class="view-customer-btn" data-id="${customer.id}">عرض</button>
          <button class="edit-customer-btn" data-id="${customer.id}">تعديل</button>
          <button class="edit-measurements-btn" data-id="${customer.id}">القياسات</button>
          <button class="delete-customer-btn danger" data-id="${customer.id}">حذف</button>
        </div>
      </div>
    `).join('');
  }
  
  // عرض تفاصيل عميل
  renderCustomerDetails(customerId) {
    const customer = this.getCustomerById(customerId);
    if (!customer) return '<div class="card">العميل غير موجود</div>';
    
    const measurementsHtml = this.renderMeasurementsTable(customer);
    
    return `
      <div class="card">
        <h2>${customer.name}</h2>
        <p><strong>رقم الهاتف:</strong> ${customer.phone}</p>
        ${customer.notes ? `<p><strong>ملاحظات:</strong> ${customer.notes}</p>` : ''}
        <p><strong>تاريخ الإضافة:</strong> ${new Date(customer.createdAt).toLocaleDateString('ar-SA')}</p>
        <p><strong>آخر تحديث:</strong> ${new Date(customer.updatedAt).toLocaleDateString('ar-SA')}</p>
        
        <h3>القياسات</h3>
        ${measurementsHtml}
        
        <div class="actions">
          <button class="edit-customer-btn" data-id="${customer.id}">تعديل البيانات</button>
          <button class="edit-measurements-btn" data-id="${customer.id}">تعديل القياسات</button>
          <button class="back-btn">العودة للقائمة</button>
        </div>
      </div>
    `;
  }
  
  // عرض جدول القياسات
  renderMeasurementsTable(customer) {
    const hasMeasurements = Object.keys(customer.measurements).length > 0;
    
    if (!hasMeasurements) {
      return '<p>لا توجد قياسات مسجلة بعد.</p>';
    }
    
    let tableRows = '';
    this.measurementTypes.forEach(type => {
      if (customer.measurements[type.id]) {
        tableRows += `
          <tr>
            <td>${type.name}</td>
            <td>${customer.measurements[type.id]}</td>
          </tr>
        `;
      }
    });
    
    return `
      <table class="measurements-table">
        <thead>
          <tr>
            <th>القياس</th>
            <th>القيمة</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }
  
  // عرض نموذج إضافة عميل
  renderAddCustomerForm() {
    return `
      <div class="card">
        <h2>إضافة عميل جديد</h2>
        <form id="addCustomerForm">
          <div class="form-group">
            <label for="customerName">اسم العميل</label>
            <input type="text" id="customerName" required>
          </div>
          
          <div class="form-group">
            <label for="customerPhone">رقم الهاتف</label>
            <input type="text" id="customerPhone" required>
          </div>
          
          <div class="form-group">
            <label for="customerNotes">ملاحظات</label>
            <textarea id="customerNotes" rows="3"></textarea>
          </div>
          
          <div class="actions">
            <button type="submit">إضافة</button>
            <button type="button" class="back-btn secondary">إلغاء</button>
          </div>
        </form>
      </div>
    `;
  }
  
  // عرض نموذج تعديل عميل
  renderEditCustomerForm(customerId) {
    const customer = this.getCustomerById(customerId);
    if (!customer) return '<div class="card">العميل غير موجود</div>';
    
    return `
      <div class="card">
        <h2>تعديل بيانات العميل</h2>
        <form id="editCustomerForm">
          <div class="form-group">
            <label for="editCustomerName">اسم العميل</label>
            <input type="text" id="editCustomerName" value="${customer.name}" required>
          </div>
          
          <div class="form-group">
            <label for="editCustomerPhone">رقم الهاتف</label>
            <input type="text" id="editCustomerPhone" value="${customer.phone}" required>
          </div>
          
          <div class="form-group">
            <label for="editCustomerNotes">ملاحظات</label>
            <textarea id="editCustomerNotes" rows="3">${customer.notes || ''}</textarea>
          </div>
          
          <div class="actions">
            <button type="submit">حفظ التغييرات</button>
            <button type="button" class="back-btn secondary">إلغاء</button>
          </div>
        </form>
      </div>
    `;
  }
  
  // عرض نموذج تعديل القياسات
  renderEditMeasurementsForm(customerId) {
    const customer = this.getCustomerById(customerId);
    if (!customer) return '<div class="card">العميل غير موجود</div>';
    
    const measurementInputs = this.measurementTypes.map(type => {
      const value = customer.measurements[type.id] || '';
      return `
        <div class="form-group">
          <label for="measurement-${type.id}">${type.name}</label>
          <input type="text" id="measurement-${type.id}" value="${value}" placeholder="أدخل القيمة">
        </div>
      `;
    }).join('');
    
    return `
      <div class="card">
        <h2>تعديل قياسات ${customer.name}</h2>
        <form id="measurementForm">
          ${measurementInputs}
          
          <div class="actions">
            <button type="submit">حفظ القياسات</button>
            <button type="button" class="back-btn secondary">إلغاء</button>
          </div>
        </form>
      </div>
    `;
  }
  
  // عرض التطبيق
  render(element) {
    let content = '';
    
    // رأس الصفحة
    content += `
      <header>
        <h1>تطبيق الترزي - إدارة مقاسات العملاء</h1>
      </header>
      <div class="container">
    `;
    
    // شريط التبويبات
    content += `
      <div class="tabs">
        <div class="tab ${this.currentTab === 'customers' ? 'active' : ''}" data-tab="customers">قائمة العملاء</div>
        <div class="tab ${this.currentTab === 'addCustomer' ? 'active' : ''}" data-tab="addCustomer">إضافة عميل</div>
      </div>
    `;
    
    // محتوى التبويب الحالي
    if (this.currentTab === 'customers') {
      content += `
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="ابحث عن عميل...">
        </div>
        <div class="actions" style="margin-bottom: 1.5rem;">
          <button id="addCustomerBtn">إضافة عميل جديد</button>
        </div>
        <div class="customer-list">
          ${this.renderCustomerList()}
        </div>
      `;
    } else if (this.currentTab === 'addCustomer') {
      content += this.renderAddCustomerForm();
    } else if (this.currentTab === 'editCustomer') {
      content += this.renderEditCustomerForm(this.selectedCustomerId);
    } else if (this.currentTab === 'viewCustomer') {
      content += this.renderCustomerDetails(this.selectedCustomerId);
    } else if (this.currentTab === 'editMeasurements') {
      content += this.renderEditMeasurementsForm(this.selectedCustomerId);
    }
    
    content += '</div>'; // إغلاق الحاوية
    
    // تحديث المحتوى
    element.innerHTML = content;
    
    // إضافة مستمعي أحداث إضافية
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    if (addCustomerBtn) {
      addCustomerBtn.addEventListener('click', () => {
        this.setTab('addCustomer');
      });
    }
    
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.setTab('customers');
      });
    });
  }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const app = new TailorApp();
});