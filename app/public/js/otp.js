const inputs = document.querySelectorAll('.otp-input input');
const timerDisplay = document.getElementById('timer');
const resendButton = document.getElementById('resendButton');
let timeLeft = 300; // 5 minutes in seconds
let timerId;

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.otp-input input');

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length > 1) {
                // In case someone pastes here, split and fill
                const values = input.value.split('');
                input.value = values[0]; // first value goes here
                values.slice(1).forEach((val, i) => {
                    if (inputs[index + 1 + i]) {
                        inputs[index + 1 + i].value = val;
                    }
                });
            }

            // Auto-focus next
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        // Handle paste (ideal place)
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            const digits = pasted.replace(/\D/g, '').split('').slice(0, inputs.length);

            digits.forEach((digit, i) => {
                inputs[i].value = digit;
            });

            // Focus last filled input
            if (digits.length > 0) {
                const lastInput = inputs[Math.min(digits.length, inputs.length) - 1];
                lastInput.focus();
            }
        });
    });
});


function startTimer() {
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerDisplay.textContent = "Code expired";
            resendButton.disabled = false;
            inputs.forEach(input => input.disabled = true);
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeLeft--;
        }
    }, 1000);
}

function resendOTP() {
    // Here you would typically call your backend to resend the OTP
    alert("New OTP sent!");
    timeLeft = 300;
    inputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    resendButton.disabled = true;
    inputs[0].focus();
    clearInterval(timerId);
    startTimer();
}

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.slice(0, 1);
        }
        if (e.target.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value) {
            if (index > 0) {
                inputs[index - 1].focus();
            }
        }
        if (e.key === 'e') {
            e.preventDefault();
        }
    });
});

function verifyOTP() {
    const otp = Array.from(inputs).map(input => input.value).join('');

    if (otp.length === 6) {
        if (timeLeft > 0) {
            alert(`Verifying OTP: ${otp}`);
            // Here you would typically send the OTP to your server for verification
            fetch('/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.verified) {
                        alert('OTP verified. Redirecting to dashboard/setup profile...');

                        window.location.href = '/user/setup-profile';
                    } else {
                        alert('Invalid OTP. Please try again.');
                    }
                })
                .catch(error => {
                    alert(error.message);
                });
            // If the OTP is correct, you would redirect the user to the dashboard
        } else {
            alert('OTP has expired. Please request a new one.');
        }
    } else {
        alert('Please enter a 6-digit OTP');
    }
}

startTimer();