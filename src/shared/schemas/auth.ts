import { z } from 'zod';

const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('El formato del correo electrónico no es válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(50, 'El nombre debe tener máximo 50 caracteres'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('El formato del correo electrónico no es válido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        passwordRegex,
        'La contraseña debe incluir mayúsculas, minúsculas y un número o carácter especial'
      ),
    repeat_password: z.string().min(1, 'Debes repetir la contraseña'),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: 'Las contraseñas no coinciden',
    path: ['repeat_password'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
