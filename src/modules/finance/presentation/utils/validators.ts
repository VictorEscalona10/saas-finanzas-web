export const validators = {
    username: (value: string): string => {
        if (!value.trim()) return 'El nombre de usuario es requerido';
        if (value.length < 3) return 'Mínimo 3 caracteres';
        if (value.length > 20) return 'Máximo 20 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y guión bajo';
        return '';
    },

    email: (value: string): string => {
        if (!value.trim()) return 'El correo electrónico es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo electrónico inválido';
        return '';
    },

    password: (value: string): string => {
        if (!value) return 'La contraseña es requerida';
        if (value.length < 6) return 'Mínimo 6 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return '';
    },

    confirmPassword: (value: string, password: string): string => {
        if (!value) return 'Confirma tu contraseña';
        if (value !== password) return 'Las contraseñas no coinciden';
        return '';
    },

    calculatePasswordStrength: (value: string): { score: number; message: string; color: string } => {
        let strength = 0;
        if (value.length >= 8) strength++;
        if (value.length >= 12) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[^A-Za-z0-9]/.test(value)) strength++;

        const strengthMap = {
            0: { score: 0, message: 'Muy débil', color: '#f43f5e' },
            1: { score: 1, message: 'Débil', color: '#f97316' },
            2: { score: 2, message: 'Media', color: '#eab308' },
            3: { score: 3, message: 'Fuerte', color: '#22c55e' },
            4: { score: 4, message: 'Muy fuerte', color: '#10b981' },
            5: { score: 5, message: 'Excelente', color: '#06b6d4' }
        };

        return strengthMap[Math.min(strength, 5) as keyof typeof strengthMap];
    }
};