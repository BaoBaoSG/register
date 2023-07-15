// Đối tượng Validator
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGourpSelector).querySelector('.form-message');
        var errorMessage;
        // lấy ra các rule của selector
        var rules = selectorRules[rule.selector]
        // lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rule[i](
                        document.querySelector(rule.selector)
                    );
                    break;
                default:

            }
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGourpSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGourpSelector).classList.remove('invalid');
        }
        return !errorMessage
    }
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Thực hiện lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với js
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formAvalues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {});

                    options.onSubmit(formAvalues);
                    // Trường hợp submit với hành vi mặc định
                } else {
                    formElement.submit();
                }
            }

        }
        // lặp qua mỗi rule và xử lý (lắng nghe sự kiện, blur, input, ...)
        options.rules.forEach(function (rule) {
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }
                // Xử lý trường hợp khi user nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGourpSelector).querySelector(options.errorSelector);

                    errorElement.innerText = '';
                    getParent(inputElement, options.formGourpSelector).classList.remove('invalid');
                }

            }
        });
    }
}

// Định nghĩa các rule
// Nguyên tắc rules
// 1. khi có lỗi > Trả ra msg lỗi
// 2. Khi hợp lệ > không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email'
        }
    };
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    };
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}