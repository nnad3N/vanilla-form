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
				sanitizedValues = {
					...sanitizedValues,
					[createKey(element.name)]: DOMPurify.sanitize(element.value),
				};
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
		formInputs.forEach((formInput) => formInput.addEventListener('focus', afterSubmit));
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

	const onError = ({ message }) => {
		formInputs.forEach((formInput) => formInput.addEventListener('focus', afterSubmit));
		formStatus.innerText = message;
		formStatus.classList.add('error');
		formStatus.classList.add('active');
		formButton.classList.add('error');

		formInputs.forEach((input) => {
			input.value = '';
			input.classList.add('error');
			formButton.disabled = true;
		});
	};

	const afterSubmit = () => {
		const successes = document.querySelectorAll('.success');
		const errors = document.querySelectorAll('.error');
		formStatus.innerText = '';
		formStatus.className = '';
		formButton.disabled = false;

		successes.forEach((success) => success.classList.remove('success'));
		errors.forEach((error) => error.classList.remove('error'));

		formInputs.forEach((input) => input.removeEventListener('focus', afterSubmit));
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		validateFormValues();

		if (errors.length > 0) {
			console.error('Form contains errors');
			return;
		}

		const formValues = handleFormValues();

		try {
			const res = await fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: `form-name=${form.getAttribute('name')}&${new URLSearchParams(formValues).toString()}`,
			});

			if (!res.ok) {
				throw new Error('Coś poszło nie tak :/');
			}

			onSuccess();
		} catch (error) {
			onError(error);
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
