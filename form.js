const form = document.querySelector('#form');
const formInputs = document.querySelectorAll('.form-control');
const formButton = document.querySelector('#form-button');
const formStatus = document.querySelector('#form-status');

const init = () => {
	let errors = [];

	const validateFormValues = () => {
		const { sanitizedFormName, sanitizedFormSurname, sanitizedFormEmail, sanitizedFormMessage } = sanitizeFormValues();

		if (validator.isEmpty(sanitizedFormName)) {
			createError('formName', 'Imię jest wymagane');
		} else if (!validator.isAlpha(sanitizedFormName)) {
			createError('formName', 'Imię musi się składać z liter');
		} else {
			removeError('formName');
		}

		if (validator.isEmpty(sanitizedFormSurname)) {
			createError('formSurname', 'Nazwisko jest wymagane');
		} else {
			removeError('formSurname');
		}

		if (!validator.isEmail(sanitizedFormEmail)) {
			createError('formEmail', 'Podaj prawidłowego maila');
		} else {
			removeError('formEmail');
		}

		if (validator.isEmpty(sanitizedFormMessage)) {
			createError('formMessage', 'Napisz nam jakąś wiadomość');
		} else {
			removeError('formMessage');
		}
	};

	const sanitizeFormValues = () => {
		let sanitizedValues = {};

		for (const key in form.elements) {
			const element = form[key];
			if (element?.name?.includes('form')) {
				sanitizedValues = { ...sanitizedValues, [createKey(element.name)]: DOMPurify.sanitize(element.value) };
			}
		}

		return sanitizedValues;
	};

	const createKey = (s) => {
		return 'sanitized' + s[0].toUpperCase() + s.slice(1);
	};

	const createError = (place, err) => {
		const error = errors.filter((e) => e.place === place)[0];
		const index = errors.findIndex((e) => e.place === error?.place);

		if (index !== -1) {
			const errorElement = form[place].parentElement.querySelector('.error-text');
			errorElement.innerText = err;

			errors[index] = {
				errorElement,
				place,
				err,
			};
		} else {
			formButton.disabled = true;
			formButton.classList.add('error');

			const element = form[place];
			element.classList.add('error');

			const errorElement = document.createElement('div');
			errorElement.classList = 'error-text';
			element.parentElement.appendChild(errorElement);
			errorElement.innerText = err;

			errors = [
				...errors,
				{
					errorElement,
					place,
					err,
				},
			];
		}
	};

	const removeError = (place) => {
		const error = errors.filter((e) => e.place === place)[0];
		errors = errors.filter((e) => e.place !== place);

		error?.errorElement.remove();

		form[place].classList.remove('error');

		if (errors.length === 0) {
			formButton.disabled = false;
			formButton.classList.remove('error');
		}
	};

	const onSuccess = () => {
		formInputs.forEach((formInput) => formInput.addEventListener('focus', afterSuccess));
		formStatus.innerText = 'Formularz został wysłany!';
		formStatus.classList.add('success');
		formStatus.classList.add('active');
		formButton.classList.add('success');

		formInputs.forEach((input) => {
			input.value = '';
			input.classList.add('success');
			formButton.disabled = true;
		});
	};

	const afterSuccess = () => {
		const successes = document.querySelectorAll('.success');
		formStatus.innerText = '';
		formStatus.className = '';
		formButton.disabled = false;

		successes.forEach((success) => success.classList.remove('success'));

		formInputs.forEach((input) => input.removeEventListener('focus', afterSuccess));
	};

	const handleFormValues = () => {
		errors.length > 0 && validateFormValues();

		const { sanitizedFormName, sanitizedFormSurname, sanitizedFormEmail, sanitizedFormMessage } = sanitizeFormValues();

		return {
			formName: sanitizedFormName,
			formSurname: sanitizedFormSurname,
			formEmail: sanitizedFormEmail,
			formMessage: sanitizedFormMessage,
		};
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		validateFormValues();

		if (errors.length > 0) {
			console.error('Form contains errors');
		} else {
			const formValues = handleFormValues();

			fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: `form-name=${form.getAttribute('name')}&${new URLSearchParams(formValues).toString()}`,
			})
				.then(() => onSuccess())
				.catch((error) => console.error(error));
		}
	};

	return {
		handleFormValues,
		handleSubmit,
	};
};

const { handleFormValues, handleSubmit } = init();

form.addEventListener('input', handleFormValues);
form.addEventListener('submit', handleSubmit);
