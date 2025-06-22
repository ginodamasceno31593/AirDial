// script.js
class DialerApp {
    constructor() {
        this.currentNumber = '';
        this.isInCall = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Keypad buttons
        document.querySelectorAll('.keypad-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const value = e.currentTarget.dataset.value;
                this.addDigit(value);
                this.playKeypadSound();
            });
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clear();
        });

        // Call button
        document.getElementById('callBtn').addEventListener('click', () => {
            this.makeCall();
        });

        // Hangup button
        document.getElementById('hangupBtn').addEventListener('click', () => {
            this.endCall();
        });

        // SMS/MMS buttons
        document.getElementById('smsBtn').addEventListener('click', () => {
            this.sendSMS();
        });

        document.getElementById('mmsBtn').addEventListener('click', () => {
            this.sendMMS();
        });

        // Contact input
        document.getElementById('contactInput').addEventListener('input', (e) => {
            this.currentNumber = e.target.value;
            this.updateDisplay();
        });

        // Country select
        document.getElementById('countrySelect').addEventListener('change', () => {
            this.updateDisplay();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9' || e.key === '*' || e.key === '#') {
                this.addDigit(e.key);
                this.playKeypadSound();
            } else if (e.key === 'Backspace') {
                this.backspace();
            } else if (e.key === 'Enter') {
                this.makeCall();
            } else if (e.key === 'Escape') {
                this.clear();
            }
        });
    }

    addDigit(digit) {
        if (this.isInCall) return;
        
        this.currentNumber += digit;
        document.getElementById('contactInput').value = this.currentNumber;
        this.updateDisplay();
    }

    backspace() {
        if (this.isInCall) return;
        
        this.currentNumber = this.currentNumber.slice(0, -1);
        document.getElementById('contactInput').value = this.currentNumber;
        this.updateDisplay();
    }

    clear() {
        if (this.isInCall) return;
        
        this.currentNumber = '';
        document.getElementById('contactInput').value = '';
        this.updateDisplay();
    }

    formatPhoneNumber(number) {
        // Simple US phone number formatting
        const cleaned = number.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
        
        if (match) {
            return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
        }
        
        if (cleaned.length > 0) {
            return `+${cleaned}`;
        }
        
        return '+1 561 609 1285'; // Default number
    }

    updateDisplay() {
        const formattedNumber = this.formatPhoneNumber(this.currentNumber);
        document.getElementById('formattedNumber').textContent = formattedNumber;
        
        // Update call button state
        const callBtn = document.getElementById('callBtn');
        callBtn.disabled = this.currentNumber.length === 0 && !this.isInCall;
    }

    makeCall() {
        if (this.isInCall) return;
        
        const numberToCall = this.currentNumber || '15616091285';
        
        this.isInCall = true;
        document.getElementById('callStatus').classList.remove('hidden');
        document.querySelector('.status-text').textContent = `Calling ${this.formatPhoneNumber(numberToCall)}...`;
        
        // Simulate call connection after 2 seconds
        setTimeout(() => {
            if (this.isInCall) {
                document.querySelector('.status-text').textContent = 'Connected';
            }
        }, 2000);
        
        this.showNotification('Call initiated', 'success');
    }

    endCall() {
        this.isInCall = false;
        document.getElementById('callStatus').classList.add('hidden');
        this.showNotification('Call ended', 'info');
    }

    sendSMS() {
        const number = this.currentNumber || '15616091285';
        this.showNotification(`SMS sent to ${this.formatPhoneNumber(number)}`, 'success');
    }

    sendMMS() {
        const number = this.currentNumber || '15616091285';
        this.showNotification(`MMS sent to ${this.formatPhoneNumber(number)}`, 'success');
    }

    playKeypadSound() {
        // Create a short beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Keypad sound not supported');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#00d4aa' : type === 'error' ? '#dc2626' : '#2196f3'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DialerApp();
});

// Service Worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}