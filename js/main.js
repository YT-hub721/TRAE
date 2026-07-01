document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('registrationForm');
  if (!form) return;

  var submitBtn = document.getElementById('submitBtn');
  var sendCodeBtn = document.getElementById('sendCodeBtn');
  var selectedCoursesContainer = document.getElementById('selectedCourses');
  var courseInput = document.getElementById('courseInput');
  var selectedCourses = [];

  var validationRules = {
    name: {
      required: true,
      minLength: 2,
      messages: {
        required: '请输入您的姓名',
        minLength: '姓名至少需要 2 个字符'
      }
    },
    phone: {
      required: true,
      pattern: /^1[3-9]\d{9}$/,
      messages: {
        required: '请输入联系电话',
        pattern: '请输入有效的手机号码'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      messages: {
        required: '请输入邮箱地址',
        pattern: '请输入有效的邮箱地址'
      }
    },
    course: {
      required: true,
      messages: {
        required: '请至少选择一门课程'
      }
    },
    code: {
      required: true,
      pattern: /^\d{6}$/,
      messages: {
        required: '请输入验证码',
        pattern: '请输入 6 位数字验证码'
      }
    },
    agree: {
      required: true,
      messages: {
        required: '请阅读并同意课程服务协议'
      }
    }
  };

  function showError(fieldName, message) {
    var field = form.querySelector('[name="' + fieldName + '"]');
    var errorEl = form.querySelector('[data-error-for="' + fieldName + '"]');

    if (fieldName === 'course') {
      selectedCoursesContainer.classList.add('error');
    } else if (field && field.type !== 'checkbox') {
      field.classList.add('error');
    }

    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearError(fieldName) {
    var field = form.querySelector('[name="' + fieldName + '"]');
    var errorEl = form.querySelector('[data-error-for="' + fieldName + '"]');

    if (fieldName === 'course') {
      selectedCoursesContainer.classList.remove('error');
    } else if (field && field.type !== 'checkbox') {
      field.classList.remove('error');
    }

    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  function validateField(fieldName) {
    var rules = validationRules[fieldName];
    if (!rules) return true;

    var field = form.querySelector('[name="' + fieldName + '"]');
    if (!field) return true;

    var value;
    if (field.type === 'checkbox') {
      value = field.checked;
    } else {
      value = field.value.trim();
    }

    clearError(fieldName);

    if (rules.required && !value) {
      showError(fieldName, rules.messages.required);
      return false;
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      showError(fieldName, rules.messages.minLength);
      return false;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      showError(fieldName, rules.messages.pattern);
      return false;
    }

    return true;
  }

  function validateForm() {
    var isValid = true;
    var fieldNames = Object.keys(validationRules);

    fieldNames.forEach(function (fieldName) {
      if (!validateField(fieldName)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ====== 课程选择逻辑 ======
  function renderSelectedCourses() {
    selectedCoursesContainer.innerHTML = '';

    if (selectedCourses.length === 0) {
      var placeholder = document.createElement('span');
      placeholder.className = 'selected-courses-placeholder';
      placeholder.textContent = '请点击上方"购买课程"按钮选择课程';
      selectedCoursesContainer.appendChild(placeholder);
      courseInput.value = '';
    } else {
      courseInput.value = selectedCourses.join(', ');
      selectedCourses.forEach(function (courseName) {
        var tag = document.createElement('span');
        tag.className = 'course-tag';

        var tagText = document.createElement('span');
        tagText.textContent = courseName;
        tag.appendChild(tagText);

        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'course-tag-remove';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', '移除 ' + courseName);
        removeBtn.addEventListener('click', function () {
          removeCourse(courseName);
        });
        tag.appendChild(removeBtn);

        selectedCoursesContainer.appendChild(tag);
      });
    }

    updateCourseButtons();
    clearError('course');
  }

  function updateCourseButtons() {
    var courseButtons = document.querySelectorAll('.course-btn');
    courseButtons.forEach(function (btn) {
      var card = btn.closest('.course-card');
      var courseTitle = card.querySelector('.course-title').textContent;
      if (selectedCourses.indexOf(courseTitle) !== -1) {
        btn.classList.add('selected');
        btn.textContent = '已选择';
      } else {
        btn.classList.remove('selected');
        btn.textContent = '购买课程';
      }
    });
  }

  function addCourse(courseName) {
    if (selectedCourses.indexOf(courseName) === -1) {
      selectedCourses.push(courseName);
      renderSelectedCourses();
    }
  }

  function removeCourse(courseName) {
    var index = selectedCourses.indexOf(courseName);
    if (index !== -1) {
      selectedCourses.splice(index, 1);
      renderSelectedCourses();
    }
  }

  // 绑定"购买课程"按钮点击事件
  var courseButtons = document.querySelectorAll('.course-btn');
  courseButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.course-card');
      var courseTitle = card.querySelector('.course-title').textContent;

      if (selectedCourses.indexOf(courseTitle) !== -1) {
        removeCourse(courseTitle);
      } else {
        addCourse(courseTitle);
      }

      // 平滑滚动到报名表单
      var registerSection = document.getElementById('register');
      if (registerSection) {
        registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ====== 表单字段验证事件绑定 ======
  var fieldNames = Object.keys(validationRules);
  fieldNames.forEach(function (fieldName) {
    var field = form.querySelector('[name="' + fieldName + '"]');
    if (!field) return;

    field.addEventListener('blur', function () {
      validateField(fieldName);
    });

    field.addEventListener('input', function () {
      var errorEl = form.querySelector('[data-error-for="' + fieldName + '"]');
      if (errorEl && errorEl.textContent) {
        validateField(fieldName);
      }
    });

    if (field.type === 'checkbox') {
      field.addEventListener('change', function () {
        validateField(fieldName);
      });
    }
  });

  // ====== 验证码倒计时 ======
  var countdown = 0;
  var countdownTimer = null;

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', function () {
      if (countdown > 0) return;

      var phoneField = form.querySelector('[name="phone"]');
      if (!phoneField || !phoneField.value.trim()) {
        showError('phone', '请先输入手机号');
        phoneField.focus();
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(phoneField.value.trim())) {
        showError('phone', '请输入有效的手机号码');
        phoneField.focus();
        return;
      }

      clearError('phone');

      countdown = 60;
      sendCodeBtn.disabled = true;
      sendCodeBtn.textContent = countdown + 's 后重发';

      countdownTimer = setInterval(function () {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownTimer);
          sendCodeBtn.disabled = false;
          sendCodeBtn.textContent = '获取验证码';
        } else {
          sendCodeBtn.textContent = countdown + 's 后重发';
        }
      }, 1000);
    });
  }

  // ====== 表单提交 ======
  function encodeFormData(formData) {
    return Array.from(formData.entries())
      .map(function (pair) {
        return encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);
      })
      .join('&');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      var firstError = form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      var formData = new FormData(form);

      var response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: encodeFormData(formData)
      });

      if (response.ok) {
        window.location.href = '/success.html';
      } else {
        throw new Error('提交失败');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      alert('提交失败，请稍后重试。如在本地预览，请部署到 Netlify 后再测试表单功能。');
    }
  });

  // ====== 平滑滚动 ======
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ====== 滚动动画 ======
  var observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.course-card, .stat-card').forEach(function (card, index) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out ' + (index * 0.08) + 's, transform 0.6s ease-out ' + (index * 0.08) + 's';
    observer.observe(card);
  });

  // ====== 输入限制 ======
  var phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^\d]/g, '');
    });
  }

  var codeInput = form.querySelector('[name="code"]');
  if (codeInput) {
    codeInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^\d]/g, '');
    });
  }

  // 初始化渲染
  renderSelectedCourses();
});
